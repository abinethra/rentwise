from datetime import datetime
from typing import Optional, List, Literal
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
# Clause Schemas
# -------------------------------------------------------------
RiskLevel = Literal["low", "medium", "high"]

ClauseCategory = Literal[
    "deposit",
    "rent increase",
    "notice period",
    "lock-in",
    "maintenance",
    "eviction",
    "subletting",
    "other",
]


class ClauseAnalysisItem(BaseModel):
    """Single analyzed clause structure extracted from the rental agreement."""
    text: str = Field(description="The verbatim or extracted text snippet of the clause from the agreement")
    category: str = Field(
        description="Clause category: 'deposit', 'rent increase', 'notice period', 'lock-in', 'maintenance', 'eviction', 'subletting', or 'other'"
    )
    risk: RiskLevel = Field(description="Risk level for the tenant: 'low', 'medium', or 'high'")
    explanation: str = Field(description="Plain English explanation of what this clause means and why it poses this risk level")
    suggestion: str = Field(description="Practical counter-proposal, amendment, or negotiation script for the tenant")


class ClauseCreate(BaseModel):
    agreement_id: int
    text: str
    category: Optional[str] = None
    risk: Optional[str] = None
    explanation: Optional[str] = None
    suggestion: Optional[str] = None


class ClauseResponse(BaseModel):
    id: int
    agreement_id: int
    text: str
    category: Optional[str] = None
    risk: Optional[str] = None
    explanation: Optional[str] = None
    suggestion: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Gemini Analysis Schemas (Stage 2 Output Contract)
# -------------------------------------------------------------
class AgreementAnalysisResult(BaseModel):
    """
    Validated JSON contract returned by Gemini:
    {
      summary: str,
      overall_risk: 'low|medium|high',
      clauses: [{text, category, risk, explanation, suggestion}],
      missing_protections: []
    }
    """
    summary: str = Field(description="Clear, 2-3 paragraph plain-English executive summary of the lease agreement for a tenant.")
    overall_risk: RiskLevel = Field(description="Overall lease risk level: 'low', 'medium', or 'high'")
    clauses: List[ClauseAnalysisItem] = Field(
        description="List of detected clauses categorized into deposit, rent increase, notice period, lock-in, maintenance, eviction, subletting."
    )
    missing_protections: List[str] = Field(
        description="Crucial tenant protections completely absent from the agreement (e.g. deposit refund timeline, landlord maintenance responsibilities, receipt issuance, notice before landlord entry)."
    )


# -------------------------------------------------------------
# Agreement Schemas & Responses (Stage 3 Endpoints)
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


class AgreementListItemResponse(AgreementBase):
    """Summary item returned in the agreement history listing (GET /agreements)."""
    id: int
    status: str
    summary: Optional[str] = None
    overall_risk: Optional[str] = None
    clause_count: int = 0
    high_risk_count: int = 0
    medium_risk_count: int = 0
    low_risk_count: int = 0
    missing_protections_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgreementHistoryResponse(BaseModel):
    """Paginated history wrapper for GET /agreements."""
    total: int
    limit: int
    offset: int
    items: List[AgreementListItemResponse]


class AgreementReportResponse(AgreementBase):
    """Full detailed agreement report for GET /agreements/{agreement_id}."""
    id: int
    status: str
    summary: Optional[str] = None
    overall_risk: Optional[str] = None
    raw_text: Optional[str] = None
    missing_protections: List[str] = []
    clauses: List[ClauseResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
