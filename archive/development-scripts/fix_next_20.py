#!/usr/bin/env python3

import psycopg2
import json
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

def setup_tables_for_problem(problem_id):
    """Manually setup tables for a problem"""
    try:
        # Get schema setup SQL
        with main_conn.cursor() as cur:
            cur.execute("""
                SELECT ps.setup_sql
                FROM problems p
                JOIN problem_schemas ps ON p.id = ps.problem_id
                WHERE p.numeric_id = %s AND ps.sql_dialect = 'postgresql'
            """, [problem_id])
            result = cur.fetchone()
            if not result:
                return False
            setup_sql = result[0]
        
        # Execute setup in sandbox
        with sandbox_conn.cursor() as cur:
            # Drop existing tables first
            cur.execute("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;")
            # Execute setup SQL
            cur.execute(setup_sql)
            sandbox_conn.commit()
            return True
    except Exception as e:
        print(f"      Setup error: {str(e)[:80]}")
        return False

def execute_solution_and_get_results(problem_id, solution_sql):
    """Execute solution and get properly formatted results"""
    try:
        # Setup tables first
        if not setup_tables_for_problem(problem_id):
            return None
        
        # Execute solution
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
        print(f"      Execution error: {str(e)[:80]}")
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
        print(f"      Update error: {str(e)[:80]}")
        return False

def main():
    # Next batch: problems 26-45
    batch = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]
    
    print(f"🚀 DIRECT FIX APPROACH - Problems 26-45")
    print(f"📋 Processing: {batch}")
    print("")

    # Get problem details
    with main_conn.cursor() as cur:
        problem_ids_str = ','.join(map(str, batch))
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
        print(f"🔧 #{problem_id}: {title[:35]}...")
        
        result = execute_solution_and_get_results(problem_id, solution_sql)
        
        if result is None:
            print("   ❌ Failed")
            failed += 1
            continue
        
        if update_expected_output(problem_id, result):
            print(f"   ✅ FIXED ({len(result)} rows)")
            fixed += 1
        else:
            print("   ❌ Update failed")
            failed += 1

    print(f"\n📊 Results: ✅{fixed} ❌{failed}")
    
    # Close connections
    main_conn.close()
    sandbox_conn.close()

if __name__ == "__main__":
    main()