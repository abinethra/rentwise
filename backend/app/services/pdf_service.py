import io
import logging
from fastapi import HTTPException, status
from pypdf import PdfReader

logger = logging.getLogger("rentwise.services.pdf")


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from a digital PDF file using pypdf.
    Validates that the file has extractable text pages.
    """
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
