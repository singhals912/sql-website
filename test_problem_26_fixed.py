#!/usr/bin/env python3

import requests
import json
import time

def test_problem_26():
    """Test Problem 26 after cleaning"""
    problem_id = 26
    
    # Setup the problem first
    setup_response = requests.post(
        f"http://localhost:5001/api/sql/problems/{problem_id}/setup",
        json={"dialect": "postgresql"},
        timeout=10
    )
    
    print(f"🔧 Problem #{problem_id} Setup: {setup_response.status_code}")
    
    # Test the solution
    solution_sql = """SELECT 
        asset_class,
        ROUND(CAST(portfolio_allocation * 100 AS NUMERIC), 2) as allocation_pct,
        ROUND(CAST(annual_return_rate * 100 AS NUMERIC), 2) as annual_return_pct,
        ROUND(CAST(volatility * 100 AS NUMERIC), 2) as volatility_pct,
        ROUND(CAST(sharpe_ratio AS NUMERIC), 4) as sharpe_ratio,
        ROUND(CAST(risk_score AS NUMERIC), 2) as risk_score
    FROM fidelity_portfolio_optimization 
    WHERE annual_return_rate > 0.08 AND risk_score < 15
    ORDER BY annual_return_pct DESC"""
    
    response = requests.post(
        "http://localhost:5001/api/execute/sql",
        json={
            "sql": solution_sql,
            "dialect": "postgresql",
            "problemNumericId": problem_id
        },
        headers={"X-Session-ID": f"test_{int(time.time())}"},
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            result_data = data.get("data", {})
            is_correct = result_data.get("isCorrect")
            feedback = result_data.get("feedback", "No feedback")
            results = result_data.get("results", [])
            
            print(f"✅ Query Response:")
            print(f"   Results: {len(results)} rows returned")
            print(f"   Validation: {'✅ CORRECT' if is_correct else '❌ INCORRECT'}")
            print(f"   Feedback: {feedback}")
            
            if results:
                print(f"   Data: {json.dumps(results[0])}")
            
            return is_correct
        else:
            print(f"❌ API Error: {data.get('error', 'Unknown error')}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
    
    return False

if __name__ == "__main__":
    test_problem_26()