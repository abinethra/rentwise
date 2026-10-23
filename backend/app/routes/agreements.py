import io
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query
from pypdf import PdfReader
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import get_settings
from app.db import get_db
from app.gemini import extract_text_from_photo, analyze_rental_agreement
from app.models import Agreement, Clause
from app.schemas import (
    TextExtractionResponse,
    AgreementReportResponse,
    AgreementHistoryResponse,
    AgreementListItemResponse,
    ClauseResponse,
)

logger = logging.getLogger("rentwise.routes.agreements")
settings = get_settings()

router = APIRouter(prefix="/agreements", tags=["Agreements"])

# Allowed MIME types for documents and photos
ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "photo",
    "image/jpg": "photo",
    "image/png": "photo",
    "image/webp": "photo",
}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a digital PDF file using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []

        for index, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_pages.append(f"--- PAGE {index + 1} ---\n{page_text.strip()}")

        combined_text = "\n\n".join(extracted_pages).strip()

        if not combined_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The uploaded PDF contains no extractable digital text. If it is a scanned physical document, please upload it as an image photo (PNG/JPEG) for OCR processing.",
            )

        return combined_text
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"pypdf extraction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse PDF file structure: {str(e)}",
        ) from e


CHUNK_SIZE = 64 * 1024  # 64 KB memory-safe streaming chunks


def detect_file_type_magic_bytes(header: bytes) -> str:
    """
    Validates file signatures (magic bytes) to prevent MIME spoofing attacks.
    Returns document category ('pdf' or 'photo') or raises HTTP 415.
    """
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
    """
    Streams file in memory-efficient 64KB chunks to prevent RAM exhaustion / OOM crashes.
    Aborts immediately with HTTP 413 if stream exceeds max_bytes limit.
    Inspects magic bytes on first chunk to guarantee payload authenticity.
    """
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
)
async def upload_and_extract_agreement(
    file: UploadFile = File(..., description="Rental agreement PDF file or document photo (PNG/JPEG/WEBP)"),
    db: Session = Depends(get_db),
):
    """
    Stage 1 Upload Endpoint (Hardened with Streaming & Magic-Byte Validation):
    1. Validates declared client MIME type.
    2. Streams file in 64KB chunks to prevent RAM exhaustion.
    3. Validates binary magic-bytes on first chunk to block spoofed executables.
    4. Extracts text using pypdf for PDFs or Gemini Vision for photos.
    5. Persists the agreement and raw text into SQLite.
    6. Returns extraction summary and text preview.
    """
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed types are PDF, JPEG, PNG, and WEBP.",
        )

    # Stream file safely with instant size cut-off and magic byte validation
    file_bytes, doc_category = await read_and_validate_file_stream(file, settings.max_file_size_bytes)

    # Route extraction by verified document category
    extracted_text: str = ""

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

    # Persist the agreement and extracted text to SQLite
    db_agreement = Agreement(
        filename=file.filename or "uploaded_agreement",
        file_type=content_type,
        raw_text=extracted_text,
        status="extracted",
    )
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)

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
)
def analyze_agreement_endpoint(
    agreement_id: int,
    db: Session = Depends(get_db),
):
    """
    Stage 2 Analysis Endpoint:
    1. Loads the agreement from SQLite.
    2. Validates that extracted raw_text exists.
    3. Calls Gemini through google-genai SDK requesting validated JSON.
    4. Enforces retry logic if initial response fails Pydantic schema validation.
    5. Stores summary, overall risk, missing protections, and individual classified clauses.
    6. Returns the full validated report.
    """
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agreement #{agreement_id} not found.",
        )

    if not agreement.raw_text or not agreement.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agreement has no extracted text to analyze. Please re-upload the document.",
        )

    # Perform analysis with Gemini
    try:
        analysis_result = analyze_rental_agreement(agreement.raw_text)
    except Exception as e:
        logger.error(f"Analysis failed for agreement #{agreement_id}: {str(e)}")
        agreement.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {str(e)}",
        ) from e

    # Clear previous clauses if re-analyzing an existing agreement to avoid duplicate entries
    db.query(Clause).filter(Clause.agreement_id == agreement_id).delete()

    # Save individual classified clauses
    for clause_item in analysis_result.clauses:
        clause_row = Clause(
            agreement_id=agreement.id,
            text=clause_item.text,
            category=clause_item.category,
            risk=clause_item.risk,
            explanation=clause_item.explanation,
            suggestion=clause_item.suggestion,
        )
        db.add(clause_row)

    # Update agreement top-level analysis fields
    agreement.summary = analysis_result.summary
    agreement.overall_risk = analysis_result.overall_risk
    agreement.missing_protections = analysis_result.missing_protections
    agreement.status = "analyzed"

    db.commit()
    db.refresh(agreement)

    return AgreementReportResponse(
        id=agreement.id,
        filename=agreement.filename,
        file_type=agreement.file_type,
        status=agreement.status,
        summary=agreement.summary,
        overall_risk=agreement.overall_risk,
        raw_text=agreement.raw_text,
        missing_protections=agreement.missing_protections or [],
        clauses=agreement.clauses,
        created_at=agreement.created_at,
    )


