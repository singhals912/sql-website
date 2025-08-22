#!/usr/bin/env python3

import psycopg2
import requests
import json
import time
import sys

# Database connections
main_conn = psycopg2.connect(
    host="localhost", port=5432, database="sql_practice",
    user="postgres", password="password"
)

sandbox_conn = psycopg2.connect(
    host="localhost", port=5433, database="sandbox",
    user="postgres", password="password"
)

def setup_problem(problem_id):
    """Setup problem environment via API"""
    try:
        response = requests.post(
            f"http://localhost:5001/api/sql/problems/{problem_id}/setup",
            json={"dialect": "postgresql"},
            timeout=10
        )
        return response.status_code == 200
    except:
        return False

def execute_solution_in_sandbox(solution_sql):
    """Execute solution SQL in sandbox and return results"""
    try:
        with sandbox_conn.cursor() as cur:
            cur.execute(solution_sql)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            
            # Convert to list of dictionaries with string values
            result = []
            for row in rows:
                row_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert all values to strings to match API behavior
                    row_dict[col] = str(value) if value is not None else None
                result.append(row_dict)
            
            return result
    except Exception as e:
        print(f"      ❌ SQL error: {str(e)[:60]}")
        return None

def update_expected_output(problem_id, expected_output):
    """Update expected output in database"""
    try:
        with main_conn.cursor() as cur:
            cur.execute("""
                UPDATE problem_schemas 
                SET expected_output = %s::jsonb
                WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = %s) 
                AND sql_dialect = 'postgresql'
            """, [json.dumps(expected_output), problem_id])
            main_conn.commit()
            return True
    except Exception as e:
        print(f"      ❌ Update error: {str(e)[:60]}")
        return False

def main():
    # Process first 10 broken problems
    batch_problems = [3, 4, 5, 7, 9, 11, 12, 13, 14, 15]
    
    print(f"🚀 FIXING BATCH: Problems {batch_problems}")
    print("")

    # Get details for these problems
    with main_conn.cursor() as cur:
        problem_ids_str = ','.join(map(str, batch_problems))
        cur.execute(f"""
            SELECT p.numeric_id, p.title, ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE ps.sql_dialect = 'postgresql'
            AND p.numeric_id IN ({problem_ids_str})
            ORDER BY p.numeric_id
        """)
        problems = cur.fetchall()

    fixed = 0
    failed = 0

    for problem_id, title, solution_sql in problems:
        print(f"🔧 #{problem_id}: {title[:40]}...")
        
        # Setup environment
        if not setup_problem(problem_id):
            print("   ❌ Setup failed")
            failed += 1
            continue
        
        # Execute solution in sandbox
        result = execute_solution_in_sandbox(solution_sql)
        if result is None:
            print("   ❌ Execution failed")
            failed += 1
            continue
        
        # Update expected output
        if update_expected_output(problem_id, result):
            print(f"   ✅ FIXED ({len(result)} rows)")
            fixed += 1
        else:
            print("   ❌ Update failed")
            failed += 1
        
        time.sleep(0.3)

    print(f"\n📊 Batch Results: ✅{fixed} ❌{failed}")
    
    # Close connections
    main_conn.close()
    sandbox_conn.close()

if __name__ == "__main__":
    main()