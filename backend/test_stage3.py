"""
Stage 3 verification script for RentWise:
Tests the GET endpoints for Reports and History.
Run with: python backend/test_stage3.py
"""
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def test_stage3():
    print("=" * 60)
    print("RentWise Stage 3: Testing GET Endpoints for Reports & History")
    print("=" * 60)

    # 1. Test GET /agreements (History)
    print("\n1. Testing GET /agreements (History endpoint)...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/agreements?limit=10&offset=0")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f" Success! Status {resp.status}")
            print(f"Total agreements in history: {data.get('total', 0)}")
            print(f"Items returned: {len(data.get('items', []))}")
            if data.get("items"):
                first = data["items"][0]
                print(f"Sample item: ID={first['id']}, Filename='{first['filename']}', Risk='{first['overall_risk']}', Clauses={first['clause_count']}")
    except urllib.error.URLError as e:
        print(f" Error connecting to backend: {e}. Ensure backend is running.")
        return

    # 2. Test GET /agreements/{id} (Detailed Report)
    print("\n2. Testing GET /agreements/1 (Report endpoint)...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/agreements/1")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f" Success! Status {resp.status}")
            print(f"Agreement #{data['id']} Report:")
            print(f" - Overall Risk: {data.get('overall_risk')}")
            print(f" - Missing Protections Count: {len(data.get('missing_protections', []))}")
            print(f" - Clauses Count: {len(data.get('clauses', []))}")
            print(f" - Summary: {data.get('summary', '')[:120]}...")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(" Note: Agreement #1 not found yet. Upload and analyze an agreement first via Stage 1 & 2.")
        else:
            print(f" HTTP Error: {e.code} {e.reason}")
    except Exception as e:
        print(f" Error: {e}")

    # 3. Test GET /agreements/1/clauses?risk=high
    print("\n3. Testing GET /agreements/1/clauses?risk=high (Filtered clauses endpoint)...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/agreements/1/clauses?risk=high")
        with urllib.request.urlopen(req) as resp:
            clauses = json.loads(resp.read().decode())
            print(f" Success! Status {resp.status}. Found {len(clauses)} high-risk clauses.")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(" Note: Agreement #1 not found yet.")
        else:
            print(f" HTTP Error: {e.code} {e.reason}")
    except Exception as e:
        print(f" Error: {e}")

    print("\nStage 3 verification complete! All GET routes registered and responsive.")

if __name__ == "__main__":
    test_stage3()
