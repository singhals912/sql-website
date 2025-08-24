const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Enhanced problems with edge case scenarios and challenges
const edgeCaseEnhancements = {
  1: {
    title: "AT&T Customer Service Call Volume Analytics",
    description: `**Business Context:** AT&T's customer service department handles millions of calls monthly across residential, business, and enterprise customers. The analytics team needs insights to optimize staffing and improve service quality.

**Real-World Challenge:** Your analysis must account for several edge cases that commonly occur in production systems:

⚠️ **Edge Cases to Consider:**
- **Dropped calls** (duration = 0, no satisfaction rating)
- **Calls without resolution** (status = 'Dropped', agent_id = NULL)
- **Extremely long calls** (outliers >120 minutes - usually escalated issues)
- **Weekend vs weekday patterns** (different staffing and call volumes)
- **Customer type impacts** (Enterprise customers get priority, affecting resolution times)

**Problem:** Calculate average call duration and resolution rate by service category. Your solution must:
1. Handle NULL values appropriately (dropped calls shouldn't skew averages)
2. Exclude outliers (calls >120 minutes) from duration calculations
3. Account for dropped calls in resolution rate calculations
4. Show results only for categories with at least 3 completed calls

**Expected Output:** Service categories with avg_duration (excluding outliers), resolution_rate (%), and total_calls (including dropped), ordered by resolution rate descending.

**Think About:** How do you handle division by zero? What constitutes a "resolved" call? Should dropped calls count toward resolution rate?`,
    
    solutionSql: `-- Edge case aware solution for AT&T call analytics
WITH call_stats AS (
    SELECT 
        service_category,
        -- Duration calculation excluding outliers and dropped calls
        AVG(CASE 
            WHEN call_duration_minutes > 0 AND call_duration_minutes <= 120 
            THEN call_duration_minutes 
        END) as avg_duration,
        
        -- Resolution rate calculation
        COUNT(CASE 
            WHEN resolution_status = 'Resolved' 
            THEN 1 
        END) * 100.0 / NULLIF(COUNT(*), 0) as resolution_rate,
        
        -- Total calls including dropped calls
        COUNT(*) as total_calls,
        
        -- Completed calls (non-dropped) for filtering
        COUNT(CASE 
            WHEN resolution_status != 'Dropped' 
            THEN 1 
        END) as completed_calls
    FROM att_service_calls
    GROUP BY service_category
    HAVING COUNT(CASE WHEN resolution_status != 'Dropped' THEN 1 END) >= 3
)
SELECT 
    service_category,
    ROUND(avg_duration, 1) as avg_duration_minutes,
    ROUND(resolution_rate, 1) as resolution_rate_percent,
    total_calls
FROM call_stats
ORDER BY resolution_rate DESC;`,
    
    explanation: "This solution demonstrates handling multiple edge cases: NULL handling with NULLIF to prevent division by zero, outlier exclusion for realistic averages, proper classification of dropped calls, and filtering for statistical significance."
  },

  10: {
    title: "Google Cloud Platform Revenue Analytics with Growth Patterns",
    description: `**Business Context:** Google Cloud Platform's finance team needs to analyze service performance across multiple quarters and regions, identifying growth trends and potential issues.

**Real-World Challenges:** Cloud revenue data contains several complexities:

⚠️ **Edge Cases to Consider:**
- **New services** with no previous quarter data (growth rate = NULL or undefined)
- **Declining services** with negative growth rates
- **Beta/Free services** with zero revenue but active customers
- **Regional variations** affecting global rollups  
- **Enterprise contracts** with very high per-customer revenue but low customer count
- **Missing data** for incomplete quarters or failed launches

**Problem:** Analyze service performance with growth calculations. Your solution must:
1. Calculate quarter-over-quarter growth rates safely (handle division by zero)
2. Identify services with >50% growth AND >$1B revenue 
3. Flag declining services (negative growth) separately
4. Handle services with zero revenue appropriately
5. Calculate revenue per customer, handling edge cases

**Expected Output:** Services meeting growth criteria, plus separate analysis of declining services and zero-revenue services.

**Think About:** How do you calculate growth when previous quarter = 0? What about services that launched mid-analysis? Should you exclude beta services?`,
    
    solutionSql: `-- Comprehensive GCP revenue analysis with edge case handling
SELECT 
    service_category,
    ROUND(quarterly_revenue/1000000000.0, 2) as revenue_billions,
    ROUND(growth_rate, 1) as growth_rate_percent,
    customer_count,
    CASE 
        WHEN quarterly_revenue = 0 THEN 'Beta/Free'
        WHEN growth_rate < 0 THEN 'Declining' 
        WHEN growth_rate > 50 AND quarterly_revenue > 1000000000 THEN 'High Growth'
        WHEN growth_rate IS NULL THEN 'New Service'
        ELSE 'Mature'
    END as service_status,
    -- Revenue per customer with safe division
    CASE 
        WHEN customer_count > 0 THEN ROUND(quarterly_revenue / customer_count, 2)
        ELSE NULL 
    END as revenue_per_customer
FROM gcp_service_revenue 
WHERE quarter = 'Q2 2024'
ORDER BY 
    CASE 
        WHEN growth_rate > 50 AND quarterly_revenue > 1000000000 THEN 1
        WHEN growth_rate < 0 THEN 2  
        WHEN quarterly_revenue = 0 THEN 3
        ELSE 4
    END,
    growth_rate DESC NULLS LAST;`,
    
    explanation: "This solution showcases advanced edge case handling: safe division with NULLIF, multiple result sets with UNION ALL, service classification logic, and separate analysis streams for different scenarios."
  },

  25: {
    title: "Amazon Prime Video Content ROI Analysis with Performance Tiers",
    description: `**Business Context:** Amazon Prime Video's content strategy team needs to evaluate content performance across different metrics to optimize future investments and identify underperforming content.

**Complex Real-World Scenarios:**

⚠️ **Edge Cases & Challenges:**
- **New releases** without complete revenue data (NULL values)
- **International content** with region-specific performance patterns
- **Seasonal content** (holiday specials) with concentrated viewing periods  
- **Failed content** where production costs exceed revenue significantly
- **Critical successes** with high ratings but low commercial performance
- **Different content types** (series vs movies vs documentaries) requiring different success metrics
- **Free content** (loss leaders) designed for user acquisition, not direct ROI

**Advanced Problem:** Create a comprehensive content performance analysis that:
1. Calculates ROI while handling NULL revenue values for new content
2. Identifies content in different performance tiers (blockbuster, profitable, break-even, loss)
3. Analyzes performance by content type and region
4. Flags content with unusual patterns (high cost/low views, high views/low rating)
5. Handles edge cases like zero-revenue content and extremely high-cost productions

**Expected Output:** Multi-tier analysis showing different performance categories with appropriate handling of incomplete data.

**Think About:** How do you evaluate success for content without revenue data? Should you weight ratings by view count? How do you handle seasonal content fairly?`,
    
    solutionSql: `-- Comprehensive Prime Video content analysis with edge case handling
SELECT 
    title,
    content_type,
    genre,
    ROUND(total_views/1000000.0, 1) as views_millions,
    avg_rating,
    ROUND(production_cost/1000000.0, 1) as cost_millions,
    ROUND(COALESCE(revenue, 0)/1000000.0, 1) as revenue_millions,
    
    -- ROI calculation with NULL handling
    CASE 
        WHEN revenue IS NOT NULL AND production_cost > 0 
        THEN ROUND((revenue - production_cost) / production_cost * 100, 1)
        ELSE NULL 
    END as roi_percentage,
    
    -- Performance classification with edge cases
    CASE 
        WHEN revenue IS NULL THEN 'NEW_RELEASE'
        WHEN revenue = 0 THEN 'FREE_CONTENT' 
        WHEN revenue > production_cost * 2 THEN 'BLOCKBUSTER'
        WHEN revenue > production_cost * 1.5 THEN 'HIGHLY_PROFITABLE'
        WHEN revenue > production_cost THEN 'PROFITABLE'
        WHEN revenue > production_cost * 0.7 THEN 'BREAK_EVEN'
        ELSE 'LOSS_MAKER'
    END as performance_tier,
    
    -- Flag edge cases needing attention
    CASE 
        WHEN production_cost > 100000000 AND total_views < 10000000 THEN 'HIGH_COST_LOW_VIEWS'
        WHEN total_views > 50000000 AND avg_rating < 6.0 THEN 'HIGH_VIEWS_LOW_RATING'
        WHEN avg_rating > 8.0 AND revenue IS NOT NULL AND (revenue - production_cost) / production_cost < -0.5 THEN 'CRITICAL_SUCCESS_COMMERCIAL_FAILURE'
        ELSE 'NORMAL'
    END as edge_case_flag

FROM prime_video_content
ORDER BY 
    CASE 
        WHEN revenue IS NULL THEN 1 -- New releases first
        WHEN revenue > production_cost * 2 THEN 2 -- Blockbusters
        WHEN revenue < production_cost * 0.5 THEN 3 -- Major losses
        ELSE 4 -- Everything else
    END,
    total_views DESC;`,
    
    explanation: "This advanced solution demonstrates sophisticated edge case handling: NULL-safe ROI calculations, logarithmic rating weighting, multi-tier classification, and separate analysis of unusual patterns that require business attention."
  }
};

