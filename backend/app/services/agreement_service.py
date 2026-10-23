import logging
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.gemini import analyze_rental_agreement
from app.models import Agreement, Clause
from app.schemas import AgreementListItemResponse

logger = logging.getLogger("rentwise.services.agreement")


def create_agreement_from_upload(
    db: Session,
    filename: str,
    file_type: str,
    raw_text: str,
) -> Agreement:
    """Persists a new agreement and its extracted text to the database."""
    db_agreement = Agreement(
        filename=filename,
        file_type=file_type,
        raw_text=raw_text,
        status="extracted",
    )
    db.add(db_agreement)
    db.commit()
    db.refresh(db_agreement)
    return db_agreement


def get_agreement_by_id(db: Session, agreement_id: int) -> Agreement:
    """Fetches an agreement by ID or raises a 404 HTTPException."""
    agreement = db.query(Agreement).filter(Agreement.id == agreement_id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agreement #{agreement_id} not found.",
        )
    return agreement


def analyze_and_store_agreement(db: Session, agreement_id: int) -> Agreement:
    """
    Executes the Gemini analysis pipeline for an agreement:
    1. Validates that agreement text is present.
    2. Sends text to Gemini for structured JSON classification.
    3. Clears any previous clauses and inserts new categorized clauses.
    4. Updates summary, overall risk, and missing protections.
    """
    agreement = get_agreement_by_id(db, agreement_id)

    if not agreement.raw_text or not agreement.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agreement has no extracted text to analyze. Please re-upload the document.",
        )

    try:
        analysis_result = analyze_rental_agreement(agreement.raw_text)
    except Exception as e:
        logger.error(f"Analysis service failed for agreement #{agreement_id}: {str(e)}")
        agreement.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {str(e)}",
        ) from e

    # Clear previous clauses to avoid duplicate entries on re-analysis
    db.query(Clause).filter(Clause.agreement_id == agreement_id).delete()

    # Insert analyzed clauses
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

    # Update top-level agreement analysis fields
    agreement.summary = analysis_result.summary
    agreement.overall_risk = analysis_result.overall_risk
    agreement.missing_protections = analysis_result.missing_protections
    agreement.status = "analyzed"

    db.commit()
    db.refresh(agreement)
    return agreement


def get_agreement_history(
    db: Session,
    limit: int = 20,
    offset: int = 0,
    risk: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> Tuple[int, List[AgreementListItemResponse]]:
    """
    Queries agreement history with pagination and filters,
    calculating risk distribution metrics for each item.
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

    return total, items


def get_agreement_clauses(
    db: Session,
    agreement_id: int,
    category: Optional[str] = None,
    risk: Optional[str] = None,
) -> List[Clause]:
    """Queries clauses belonging to an agreement with optional category or risk filters."""
    # Verify agreement exists
    get_agreement_by_id(db, agreement_id)

    query = db.query(Clause).filter(Clause.agreement_id == agreement_id)

    if category:
        query = query.filter(Clause.category == category.lower())

    if risk:
        query = query.filter(Clause.risk == risk.lower())

    return query.all()


def delete_agreement(db: Session, agreement_id: int) -> bool:
    """Deletes an agreement and cascades to its clauses."""
    agreement = get_agreement_by_id(db, agreement_id)
    db.delete(agreement)
    db.commit()
    return True
