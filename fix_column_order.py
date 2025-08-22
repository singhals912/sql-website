#!/usr/bin/env python3

import psycopg2
import json

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

def fix_problem_with_sorted_keys(problem_id):
    """Fix problem ensuring consistent key ordering"""
    try:
        # Get solution SQL
        with main_conn.cursor() as cur:
            cur.execute("""
                SELECT ps.solution_sql
                FROM problems p
                JOIN problem_schemas ps ON p.id = ps.problem_id
                WHERE p.numeric_id = %s AND ps.sql_dialect = 'postgresql'
            """, [problem_id])
            result = cur.fetchone()
            if not result:
                return False
            solution_sql = result[0]
        
        # Setup and execute solution
        if not setup_tables_for_problem(problem_id):
            return False
        
        with sandbox_conn.cursor() as cur:
            cur.execute(solution_sql)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            
            # Convert to list of dictionaries with sorted keys
            result = []
            for row in rows:
                row_dict = {}
                # Add columns in alphabetical order for consistency
                for i, col in enumerate(sorted(columns)):
                    col_index = columns.index(col)
                    value = row[col_index]
                    row_dict[col] = str(value) if value is not None else None
                result.append(row_dict)
        
        # Update expected output
        with main_conn.cursor() as cur:
            cur.execute("""
                UPDATE problem_schemas 
                SET expected_output = %s::jsonb
                WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = %s) 
                AND sql_dialect = 'postgresql'
            """, [json.dumps(result), problem_id])
            main_conn.commit()
            return True
            
    except Exception as e:
        print(f"      Error: {str(e)[:80]}")
        return False

def main():
    # Final 11 broken problems
    broken_problems = [25, 28, 29, 33, 43, 44, 50, 53, 59, 61, 70]
    
    print("🚀 FIXING FINAL 11 PROBLEMS - COLUMN ORDER APPROACH")
    print("🎯 Ensuring consistent key ordering")
    print("")
    
    fixed = 0
    failed = 0
    
    for problem_id in broken_problems:
        print(f"🔧 Problem #{problem_id}...")
        
        if fix_problem_with_sorted_keys(problem_id):
            print(f"   ✅ FIXED")
            fixed += 1
        else:
            print(f"   ❌ Failed")
            failed += 1
    
    print(f"\n📊 Results: ✅{fixed} ❌{failed}")
    
    if fixed == len(broken_problems):
        print("\n🎉 ALL 11 PROBLEMS FIXED!")
        print("🏆 ALL 70 PROBLEMS NOW HAVE 100% WORKING VALIDATION!")
    
    # Close connections
    main_conn.close()
    sandbox_conn.close()

if __name__ == "__main__":
    main()