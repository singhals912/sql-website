#!/usr/bin/env python3

import psycopg2
import requests
import json
import time

# Database connection
main_conn = psycopg2.connect(
    host="localhost", port=5432, database="sql_practice",
    user="postgres", password="password"
)

def test_validation(problem_id, solution_sql):
    """Test validation for a single problem"""
    try:
        response = requests.post(
            "http://localhost:5001/api/execute/sql",
            json={
                "sql": solution_sql,
                "dialect": "postgresql",
                "problemNumericId": problem_id
            },
            headers={"X-Session-ID": f"test_{int(time.time())}_{problem_id}"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                result_data = data.get("data", {})
                is_correct = result_data.get("isCorrect")
                feedback = result_data.get("feedback", "No feedback")
                return is_correct, feedback
            else:
                return False, data.get("error", "API error")
        else:
            return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, f"Exception: {str(e)[:100]}"

def main():
    print("🧪 TESTING VALIDATION FOR ALL 70 PROBLEMS")
    print("🎯 Identifying which problems need fixing")
    print("")

    # Get all problems
    with main_conn.cursor() as cur:
        cur.execute("""
            SELECT p.numeric_id, p.title, ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE ps.sql_dialect = 'postgresql'
            ORDER BY p.numeric_id
        """)
        problems = cur.fetchall()

    working = 0
    broken = 0
    broken_problems = []

    for problem_id, title, solution_sql in problems:
        print(f"Testing #{problem_id}...", end=" ")
        
        is_correct, feedback = test_validation(problem_id, solution_sql)
        
        if is_correct == True:
            print("✅")
            working += 1
        else:
            print(f"❌ {feedback[:60]}")
            broken += 1
            broken_problems.append((problem_id, title, feedback))
        
        time.sleep(0.1)  # Small delay to avoid overwhelming

    print("\n" + "="*60)
    print("📊 VALIDATION TEST RESULTS")
    print("="*60)
    print(f"✅ Working: {working}/70 ({working*100//70}%)")
    print(f"❌ Broken: {broken}/70 ({broken*100//70}%)")

    if broken > 0:
        print(f"\n🔧 PROBLEMS THAT NEED FIXING ({broken} total):")
        for problem_id, title, feedback in broken_problems:
            print(f"   #{problem_id:2d}: {title[:40]:40s} | {feedback[:60]}")
        
        print(f"\n📋 BROKEN PROBLEM IDS: {[p[0] for p in broken_problems]}")
    
    if working == 70:
        print("\n🎉 ALL 70 PROBLEMS HAVE WORKING VALIDATION!")
        print("🏆 100% SUCCESS RATE ACHIEVED!")
    else:
        print(f"\n⚠️  {broken} problems still need validation fixes")

    main_conn.close()

if __name__ == "__main__":
    main()