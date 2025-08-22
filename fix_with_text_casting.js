// Fix by modifying the solution SQL to cast all columns to text
const { Pool } = require('pg');

const mainPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sql_practice',
    password: 'password',
    port: 5432,
});

const brokenProblems = [25, 28, 29, 33, 43, 44, 50, 53, 59, 61, 70];

async function fixProblemWithTextCasting(problemId) {
    try {
        console.log(`🔧 Problem #${problemId}...`);
        
        // Get current solution SQL
        const result = await mainPool.query(`
            SELECT ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        if (result.rows.length === 0) {
            console.log('   ❌ No solution found');
            return false;
        }
        
        const originalSql = result.rows[0].solution_sql;
        
        // Wrap the original SQL with text casting
        // This approach gets the column names first, then builds a new query with ::text casts
        const modifiedSql = `
            WITH original_result AS (
                ${originalSql}
            ),
            column_info AS (
                SELECT jsonb_object_keys(to_jsonb(t.*)) as col_name
                FROM original_result t
                LIMIT 1
            )
            SELECT 
                ${originalSql.includes('installation_id') ? 'installation_id::text as installation_id,' : ''}
                ${originalSql.includes('efficiency_rating') ? 'efficiency_rating::text as efficiency_rating,' : ''}
                ${originalSql.includes('avg_daily_production') ? 'avg_daily_production::text as avg_daily_production,' : ''}
                ${originalSql.includes('performance_category') ? 'performance_category::text as performance_category,' : ''}
                ${originalSql.includes('algorithm_id') ? 'algorithm_id::text as algorithm_id,' : ''}
                ${originalSql.includes('trade_count') ? 'trade_count::text as trade_count,' : ''}
                ${originalSql.includes('success_rate') ? 'success_rate::text as success_rate,' : ''}
                ${originalSql.includes('avg_profit_per_trade') ? 'avg_profit_per_trade::text as avg_profit_per_trade,' : ''}
                ${originalSql.includes('risk_category') ? 'risk_category::text as risk_category,' : ''}
                ${originalSql.includes('client_id') ? 'client_id::text as client_id,' : ''}
                ${originalSql.includes('prime_brokerage_revenue') ? 'prime_brokerage_revenue::text as prime_brokerage_revenue,' : ''}
                ${originalSql.includes('securities_lending_revenue') ? 'securities_lending_revenue::text as securities_lending_revenue,' : ''}
                ${originalSql.includes('total_revenue') ? 'total_revenue::text as total_revenue,' : ''}
                ${originalSql.includes('client_tier') ? 'client_tier::text as client_tier,' : ''}
                ${originalSql.includes('sustainable_asset_class') ? 'sustainable_asset_class::text as sustainable_asset_class,' : ''}
                ${originalSql.includes('total_assets') ? 'total_assets::text as total_assets,' : ''}
                ${originalSql.includes('esg_score') ? 'esg_score::text as esg_score,' : ''}
                ${originalSql.includes('impact_category') ? 'impact_category::text as impact_category,' : ''}
                ${originalSql.includes('movie_id') ? 'movie_id::text as movie_id,' : ''}
                ${originalSql.includes('recommendation_score') ? 'recommendation_score::text as recommendation_score,' : ''}
                ${originalSql.includes('genre') ? 'genre::text as genre,' : ''}
                ${originalSql.includes('content_type') ? 'content_type::text as content_type,' : ''}
                ${originalSql.includes('viewership_score') ? 'viewership_score::text as viewership_score,' : ''}
                ${originalSql.includes('engagement_rating') ? 'engagement_rating::text as engagement_rating,' : ''}
                ${originalSql.includes('strategy_tier') ? 'strategy_tier::text as strategy_tier,' : ''}
                ${originalSql.includes('strategy_id') ? 'strategy_id::text as strategy_id,' : ''}
                ${originalSql.includes('annual_return') ? 'annual_return::text as annual_return,' : ''}
                ${originalSql.includes('sharpe_ratio') ? 'sharpe_ratio::text as sharpe_ratio,' : ''}
                ${originalSql.includes('max_drawdown') ? 'max_drawdown::text as max_drawdown,' : ''}
                ${originalSql.includes('performance_tier') ? 'performance_tier::text as performance_tier,' : ''}
                ${originalSql.includes('avg_session_duration') ? 'avg_session_duration::text as avg_session_duration,' : ''}
                ${originalSql.includes('customer_id') ? 'customer_id::text as customer_id,' : ''}
                ${originalSql.includes('month') ? 'month::text as month,' : ''}
                ${originalSql.includes('total_spent') ? 'total_spent::text as total_spent,' : ''}
                ${originalSql.includes('spending_tier') ? 'spending_tier::text as spending_tier,' : ''}
                ${originalSql.includes('private_banking_tier') ? 'private_banking_tier::text as private_banking_tier,' : ''}
                ${originalSql.includes('avg_portfolio_value') ? 'avg_portfolio_value::text as avg_portfolio_value,' : ''}
                ${originalSql.includes('client_segment') ? 'client_segment::text as client_segment,' : ''}
                ${originalSql.includes('loan_id') ? 'loan_id::text as loan_id,' : ''}
                ${originalSql.includes('credit_score') ? 'credit_score::text as credit_score,' : ''}
                ${originalSql.includes('loan_amount') ? 'loan_amount::text as loan_amount,' : ''}
                ${originalSql.includes('risk_score') ? 'risk_score::text as risk_score,' : ''}
                ${originalSql.includes('risk_tier') ? 'risk_tier::text as risk_tier,' : ''}
                *::text
            FROM (${originalSql}) t
        `.trim().replace(/,\s*\*::text/, '').replace(/SELECT\s*,/, 'SELECT');
        
        // This is getting too complex. Let me try a simpler approach.
        // Just use a universal text casting approach
        const simplifiedSql = `
            SELECT jsonb_agg(
                jsonb_build_object(
                    ${Object.keys(await getColumnNames(originalSql)).map(col => 
                        `'${col}', ${col}::text`
                    ).join(',\n                    ')}
                )
            ) as result
            FROM (${originalSql}) t
        `;
        
        console.log('   ✅ Problem identified but needs manual fix');
        return true;
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message.substring(0, 100)}`);
        return false;
    }
}

async function getColumnNames(sql) {
    // This is a helper to get column names, but it's complex
    // Let me try a different approach altogether
    return {};
}

async function main() {
    console.log('🚀 ANALYZING BROKEN PROBLEMS');
    console.log('');
    
    // Let me just manually check what columns each problem has
    for (const problemId of [25]) {
        await fixProblemWithTextCasting(problemId);
    }
    
    await mainPool.end();
}

main().catch(console.error);