import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.gemini import extract_text_from_photo
from app.rate_limiter import check_rate_limit
from app.services.pdf_service import extract_text_from_pdf
from app.services import agreement_service
from app.schemas import (
    TextExtractionResponse,
    AgreementReportResponse,
    AgreementHistoryResponse,
    ClauseResponse,
)

logger = logging.getLogger("rentwise.routes.agreements")
settings = get_settings()

router = APIRouter(prefix="/agreements", tags=["Agreements"])

ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "photo",
    "image/jpg": "photo",
    "image/png": "photo",
    "image/webp": "photo",
}

CHUNK_SIZE = 64 * 1024  # 64 KB memory-safe streaming chunks


def detect_file_type_magic_bytes(header: bytes) -> str:
    """Validates file signatures (magic bytes) to prevent MIME spoofing attacks."""
    if header.startswith(b"%PDF-"):
        return "pdf"
    if header.startswith(b"\xff\xd8\xff"):
        return "photo"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "photo"
    if len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return "photo"
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Invalid file signature (magic bytes). The file content does not match genuine PDF or image data.",
    )


async def read_and_validate_file_stream(file: UploadFile, max_bytes: int) -> tuple[bytes, str]:
    """Streams file in 64KB chunks and validates magic bytes on the first chunk."""
    chunks = []
    total_bytes = 0
    first_chunk = True
    doc_category = ""

    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break

        if first_chunk:
            doc_category = detect_file_type_magic_bytes(chunk)
            first_chunk = False

        total_bytes += len(chunk)
        if total_bytes > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {max_bytes // (1024 * 1024)}MB. Upload stream terminated.",
            )
        chunks.append(chunk)

    if total_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is completely empty.",
        )

    return b"".join(chunks), doc_category


@router.post(
    "",
    response_model=TextExtractionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload rental agreement (PDF or Photo) and extract text",
    dependencies=[Depends(check_rate_limit)],
)
async def upload_and_extract_agreement(
    file: UploadFile = File(..., description="Rental agreement PDF file or document photo (PNG/JPEG/WEBP)"),
    db: Session = Depends(get_db),
):
    """Handles upload validation, delegates text extraction, and persists agreement via agreement_service."""
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed types are PDF, JPEG, PNG, and WEBP.",
        )

    file_bytes, doc_category = await read_and_validate_file_stream(file, settings.max_file_size_bytes)

    if doc_category == "pdf":
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        try:
            extracted_text = extract_text_from_photo(file_bytes, content_type)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Vision OCR processing error: {str(e)}",
            ) from e

    db_agreement = agreement_service.create_agreement_from_upload(
        db=db,
        filename=file.filename or "uploaded_agreement",
        file_type=content_type,
        raw_text=extracted_text,
    )

    return TextExtractionResponse(
        agreement_id=db_agreement.id,
        filename=db_agreement.filename,
        file_type=db_agreement.file_type,
        character_count=len(extracted_text),
        extracted_text_preview=extracted_text[:500] + ("..." if len(extracted_text) > 500 else ""),
        extracted_text=extracted_text,
        status=db_agreement.status,
        created_at=db_agreement.created_at,
    )


@router.post(
    "/{agreement_id}/analyze",
    response_model=AgreementReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Perform Stage 2 Gemini analysis on an extracted agreement",
    dependencies=[Depends(check_rate_limit)],
)
def analyze_agreement_endpoint(
    agreement_id: int,
    db: Session = Depends(get_db),
):
    """Delegates agreement review and clause persistence to agreement_service."""
    analyzed_agreement = agreement_service.analyze_and_store_agreement(db, agreement_id)
    return AgreementReportResponse.model_validate(analyzed_agreement)


@router.get(
    "",
    response_model=AgreementHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get paginated history of all uploaded and analyzed agreements",
)
def get_agreement_history(
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
    risk: Optional[str] = Query(default=None, description="Filter by overall risk: low, medium, high"),
    status_filter: Optional[str] = Query(default=None, alias="status", description="Filter by status: extracted, analyzed, failed"),
    db: Session = Depends(get_db),
):
    """Delegates history queries and metric aggregations to agreement_service."""
    total, items = agreement_service.get_agreement_history(
        db=db,
        limit=limit,
        offset=offset,
        risk=risk,
        status_filter=status_filter,
    )
    return AgreementHistoryResponse(total=total, limit=limit, offset=offset, items=items)


@router.get(
    "/{agreement_id}",
    response_model=AgreementReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get full detailed analysis report for a specific agreement",
)
def get_agreement_report(
    agreement_id: int,
    db: Session = Depends(get_db),
):
    """Fetches agreement report via agreement_service."""
    agreement = agreement_service.get_agreement_by_id(db, agreement_id)
    return AgreementReportResponse.model_validate(agreement)


@router.get(
    "/{agreement_id}/clauses",
    response_model=List[ClauseResponse],
    status_code=status.HTTP_200_OK,
    summary="Query clauses of an agreement filtered by category or risk",
)
def get_agreement_clauses(
    agreement_id: int,
    category: Optional[str] = Query(default=None, description="Filter by category: deposit, notice period, rent increase, etc."),
    risk: Optional[str] = Query(default=None, description="Filter by risk: low, medium, high"),
    db: Session = Depends(get_db),
):
    """Fetches filtered clauses via agreement_service."""
    return agreement_service.get_agreement_clauses(db, agreement_id, category, risk)


@router.delete(
    "/{agreement_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an agreement and its analyzed clauses from history",
)
def delete_agreement(
    agreement_id: int,
    db: Session = Depends(get_db),
):
    """Deletes agreement and its clauses via agreement_service."""
    agreement_service.delete_agreement(db, agreement_id)
    return {"deleted": True, "agreement_id": agreement_id}
