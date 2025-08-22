#!/usr/bin/env python3

import requests
import json
import psycopg2
import time

def test_problem_25():
    """Test validation for problem 25"""
    problem_id = 25
    
    # Get the solution SQL
    main_conn = psycopg2.connect(
        host="localhost", port=5432, database="sql_practice",
        user="postgres", password="password"
    )
    
    with main_conn.cursor() as cur:
        cur.execute("""
            SELECT ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = %s AND ps.sql_dialect = 'postgresql'
        """, [problem_id])
        result = cur.fetchone()
        if not result:
            print("No solution found")
            return
        solution_sql = result[0]
    
    main_conn.close()
    
    print(f"Testing Problem #{problem_id} with solution:")
    print(f"  {solution_sql[:100]}...")
    
    # Test validation via API
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
            
            print(f"Result: {'✅ CORRECT' if is_correct else '❌ INCORRECT'}")
            print(f"Feedback: {feedback}")
            
            if not is_correct:
                # Show some debug info
                results = result_data.get("results", [])
                if results:
                    print(f"First result row: {json.dumps(results[0])}")
            
            return is_correct
        else:
            print(f"API Error: {data.get('error', 'Unknown error')}")
    else:
        print(f"HTTP Error: {response.status_code}")
    
    return False

if __name__ == "__main__":
    test_problem_25()