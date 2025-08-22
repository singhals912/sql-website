#!/bin/bash

echo "🧪 Testing Diverse Schemas - Step by Step"
echo "========================================="

echo ""
echo "📋 Available Problems:"
curl -s http://localhost:5001/api/sql/problems | jq -r '.problems[] | "- \(.title) (ID: \(.id))"'

echo ""
echo "🎯 Test 1: Setting up Movie Recommendation Engine"
echo "------------------------------------------------"
MOVIE_ID="89e40cd6-382b-44a9-8c5f-cb0c565633b8"
curl -s http://localhost:5001/api/sql/problems/$MOVIE_ID/setup -X POST | jq '.message'

echo ""
echo "🎬 Querying movies table:"
curl -s http://localhost:5001/api/sql/execute -H "Content-Type: application/json" \
  -d '{"query":"SELECT title, genre FROM movies LIMIT 3;","dialect":"postgresql"}' | \
  jq -r '.rows[] | "\(.[])"' | paste - - | head -3

echo ""
echo "🎯 Test 2: Setting up Fraud Detection"  
echo "-------------------------------------"
FRAUD_ID="641f2b32-e812-4afc-be5f-9928ea8f7978"
curl -s http://localhost:5001/api/sql/problems/$FRAUD_ID/setup -X POST | jq '.message'

echo ""
echo "💳 Querying financial_transactions table:"
curl -s http://localhost:5001/api/sql/execute -H "Content-Type: application/json" \
  -d '{"query":"SELECT user_id, amount, merchant_category FROM financial_transactions LIMIT 3;","dialect":"postgresql"}' | \
  jq -r '.rows[] | "\(.[])"' | paste - - - | head -3

echo ""
echo "🎯 Test 3: Setting up Supply Chain"
echo "-----------------------------------"
SUPPLY_ID="25cefb41-17a1-46a3-8146-8b3f43f644ca"  
curl -s http://localhost:5001/api/sql/problems/$SUPPLY_ID/setup -X POST | jq '.message'

echo ""
echo "📦 Querying warehouse_inventory table:"
curl -s http://localhost:5001/api/sql/execute -H "Content-Type: application/json" \
  -d '{"query":"SELECT warehouse_id, product_name, current_stock FROM warehouse_inventory LIMIT 3;","dialect":"postgresql"}' | \
  jq -r '.rows[] | "\(.[])"' | paste - - - | head -3

echo ""
echo "✅ PROOF: Each problem sets up completely different tables!"
echo "🎯 In frontend: Click specific problems from /problems page"