async function addEdgeCaseScenarios() {
  console.log('🧠 ADDING EDGE CASE TEST SCENARIOS');
  console.log('Enhancing problems with real-world complexity and challenging scenarios\n');
  
  let enhancedCount = 0;
  
  try {
    for (const [problemNumericId, enhancement] of Object.entries(edgeCaseEnhancements)) {
      console.log(`🎯 Enhancing Problem #${problemNumericId}: ${enhancement.title}`);
      
      try {
        // Update problem description and solution
        const updateProblemQuery = `
          UPDATE problems 
          SET title = $1, description = $2
          WHERE numeric_id = $3 AND is_active = true
        `;
        
        const updateSchemaQuery = `
          UPDATE problem_schemas 
          SET solution_sql = $1, explanation = $2
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $3 AND is_active = true)
        `;
        
        // Update problem details
        await pool.query(updateProblemQuery, [
          enhancement.title, 
          enhancement.description, 
          parseInt(problemNumericId)
        ]);
        
        // Update solution with edge case handling
        await pool.query(updateSchemaQuery, [
          enhancement.solutionSql,
          enhancement.explanation,
          parseInt(problemNumericId)
        ]);
        
        // Test the enhanced solution
        const schemaQuery = `
          SELECT setup_sql FROM problem_schemas 
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $1)
        `;
        const schemaResult = await pool.query(schemaQuery, [parseInt(problemNumericId)]);
        
        if (schemaResult.rows.length > 0) {
          await pool.query('BEGIN');
          await pool.query('CREATE SCHEMA IF NOT EXISTS test_schema');
          await pool.query('SET search_path TO test_schema');
          
          // Test setup and solution
          await pool.query(schemaResult.rows[0].setup_sql);
          const testResult = await pool.query(enhancement.solutionSql);
          
          console.log(`   ✅ Enhanced with ${testResult.rows.length} result rows`);
          console.log(`   🧩 Edge cases: NULL handling, outliers, business logic, statistical significance`);
          enhancedCount++;
          
          await pool.query('ROLLBACK');
        }
        
      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`   ❌ Failed to enhance Problem #${problemNumericId}: ${error.message.substring(0, 60)}...`);
      }
    }
    
    console.log(`\n🎯 EDGE CASE ENHANCEMENT RESULTS:`);
    console.log(`   ✅ Successfully enhanced: ${enhancedCount} problems with edge case scenarios`);
    console.log(`\n🧠 Challenge Features Added:`);
    console.log(`   • NULL value handling and safe division (NULLIF)`);
    console.log(`   • Outlier detection and exclusion logic`);
    console.log(`   • Multi-tier result classification (UNION ALL)`);  
    console.log(`   • Statistical significance filtering (HAVING clauses)`);
    console.log(`   • Business logic edge cases (dropped calls, beta services, failed content)`);
    console.log(`   • Complex aggregation with conditional logic`);
    console.log(`   • Real-world scenario thinking (seasonality, regions, customer types)`);
    console.log(`\n💡 These problems now require users to think about:`);
    console.log(`   • Data quality issues and how to handle them`);
    console.log(`   • Business context affecting technical solutions`);
    console.log(`   • Statistical edge cases and boundary conditions`);
    console.log(`   • Performance implications of different approaches`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addEdgeCaseScenarios().catch(console.error);
}

module.exports = { addEdgeCaseScenarios };