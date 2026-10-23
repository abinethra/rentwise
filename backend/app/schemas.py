from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -------------------------------------------------------------
# User Schemas
# -------------------------------------------------------------
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=8, description="Password must be at least 8 characters")


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Clause Schemas (Prepared for Stage 2 analysis)
# -------------------------------------------------------------
class ClauseBase(BaseModel):
    text: str
    category: Optional[str] = None
    risk: Optional[str] = None  # "low", "medium", "high"
    explanation: Optional[str] = None
    suggestion: Optional[str] = None


class ClauseCreate(ClauseBase):
    agreement_id: int


class ClauseResponse(ClauseBase):
    id: int
    agreement_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Agreement Schemas (Stage 1 Output)
# -------------------------------------------------------------
class AgreementBase(BaseModel):
    filename: str
    file_type: str


class TextExtractionResponse(BaseModel):
    """Returned upon successful upload and OCR / PDF text extraction in POST /agreements."""
    agreement_id: int
    filename: str
    file_type: str
    character_count: int
    extracted_text_preview: str = Field(description="First 500 characters preview of extracted text")
    extracted_text: str = Field(description="Full extracted raw text from the document")
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgreementResponse(AgreementBase):
    id: int
    status: str
    created_at: datetime
    clauses: List[ClauseResponse] = []

    model_config = ConfigDict(from_attributes=True)
