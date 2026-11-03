import urllib.request
import json

def test_live():
    # 1. Health
    with urllib.request.urlopen('http://127.0.0.1:8000/api/health') as r:
        print("Health Status:", r.status, json.loads(r.read()))

    # 2. Analyze
    payload = {
        "text": "Deposit 1500 INR gate pass fee immediately to HR via Google Pay 9876543210. Direct joining without interview.",
        "title": "Back Office"
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/analyze',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as r:
        d = json.loads(r.read())
        print(f"Analyze Output: Prediction={d['prediction']}, RiskScore={d['risk_score']}, Signals={len(d['signals'])}")
        for s in d['signals']:
            print(f"  * [{s['severity']}] {s['signal']}: '{s['matched_text']}'")

    # 3. Model Info
    with urllib.request.urlopen('http://127.0.0.1:8000/api/model-info') as r:
        info = json.loads(r.read())
        print(f"Model Info: AutoScientist Status = '{info['autoscientist_status']}', Provider = '{info['active_provider']}'")

if __name__ == "__main__":
    test_live()

