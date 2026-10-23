from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


def utc_now() -> datetime:
    """Helper returning timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


class User(Base):
    """Registered tenant account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    agreements = relationship("Agreement", back_populates="user", cascade="all, delete-orphan")


class Agreement(Base):
    """Uploaded rental agreement document containing the extracted text and analysis state."""
    __tablename__ = "agreements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Nullable for guest scans
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # e.g. "application/pdf", "image/jpeg", "image/png"
    raw_text = Column(Text, nullable=False)
    status = Column(String(50), default="extracted", nullable=False)  # "extracted", "analyzed", "failed"
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="agreements")
    clauses = relationship("Clause", back_populates="agreement", cascade="all, delete-orphan")


class Clause(Base):
    """Extracted clause with categorization, risk rating, and tenant explanation for Stage 2."""
    __tablename__ = "clauses"

    id = Column(Integer, primary_key=True, index=True)
    agreement_id = Column(Integer, ForeignKey("agreements.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # e.g. "deposit", "rent_increase", "notice_period", etc.
    risk = Column(String(20), nullable=True)  # "low", "medium", "high"
    explanation = Column(Text, nullable=True)
    suggestion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    agreement = relationship("Agreement", back_populates="clauses")
