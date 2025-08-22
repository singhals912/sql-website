#!/usr/bin/env python3

import psycopg2
import json
import requests
import time

# Database connections
main_conn = psycopg2.connect(
    host="localhost", port=5432, database="sql_practice",
    user="postgres", password="password"
)

sandbox_conn = psycopg2.connect(
    host="localhost", port=5433, database="sandbox",
    user="postgres", password="password"
)

def debug_problem_25():
    """Debug problem 25 in detail"""
    problem_id = 25
    
    print(f"🔍 DEEP DEBUG: Problem #{problem_id}")
    
    # Get current expected output
    with main_conn.cursor() as cur:
        cur.execute("""
            SELECT ps.expected_output
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = %s AND ps.sql_dialect = 'postgresql'
        """, [problem_id])
        result = cur.fetchone()
        expected = result[0]
    
    print(f"Current expected output (first row):")
    print(f"  {json.dumps(expected[0], sort_keys=True)}")
    
    # Execute a simple test query to see what the API returns
    test_sql = "SELECT 1 as test_col"
    
    response = requests.post(
        "http://localhost:5001/api/execute/sql",
        json={
            "sql": test_sql,
            "dialect": "postgresql",
            "problemNumericId": problem_id
        },
        headers={"X-Session-ID": f"debug_{int(time.time())}"},
        timeout=5
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            api_result = data.get("data", {}).get("results", [])
            print(f"API test result: {json.dumps(api_result[0])}")
            print(f"API result keys: {list(api_result[0].keys())}")
            print(f"API result types: {[(k, type(v).__name__) for k, v in api_result[0].items()]}")
    
    # Compare the string representations exactly
    expected_str = json.dumps(expected[0], sort_keys=True)
    
    print(f"\nExpected JSON string:")
    print(f"  {expected_str}")
    print(f"Length: {len(expected_str)}")
    
    # Show character by character for first 100 chars
    print(f"\nFirst 100 chars:")
    for i, char in enumerate(expected_str[:100]):
        print(f"{i:2d}: '{char}' ({ord(char)})")

def main():
    debug_problem_25()
    
    # Close connections
    main_conn.close()
    sandbox_conn.close()

if __name__ == "__main__":
    main()