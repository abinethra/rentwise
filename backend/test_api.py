"""
Quick test script to verify Stage 1 endpoints.
Run with: python backend/test_api.py
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("Testing GET /health ...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/health")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print("Response:", json.dumps(data, indent=2))
            assert resp.status == 200
            print(" Health check passed!\n")
    except Exception as e:
        print(f" Health check failed (ensure server is running at {BASE_URL}): {e}")

if __name__ == "__main__":
    test_health()
