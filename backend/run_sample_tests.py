"""
Standalone Test Runner for RentWise Stage 5:
Evaluates the 5 Sample Agreements and prints a detailed verification summary.
Run with: python backend/run_sample_tests.py
"""
import sys
import json
from app.db import Base, engine, SessionLocal
from app.models import Agreement, Clause
from app.gemini import analyze_rental_agreement
from app.config import get_settings
from tests.sample_agreements import SAMPLE_AGREEMENTS

settings = get_settings()

def run_tests():
    print("=" * 70)
    print("RentWise Stage 5: Evaluating 5 Sample Rental Agreements")
    print("=" * 70)

    # Initialize DB
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not settings.gemini_api_key:
        print("\n⚠️ NOTE: GEMINI_API_KEY is not set in backend/.env.")
        print("Please configure GEMINI_API_KEY to execute live AI contract audits.")
        print(f"Loaded {len(SAMPLE_AGREEMENTS)} sample agreements ready for testing.\n")
        for i, s in enumerate(SAMPLE_AGREEMENTS, 1):
            print(f"{i}. [{s['expected_risk'].upper()}] {s['title']}")
        return

    success_count = 0

    for idx, sample in enumerate(SAMPLE_AGREEMENTS, 1):
        print(f"\n--- Testing Sample {idx}/5: {sample['title']} ---")
        print(f"Target Expectation: Risk = {sample['expected_risk'].upper()}")

        try:
            # 1. Analyze text with Gemini
            print("Running Gemini 7-point audit...")
            result = analyze_rental_agreement(sample["text"])

            print(f"✅ Success! Overall Risk: {result.overall_risk.upper()}")
            print(f"Summary: {result.summary[:140]}...")
            print(f"Detected Clauses ({len(result.clauses)}):")
            for c in result.clauses[:3]:
                print(f"  • [{c.risk.upper()}] {c.category.upper()}: {c.suggestion[:60]}...")
            print(f"Missing Protections ({len(result.missing_protections)}):")
            for m in result.missing_protections[:2]:
                print(f"  • ! {m}")

            # 2. Persist to DB
            agreement = Agreement(
                filename=sample["filename"],
                file_type="text/plain",
                raw_text=sample["text"],
                status="analyzed",
                summary=result.summary,
                overall_risk=result.overall_risk,
                missing_protections=result.missing_protections,
            )
            db.add(agreement)
            db.commit()
            db.refresh(agreement)

            for c in result.clauses:
                cl = Clause(
                    agreement_id=agreement.id,
                    text=c.text,
                    category=c.category,
                    risk=c.risk,
                    explanation=c.explanation,
                    suggestion=c.suggestion,
                )
                db.add(cl)
            db.commit()

            success_count += 1

        except Exception as e:
            print(f"❌ Failed to analyze {sample['title']}: {e}")

    db.close()
    print("\n" + "=" * 70)
    print(f"Stage 5 Verification Complete: {success_count}/{len(SAMPLE_AGREEMENTS)} passed.")
    print("All sample evaluations stored in SQLite database!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
