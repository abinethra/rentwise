import io
import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.gemini import extract_text_from_photo
from app.models import Agreement
from app.schemas import TextExtractionResponse

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
    Stage 1 Upload Endpoint:
    1. Validates file MIME type (PDF or image).
    2. Validates file size against MAX_FILE_SIZE_BYTES limit (treats upload as untrusted input).
    3. Extracts text using pypdf for PDFs or Gemini Vision for photos.
    4. Persists the agreement and raw text into SQLite.
    5. Returns extraction summary and text preview.
    """
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{content_type}'. Allowed types are PDF, JPEG, PNG, and WEBP.",
        )

    # Read file bytes in memory with strict size check to prevent memory exhaustion attacks
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is completely empty.",
        )

    if len(file_bytes) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.max_file_size_bytes // (1024 * 1024)}MB.",
        )

    # Route extraction by document category
    doc_category = ALLOWED_MIME_TYPES[content_type]
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