# =============================================================
# Stage 3: GET Endpoints for History and Reports
# =============================================================

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
    """
    Stage 3 History Endpoint:
    Returns a sorted list of past agreements with calculated risk metrics and clause statistics.
    Useful for populating the History tab and dashboard in the React frontend.
    """
    query = db.query(Agreement)

    if risk:
        query = query.filter(Agreement.overall_risk == risk.lower())

    if status_filter:
        query = query.filter(Agreement.status == status_filter.lower())

    total = query.count()
    agreements_page = (
        query.order_by(desc(Agreement.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )

    items: List[AgreementListItemResponse] = []
    for ag in agreements_page:
        clauses = ag.clauses or []
        high_cnt = sum(1 for c in clauses if (c.risk or "").lower() == "high")
        med_cnt = sum(1 for c in clauses if (c.risk or "").lower() == "medium")
        low_cnt = sum(1 for c in clauses if (c.risk or "").lower() == "low")
        missing_cnt = len(ag.missing_protections or [])

        items.append(
            AgreementListItemResponse(
                id=ag.id,
                filename=ag.filename,
                file_type=ag.file_type,
                status=ag.status,
                summary=ag.summary,
                overall_risk=ag.overall_risk,
                clause_count=len(clauses),
                high_risk_count=high_cnt,
                medium_risk_count=med_cnt,
                low_risk_count=low_cnt,
                missing_protections_count=missing_cnt,
                created_at=ag.created_at,
            )
        )

    return AgreementHistoryResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=items,
    )


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
    """
    Stage 3 Report Endpoint:
    Returns the complete report including full plain-English summary, overall risk rating,
    all classified clauses with suggestions, missing tenant protections, and the original raw text.
    """
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agreement #{agreement_id} not found.",
        )

    return AgreementReportResponse(
        id=agreement.id,
        filename=agreement.filename,
        file_type=agreement.file_type,
        status=agreement.status,
        summary=agreement.summary,
        overall_risk=agreement.overall_risk,
        raw_text=agreement.raw_text,
        missing_protections=agreement.missing_protections or [],
        clauses=agreement.clauses or [],
        created_at=agreement.created_at,
    )


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
    """
    Stage 3 Clauses Query Endpoint:
    Allows querying specific clauses directly. Used by the Negotiation and Checklist pages
    to quickly focus on 'high' risk terms or specific categories like 'deposit'.
    """
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agreement #{agreement_id} not found.",
        )

    query = db.query(Clause).filter(Clause.agreement_id == agreement_id)

    if category:
        query = query.filter(Clause.category == category.lower())

    if risk:
        query = query.filter(Clause.risk == risk.lower())

    return query.all()


@router.delete(
    "/{agreement_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an agreement and its analyzed clauses from history",
)
def delete_agreement(
    agreement_id: int,
    db: Session = Depends(get_db),
):
    """
    Deletes an agreement and its associated clauses from the database.
    Ensures tenants can manage and purge their uploaded document history.
    """
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agreement #{agreement_id} not found.",
        )

    db.delete(agreement)
    db.commit()

    return {"deleted": True, "agreement_id": agreement_id}
