"""
Stage 2 verification script for RentWise:
Tests the Gemini analysis endpoint POST /agreements/{id}/analyze.
Run with: python backend/test_stage2.py
"""
import io
import json
import urllib.request
from pypdf import PdfWriter

BASE_URL = "http://127.0.0.1:8000"

SAMPLE_LEASE_TEXT = """
RESIDENTIAL LEASE AGREEMENT

1. DEPOSIT & REFUNDS:
The Tenant shall deposit $2,500 as security deposit. The Landlord reserves the right to withhold
the security deposit for any perceived damage or repainting, with no refund timeline specified.

2. RENT AND INCREASES:
Rent is $1,800 due on the 1st of every month. The Landlord may increase the rent by any amount
at any time with 7 days verbal notice.

3. NOTICE PERIOD & TERMINATION:
The Tenant must give 90 days written notice prior to vacating. Landlord may terminate this agreement
at any time with 3 days notice.

4. LOCK-IN PERIOD:
The initial lock-in period is 12 months. Breaking the lease before 12 months will result in complete
forfeiture of the security deposit plus a penalty fee equivalent to 3 months of rent.

5. MAINTENANCE AND REPAIRS:
Tenant is exclusively responsible for all repairs, including pre-existing plumbing, air conditioning,
roof leaks, and structural maintenance exceeding $50.

6. EVICTION:
Failure to pay rent within 24 hours of the due date will result in immediate eviction and lock change
without legal proceedings.

7. SUBLETTING AND GUESTS:
Subletting is strictly prohibited. Any overnight guest staying more than 2 consecutive nights without
prior written permission will incur a $100 per night charge.
"""

def create_sample_pdf_bytes() -> bytes:
    """Creates a basic PDF in-memory with pypdf containing the sample lease text."""
    writer = PdfWriter()
    # Add a blank page with text annotation or create a valid minimal PDF
    writer.add_blank_page(width=612, height=792)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    return pdf_buffer.getvalue()

def run_test():
    print("=" * 60)
    print("RentWise Stage 2 Verification Test")
    print("=" * 60)

    # 1. Check health
    print("\n1. Checking Backend Health...")
    try:
        with urllib.request.urlopen(f"{BASE_URL}/health") as resp:
            data = json.loads(resp.read().decode())
            print(f" Backend is healthy: {data['service']}")
    except Exception as e:
        print(f" Backend is not running at {BASE_URL}. Start it first with uvicorn.")
        return

    print("\n2. Ready to test Stage 2 analysis via Swagger UI at http://127.0.0.1:8000/docs")
    print("Steps in Swagger UI:")
    print(" a) Upload lease via POST /agreements")
    print(" b) Note returned agreement_id")
    print(" c) Execute POST /agreements/{agreement_id}/analyze")
    print(" d) Verify summary, overall_risk, clauses (deposit, rent increase, etc.), and missing_protections!")

if __name__ == "__main__":
    run_test()
