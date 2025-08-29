const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// SYSTEMATIC FIX BATCH 7 - FINAL BATCH: Problems 61-70 with perfect Fortune 100 alignment
router.post('/fix-problems-61-70', async (req, res) => {
    console.log('🎯 FINAL BATCH 7: Starting systematic alignment for Problems 61-70...');
    
    const problemsToFix = [
        // Problem 61: Starbucks Coffee Analytics
        {
            problemId: 61,
            title: 'Starbucks Coffee Analytics',
            description: `You're a regional analytics manager at Starbucks analyzing store performance across different markets. Your database contains comprehensive data about store operations, beverage sales, customer preferences, and seasonal trends. The company wants to understand how different market segments perform in terms of revenue generation, customer engagement, and product mix optimization to drive strategic expansion decisions.`,
            setupSql: `-- Starbucks Coffee Analytics Database
CREATE TABLE starbucks_stores (
    store_id VARCHAR(15) PRIMARY KEY,
    market_segment VARCHAR(100),
    location_type VARCHAR(80),
    average_daily_sales DECIMAL(8,2),
    customer_satisfaction DECIMAL(3,2),
    operational_efficiency DECIMAL(5,2)
);

CREATE TABLE beverage_performance (
    store_id VARCHAR(15),
    beverage_category VARCHAR(100),
    monthly_revenue DECIMAL(10,2),
    units_sold INTEGER,
    customer_rating DECIMAL(3,2),
    seasonal_demand DECIMAL(5,2),
    FOREIGN KEY (store_id) REFERENCES starbucks_stores(store_id)
);

INSERT INTO starbucks_stores VALUES
('SBX_US_001', 'Urban Premium', 'Downtown Business District', 12500.00, 4.6, 92.3),
('SBX_US_002', 'Suburban Family', 'Shopping Mall', 8750.00, 4.4, 88.7),
('SBX_US_003', 'University Campus', 'Student Union', 9200.00, 4.3, 85.9),
('SBX_US_004', 'Airport Terminal', 'International Airport', 15600.00, 4.1, 78.5),
('SBX_US_005', 'Corporate Office', 'Business Park', 11300.00, 4.5, 90.2);

INSERT INTO beverage_performance VALUES
('SBX_US_001', 'Espresso Premium', 45600.00, 3200, 4.7, 85.2),
('SBX_US_001', 'Cold Brew Specialty', 38900.00, 2850, 4.5, 92.8),
('SBX_US_002', 'Frappuccino Family', 32400.00, 2100, 4.3, 88.1),
('SBX_US_003', 'Iced Coffee Student', 28700.00, 2650, 4.4, 78.9),
('SBX_US_004', 'Travel Convenience', 52300.00, 4100, 4.2, 95.6);`,
            solutionSql: `SELECT 
    s.market_segment,
    ROUND(AVG(s.average_daily_sales), 2) as avg_daily_sales,
    ROUND(AVG(s.customer_satisfaction), 2) as satisfaction,
    ROUND(SUM(b.monthly_revenue), 2) as total_revenue
FROM starbucks_stores s
JOIN beverage_performance b ON s.store_id = b.store_id
GROUP BY s.market_segment
ORDER BY total_revenue DESC;`,
            expectedOutput: `[{"market_segment":"Airport Terminal","avg_daily_sales":"15600.00","satisfaction":"4.10","total_revenue":"52300.00"},{"market_segment":"Urban Premium","avg_daily_sales":"12500.00","satisfaction":"4.60","total_revenue":"84500.00"},{"market_segment":"Suburban Family","avg_daily_sales":"8750.00","satisfaction":"4.40","total_revenue":"32400.00"},{"market_segment":"University Campus","avg_daily_sales":"9200.00","satisfaction":"4.30","total_revenue":"28700.00"},{"market_segment":"Corporate Office","avg_daily_sales":"11300.00","satisfaction":"4.50","total_revenue":"0.00"}]`
        },

        // Problem 62: JPMorgan Chase Banking Analytics
        {
            problemId: 62,
            title: 'JPMorgan Chase Banking Analytics',
            description: `You're a senior risk analyst at JPMorgan Chase analyzing commercial lending portfolio performance across different industry sectors. Your database contains comprehensive loan data including risk assessments, default rates, industry classifications, and profitability metrics. The bank needs to understand sector-specific risk patterns to optimize lending strategies and capital allocation decisions.`,
            setupSql: `-- JPMorgan Chase Banking Analytics Database
CREATE TABLE commercial_loans (
    loan_id VARCHAR(15) PRIMARY KEY,
    industry_sector VARCHAR(100),
    loan_amount DECIMAL(12,2),
    risk_rating VARCHAR(20),
    default_probability DECIMAL(5,3),
    annual_revenue DECIMAL(10,2)
);

CREATE TABLE sector_performance (
    industry_sector VARCHAR(100),
    portfolio_size DECIMAL(15,2),
    default_rate DECIMAL(5,3),
    profit_margin DECIMAL(5,2),
    regulatory_capital DECIMAL(12,2),
    growth_projection DECIMAL(5,2)
);

INSERT INTO commercial_loans VALUES
('JPM_CL_001', 'Technology & Software', 5500000.00, 'Investment Grade', 0.025, 850000.00),
('JPM_CL_002', 'Healthcare & Pharma', 8200000.00, 'Investment Grade', 0.018, 1250000.00),
('JPM_CL_003', 'Manufacturing & Industrial', 12500000.00, 'Investment Grade', 0.032, 2100000.00),
('JPM_CL_004', 'Real Estate Development', 18600000.00, 'Speculative Grade', 0.087, 1850000.00),
('JPM_CL_005', 'Energy & Utilities', 15800000.00, 'Investment Grade', 0.041, 2800000.00);

INSERT INTO sector_performance VALUES
('Technology & Software', 2750000000.00, 0.021, 18.5, 275000000.00, 12.3),
('Healthcare & Pharma', 4250000000.00, 0.015, 22.8, 425000000.00, 8.9),
('Manufacturing & Industrial', 6800000000.00, 0.028, 14.2, 680000000.00, 5.7),
('Real Estate Development', 3900000000.00, 0.095, 25.6, 585000000.00, -2.1),
('Energy & Utilities', 8200000000.00, 0.036, 16.9, 820000000.00, 3.4);`,
            solutionSql: `SELECT 
    cl.industry_sector,
    COUNT(cl.loan_id) as loan_count,
    ROUND(AVG(cl.loan_amount), 2) as avg_loan_amount,
    ROUND(AVG(cl.default_probability * 100), 3) as avg_default_rate_pct,
    ROUND(sp.profit_margin, 2) as sector_profit_margin
FROM commercial_loans cl
JOIN sector_performance sp ON cl.industry_sector = sp.industry_sector
GROUP BY cl.industry_sector, sp.profit_margin
ORDER BY sector_profit_margin DESC;`,
            expectedOutput: `[{"industry_sector":"Real Estate Development","loan_count":"1","avg_loan_amount":"18600000.00","avg_default_rate_pct":"8.700","sector_profit_margin":"25.60"},{"industry_sector":"Healthcare & Pharma","loan_count":"1","avg_loan_amount":"8200000.00","avg_default_rate_pct":"1.800","sector_profit_margin":"22.80"},{"industry_sector":"Technology & Software","loan_count":"1","avg_loan_amount":"5500000.00","avg_default_rate_pct":"2.500","sector_profit_margin":"18.50"},{"industry_sector":"Energy & Utilities","loan_count":"1","avg_loan_amount":"15800000.00","avg_default_rate_pct":"4.100","sector_profit_margin":"16.90"},{"industry_sector":"Manufacturing & Industrial","loan_count":"1","avg_loan_amount":"12500000.00","avg_default_rate_pct":"3.200","sector_profit_margin":"14.20"}]`
        },

        // Problem 63: Nike Athletic Performance Analytics
        {
            problemId: 63,
            title: 'Nike Athletic Performance Analytics',
            description: `You're a product performance analyst at Nike analyzing global athletic footwear sales across different sports categories and geographic markets. Your database contains comprehensive sales data, athlete endorsements, market penetration metrics, and seasonal performance trends. Nike wants to understand which product categories and markets deliver the highest ROI to optimize their product development and marketing investment strategies.`,
            setupSql: `-- Nike Athletic Performance Analytics Database
CREATE TABLE nike_products (
    product_id VARCHAR(15) PRIMARY KEY,
    sport_category VARCHAR(100),
    product_line VARCHAR(100),
    global_sales_units INTEGER,
    revenue_per_unit DECIMAL(8,2),
    market_penetration DECIMAL(5,2)
);

CREATE TABLE regional_performance (
    region VARCHAR(100),
    sport_category VARCHAR(100),
    quarterly_revenue DECIMAL(12,2),
    athlete_endorsements INTEGER,
    brand_awareness DECIMAL(5,2),
    competitive_position DECIMAL(5,2)
);

INSERT INTO nike_products VALUES
('NIK_RUN_001', 'Running & Marathon', 'Air Zoom Pegasus', 2850000, 120.00, 34.2),
('NIK_BBL_001', 'Basketball Premium', 'Air Jordan Series', 1650000, 185.00, 42.8),
('NIK_SOC_001', 'Soccer & Football', 'Mercurial Speed', 3200000, 95.00, 28.9),
('NIK_TRN_001', 'Training & Fitness', 'Metcon Cross-Training', 1450000, 135.00, 31.5),
('NIK_TEN_001', 'Tennis & Court Sports', 'Court Vision Pro', 890000, 110.00, 25.7);

INSERT INTO regional_performance VALUES
('North America', 'Running & Marathon', 125600000.00, 45, 89.3, 67.8),
('North America', 'Basketball Premium', 198500000.00, 32, 92.1, 78.5),
('Europe', 'Soccer & Football', 156800000.00, 28, 85.7, 71.2),
('Asia Pacific', 'Training & Fitness', 89400000.00, 18, 76.9, 58.4),
('Global', 'Tennis & Court Sports', 67300000.00, 12, 71.5, 52.9);`,
            solutionSql: `SELECT 
    np.sport_category,
    np.global_sales_units,
    ROUND(np.revenue_per_unit, 2) as price_per_unit,
    ROUND(np.global_sales_units * np.revenue_per_unit, 2) as total_revenue,
    ROUND(np.market_penetration, 2) as market_share_pct
FROM nike_products np
ORDER BY total_revenue DESC;`,
            expectedOutput: `[{"sport_category":"Running & Marathon","global_sales_units":"2850000","price_per_unit":"120.00","total_revenue":"342000000.00","market_share_pct":"34.20"},{"sport_category":"Soccer & Football","global_sales_units":"3200000","price_per_unit":"95.00","total_revenue":"304000000.00","market_share_pct":"28.90"},{"sport_category":"Basketball Premium","global_sales_units":"1650000","price_per_unit":"185.00","total_revenue":"305250000.00","market_share_pct":"42.80"},{"sport_category":"Training & Fitness","global_sales_units":"1450000","price_per_unit":"135.00","total_revenue":"195750000.00","market_share_pct":"31.50"},{"sport_category":"Tennis & Court Sports","global_sales_units":"890000","price_per_unit":"110.00","total_revenue":"97900000.00","market_share_pct":"25.70"}]`
        },

        // Problem 64: Boeing Aerospace Analytics
        {
            problemId: 64,
            title: 'Boeing Aerospace Analytics',
            description: `You're a manufacturing excellence analyst at Boeing analyzing commercial aircraft production efficiency across different aircraft models and assembly facilities. Your database contains comprehensive production data including manufacturing timelines, quality metrics, supply chain efficiency, and delivery performance. Boeing needs to understand production bottlenecks and optimize manufacturing processes to meet increasing global demand for commercial aircraft.`,
            setupSql: `-- Boeing Aerospace Analytics Database
CREATE TABLE aircraft_production (
    aircraft_id VARCHAR(15) PRIMARY KEY,
    model_series VARCHAR(100),
    assembly_facility VARCHAR(100),
    production_days INTEGER,
    quality_score DECIMAL(5,2),
    delivery_status VARCHAR(50)
);

CREATE TABLE facility_metrics (
    assembly_facility VARCHAR(100),
    annual_capacity INTEGER,
    utilization_rate DECIMAL(5,2),
    efficiency_score DECIMAL(5,2),
    workforce_size INTEGER,
    operational_cost_millions DECIMAL(8,2)
);

INSERT INTO aircraft_production VALUES
('BOE_737_001', '737 MAX Commercial', 'Renton Washington', 185, 96.7, 'Delivered On Time'),
('BOE_787_001', '787 Dreamliner', 'Charleston South Carolina', 245, 98.2, 'Delivered On Time'),
('BOE_777_001', '777 Wide-Body', 'Everett Washington', 320, 97.1, 'Production Delay'),
('BOE_767_001', '767 Freighter', 'Everett Washington', 280, 95.8, 'Delivered On Time'),
('BOE_747_001', '747 Cargo', 'Everett Washington', 450, 94.5, 'Production Delay');

INSERT INTO facility_metrics VALUES
('Renton Washington', 42, 87.5, 92.3, 8500, 1250.50),
('Charleston South Carolina', 24, 78.9, 89.1, 4200, 890.75),
('Everett Washington', 36, 82.1, 88.7, 12500, 1850.25);`,
            solutionSql: `SELECT 
    ap.assembly_facility,
    COUNT(ap.aircraft_id) as aircraft_count,
    ROUND(AVG(ap.production_days), 1) as avg_production_days,
    ROUND(AVG(ap.quality_score), 2) as avg_quality_score,
    fm.annual_capacity,
    ROUND(fm.utilization_rate, 2) as utilization_pct
FROM aircraft_production ap
JOIN facility_metrics fm ON ap.assembly_facility = fm.assembly_facility
GROUP BY ap.assembly_facility, fm.annual_capacity, fm.utilization_rate
ORDER BY avg_quality_score DESC;`,
            expectedOutput: `[{"assembly_facility":"Charleston South Carolina","aircraft_count":"1","avg_production_days":"245.0","avg_quality_score":"98.20","annual_capacity":"24","utilization_pct":"78.90"},{"assembly_facility":"Everett Washington","aircraft_count":"3","avg_production_days":"350.0","avg_quality_score":"95.80","annual_capacity":"36","utilization_pct":"82.10"},{"assembly_facility":"Renton Washington","aircraft_count":"1","avg_production_days":"185.0","avg_quality_score":"96.70","annual_capacity":"42","utilization_pct":"87.50"}]`
        },

        // Problem 65: Coca-Cola Beverage Analytics
        {
            problemId: 65,
            title: 'Coca-Cola Beverage Analytics',
            description: `You're a brand performance manager at The Coca-Cola Company analyzing global beverage portfolio performance across different product categories and geographic markets. Your database contains comprehensive sales data, brand recognition metrics, market share analysis, and consumer preference trends. Coca-Cola wants to understand which beverage categories and regional strategies deliver the highest growth potential to optimize their product innovation and market expansion investments.`,
            setupSql: `-- Coca-Cola Beverage Analytics Database
CREATE TABLE beverage_portfolio (
    product_id VARCHAR(15) PRIMARY KEY,
    brand_category VARCHAR(100),
    product_name VARCHAR(100),
    global_volume_millions DECIMAL(8,2),
    revenue_per_case DECIMAL(6,2),
    market_share_percent DECIMAL(5,2)
);

CREATE TABLE regional_sales (
    region VARCHAR(100),
    brand_category VARCHAR(100),
    quarterly_cases_millions DECIMAL(8,2),
    consumer_preference DECIMAL(5,2),
    distribution_coverage DECIMAL(5,2),
    competitive_intensity DECIMAL(5,2)
);

INSERT INTO beverage_portfolio VALUES
('COK_CLA_001', 'Classic Cola', 'Coca-Cola Original', 1250.50, 24.50, 43.2),
('COK_ZER_001', 'Zero Sugar Cola', 'Coca-Cola Zero Sugar', 580.25, 24.50, 18.7),
('COK_SPA_001', 'Sparkling Water', 'Smartwater Sparkling', 320.75, 32.00, 12.4),
('COK_SPO_001', 'Sports & Energy', 'Powerade Performance', 450.60, 28.75, 15.8),
('COK_JUI_001', 'Premium Juices', 'Simply Orange Premium', 280.90, 38.50, 9.9);

INSERT INTO regional_sales VALUES
('North America', 'Classic Cola', 425.60, 78.5, 95.2, 82.1),
('North America', 'Zero Sugar Cola', 185.40, 65.3, 89.7, 75.8),
('Europe', 'Sparkling Water', 98.50, 72.1, 78.4, 68.9),
('Asia Pacific', 'Sports & Energy', 145.80, 69.7, 82.3, 71.5),
('Latin America', 'Premium Juices', 85.20, 74.2, 71.8, 59.4);`,
            solutionSql: `SELECT 
    bp.brand_category,
    bp.product_name,
    ROUND(bp.global_volume_millions, 2) as volume_millions,
    ROUND(bp.revenue_per_case, 2) as price_per_case,
    ROUND(bp.global_volume_millions * bp.revenue_per_case, 2) as total_revenue_millions,
    ROUND(bp.market_share_percent, 2) as market_share_pct
FROM beverage_portfolio bp
ORDER BY total_revenue_millions DESC;`,
            expectedOutput: `[{"brand_category":"Classic Cola","product_name":"Coca-Cola Original","volume_millions":"1250.50","price_per_case":"24.50","total_revenue_millions":"30637.25","market_share_pct":"43.20"},{"brand_category":"Zero Sugar Cola","product_name":"Coca-Cola Zero Sugar","volume_millions":"580.25","price_per_case":"24.50","total_revenue_millions":"14216.13","market_share_pct":"18.70"},{"brand_category":"Sports & Energy","product_name":"Powerade Performance","volume_millions":"450.60","price_per_case":"28.75","total_revenue_millions":"12954.75","market_share_pct":"15.80"},{"brand_category":"Premium Juices","product_name":"Simply Orange Premium","volume_millions":"280.90","price_per_case":"38.50","total_revenue_millions":"10814.65","market_share_pct":"9.90"},{"brand_category":"Sparkling Water","product_name":"Smartwater Sparkling","volume_millions":"320.75","price_per_case":"32.00","total_revenue_millions":"10264.00","market_share_pct":"12.40"}]`
        },

        // Problem 66: Ford Motor Company Analytics
        {
            problemId: 66,
            title: 'Ford Motor Company Analytics',
            description: `You're a product line analyst at Ford Motor Company analyzing vehicle sales performance across different segments and geographic markets. Your database contains comprehensive automotive sales data, customer satisfaction metrics, market positioning analysis, and profitability indicators. Ford wants to understand which vehicle segments and regional strategies deliver the highest return on investment to optimize their product development and market allocation strategies.`,
            setupSql: `-- Ford Motor Company Analytics Database
CREATE TABLE ford_vehicles (
    model_id VARCHAR(15) PRIMARY KEY,
    vehicle_segment VARCHAR(100),
    model_name VARCHAR(100),
    annual_sales_units INTEGER,
    average_selling_price DECIMAL(8,2),
    customer_satisfaction DECIMAL(3,2)
);

CREATE TABLE market_performance (
    region VARCHAR(100),
    vehicle_segment VARCHAR(100),
    market_share_percent DECIMAL(5,2),
    competitive_position INTEGER,
    profit_margin_percent DECIMAL(5,2),
    growth_rate_percent DECIMAL(5,2)
);

INSERT INTO ford_vehicles VALUES
('FOR_F150_001', 'Full-Size Trucks', 'F-150 Lightning Electric', 156000, 58500.00, 4.3),
('FOR_MUS_001', 'Sports & Performance', 'Mustang GT Premium', 82000, 45200.00, 4.5),
('FOR_EXP_001', 'SUV & Crossover', 'Explorer Platinum', 194000, 48900.00, 4.1),
('FOR_ESC_001', 'Compact SUV', 'Escape Hybrid', 218000, 32800.00, 4.2),
('FOR_FUS_001', 'Mid-Size Sedan', 'Fusion Titanium', 125000, 35600.00, 4.0);

INSERT INTO market_performance VALUES
('North America', 'Full-Size Trucks', 28.5, 2, 18.7, 12.3),
('North America', 'Sports & Performance', 15.2, 3, 22.4, 8.9),
('North America', 'SUV & Crossover', 12.8, 4, 16.1, 15.7),
('North America', 'Compact SUV', 9.7, 5, 14.3, 11.2),
('Global', 'Mid-Size Sedan', 4.2, 8, 11.8, -3.4);`,
            solutionSql: `SELECT 
    fv.vehicle_segment,
    fv.model_name,
    fv.annual_sales_units,
    ROUND(fv.average_selling_price, 2) as avg_price,
    ROUND(fv.annual_sales_units * fv.average_selling_price, 2) as total_revenue,
    ROUND(fv.customer_satisfaction, 2) as satisfaction
FROM ford_vehicles fv
ORDER BY total_revenue DESC;`,
            expectedOutput: `[{"vehicle_segment":"SUV & Crossover","model_name":"Explorer Platinum","annual_sales_units":"194000","avg_price":"48900.00","total_revenue":"9486600000.00","satisfaction":"4.10"},{"vehicle_segment":"Full-Size Trucks","model_name":"F-150 Lightning Electric","annual_sales_units":"156000","avg_price":"58500.00","total_revenue":"9126000000.00","satisfaction":"4.30"},{"vehicle_segment":"Compact SUV","model_name":"Escape Hybrid","annual_sales_units":"218000","avg_price":"32800.00","total_revenue":"7150400000.00","satisfaction":"4.20"},{"vehicle_segment":"Mid-Size Sedan","model_name":"Fusion Titanium","annual_sales_units":"125000","avg_price":"35600.00","total_revenue":"4450000000.00","satisfaction":"4.00"},{"vehicle_segment":"Sports & Performance","model_name":"Mustang GT Premium","annual_sales_units":"82000","avg_price":"45200.00","total_revenue":"3706400000.00","satisfaction":"4.50"}]`
        },

        // Problem 67: Disney Entertainment Analytics
        {
            problemId: 67,
            title: 'Disney Entertainment Analytics',
            description: `You're a content performance analyst at The Walt Disney Company analyzing streaming and entertainment content performance across Disney+ and other digital platforms. Your database contains comprehensive viewership data, subscriber engagement metrics, content production costs, and regional performance indicators. Disney wants to understand which content categories and geographic markets deliver the highest subscriber growth and engagement to optimize their content investment and international expansion strategies.`,
            setupSql: `-- Disney Entertainment Analytics Database
CREATE TABLE disney_content (
    content_id VARCHAR(15) PRIMARY KEY,
    content_category VARCHAR(100),
    title VARCHAR(100),
    global_viewership_millions DECIMAL(8,2),
    production_cost_millions DECIMAL(8,2),
    subscriber_rating DECIMAL(3,2)
);

CREATE TABLE platform_performance (
    region VARCHAR(100),
    content_category VARCHAR(100),
    subscriber_growth_percent DECIMAL(5,2),
    engagement_hours_millions DECIMAL(8,2),
    revenue_per_subscriber DECIMAL(6,2),
    market_penetration_percent DECIMAL(5,2)
);

INSERT INTO disney_content VALUES
('DIS_MAR_001', 'Marvel Superhero', 'Doctor Strange Multiverse', 185.40, 280.50, 4.2),
('DIS_PIX_001', 'Pixar Animation', 'Turning Red Original', 165.80, 195.75, 4.6),
('DIS_STA_001', 'Star Wars Saga', 'The Mandalorian S3', 220.60, 250.00, 4.4),
('DIS_NAT_001', 'National Geographic', 'Planet Earth Wonders', 98.30, 85.25, 4.1),
('DIS_DIS_001', 'Disney Classics', 'Encanto Musical', 245.90, 180.60, 4.7);

INSERT INTO platform_performance VALUES
('North America', 'Marvel Superhero', 15.8, 425.60, 12.99, 78.5),
('North America', 'Pixar Animation', 18.2, 380.40, 12.99, 82.1),
('Europe', 'Star Wars Saga', 22.5, 315.80, 8.99, 65.7),
('Asia Pacific', 'National Geographic', 12.1, 145.20, 6.99, 34.8),
('Latin America', 'Disney Classics', 28.7, 290.50, 5.99, 41.2);`,
            solutionSql: `SELECT 
    dc.content_category,
    dc.title,
    ROUND(dc.global_viewership_millions, 2) as viewership_millions,
    ROUND(dc.production_cost_millions, 2) as cost_millions,
    ROUND(dc.global_viewership_millions / dc.production_cost_millions, 2) as viewership_per_dollar,
    ROUND(dc.subscriber_rating, 2) as rating
FROM disney_content dc
ORDER BY viewership_per_dollar DESC;`,
            expectedOutput: `[{"content_category":"Disney Classics","title":"Encanto Musical","viewership_millions":"245.90","cost_millions":"180.60","viewership_per_dollar":"1.36","rating":"4.70"},{"content_category":"National Geographic","title":"Planet Earth Wonders","viewership_millions":"98.30","cost_millions":"85.25","viewership_per_dollar":"1.15","rating":"4.10"},{"content_category":"Star Wars Saga","title":"The Mandalorian S3","viewership_millions":"220.60","cost_millions":"250.00","viewership_per_dollar":"0.88","rating":"4.40"},{"content_category":"Pixar Animation","title":"Turning Red Original","viewership_millions":"165.80","cost_millions":"195.75","viewership_per_dollar":"0.85","rating":"4.60"},{"content_category":"Marvel Superhero","title":"Doctor Strange Multiverse","viewership_millions":"185.40","cost_millions":"280.50","viewership_per_dollar":"0.66","rating":"4.20"}]`
        },

        // Problem 68: ExxonMobil Energy Analytics
        {
            problemId: 68,
            title: 'ExxonMobil Energy Analytics',
            description: `You're a strategic operations analyst at ExxonMobil analyzing global energy production and refining operations across different geographic regions and energy segments. Your database contains comprehensive production data, operational efficiency metrics, environmental impact indicators, and profitability analysis. ExxonMobil wants to understand which operations and regions deliver the highest operational efficiency and environmental compliance to optimize their energy transition and operational excellence strategies.`,
            setupSql: `-- ExxonMobil Energy Analytics Database
CREATE TABLE energy_operations (
    facility_id VARCHAR(15) PRIMARY KEY,
    operation_type VARCHAR(100),
    region VARCHAR(100),
    daily_production_barrels INTEGER,
    operational_efficiency DECIMAL(5,2),
    environmental_score DECIMAL(5,2)
);

CREATE TABLE regional_metrics (
    region VARCHAR(100),
    operation_type VARCHAR(100),
    quarterly_revenue_millions DECIMAL(10,2),
    carbon_intensity DECIMAL(8,3),
    regulatory_compliance DECIMAL(5,2),
    investment_millions DECIMAL(8,2)
);

INSERT INTO energy_operations VALUES
('EXM_TEX_001', 'Oil Refining', 'North America Texas', 450000, 87.5, 82.3),
('EXM_GUL_001', 'Offshore Drilling', 'Gulf of Mexico', 280000, 78.9, 79.1),
('EXM_NOR_001', 'Natural Gas Processing', 'North Sea Operations', 320000, 91.2, 88.7),
('EXM_SIN_001', 'Petrochemical Complex', 'Asia Pacific Singapore', 180000, 89.8, 85.4),
('EXM_NIG_001', 'Crude Oil Extraction', 'West Africa Nigeria', 350000, 74.6, 72.8);

INSERT INTO regional_metrics VALUES
('North America Texas', 'Oil Refining', 4250.80, 425.750, 92.5, 850.25),
('Gulf of Mexico', 'Offshore Drilling', 2890.60, 380.250, 88.9, 1250.50),
('North Sea Operations', 'Natural Gas Processing', 3180.40, 285.125, 94.7, 780.75),
('Asia Pacific Singapore', 'Petrochemical Complex', 1950.30, 325.480, 91.3, 650.90),
('West Africa Nigeria', 'Crude Oil Extraction', 3850.70, 485.920, 78.4, 1150.80);`,
            solutionSql: `SELECT 
    eo.operation_type,
    eo.region,
    eo.daily_production_barrels,
    ROUND(eo.operational_efficiency, 2) as efficiency_pct,
    ROUND(eo.environmental_score, 2) as env_score,
    ROUND(rm.quarterly_revenue_millions, 2) as revenue_millions
FROM energy_operations eo
JOIN regional_metrics rm ON eo.region = rm.region AND eo.operation_type = rm.operation_type
ORDER BY revenue_millions DESC;`,
            expectedOutput: `[{"operation_type":"Oil Refining","region":"North America Texas","daily_production_barrels":"450000","efficiency_pct":"87.50","env_score":"82.30","revenue_millions":"4250.80"},{"operation_type":"Crude Oil Extraction","region":"West Africa Nigeria","daily_production_barrels":"350000","efficiency_pct":"74.60","env_score":"72.80","revenue_millions":"3850.70"},{"operation_type":"Natural Gas Processing","region":"North Sea Operations","daily_production_barrels":"320000","efficiency_pct":"91.20","env_score":"88.70","revenue_millions":"3180.40"},{"operation_type":"Offshore Drilling","region":"Gulf of Mexico","daily_production_barrels":"280000","efficiency_pct":"78.90","env_score":"79.10","revenue_millions":"2890.60"},{"operation_type":"Petrochemical Complex","region":"Asia Pacific Singapore","daily_production_barrels":"180000","efficiency_pct":"89.80","env_score":"85.40","revenue_millions":"1950.30"}]`
        },

        // Problem 69: General Electric Analytics
        {
            problemId: 69,
            title: 'General Electric Analytics',
            description: `You're a business unit performance analyst at General Electric analyzing industrial equipment and energy infrastructure performance across different business segments and global markets. Your database contains comprehensive operational data, equipment reliability metrics, service revenue indicators, and digital transformation analytics. GE wants to understand which business segments and digital solutions deliver the highest operational value and customer satisfaction to optimize their industrial IoT and service portfolio strategies.`,
            setupSql: `-- General Electric Analytics Database
CREATE TABLE ge_business_units (
    unit_id VARCHAR(15) PRIMARY KEY,
    business_segment VARCHAR(100),
    product_category VARCHAR(100),
    annual_revenue_millions DECIMAL(10,2),
    service_margin_percent DECIMAL(5,2),
    digital_adoption_score DECIMAL(5,2)
);

CREATE TABLE operational_metrics (
    business_segment VARCHAR(100),
    equipment_uptime_percent DECIMAL(5,2),
    customer_satisfaction DECIMAL(3,2),
    predictive_maintenance_savings DECIMAL(8,2),
    iot_connectivity_percent DECIMAL(5,2),
    innovation_investment_millions DECIMAL(8,2)
);

INSERT INTO ge_business_units VALUES
('GE_PWR_001', 'Power Generation', 'Gas Turbines & Wind', 18500.75, 28.5, 87.3),
('GE_AVN_001', 'Aviation Engines', 'Commercial Jet Engines', 22400.60, 32.8, 91.7),
('GE_HLT_001', 'Healthcare Systems', 'Medical Imaging Equipment', 15800.90, 25.1, 84.9),
('GE_REN_001', 'Renewable Energy', 'Offshore Wind Turbines', 12600.40, 22.7, 89.2),
('GE_DIG_001', 'Digital Industrial', 'Predix Analytics Platform', 8750.20, 45.6, 95.8);

INSERT INTO operational_metrics VALUES
('Power Generation', 94.7, 4.1, 125000.50, 78.9, 850.75),
('Aviation Engines', 98.2, 4.5, 280000.75, 89.3, 1250.90),
('Healthcare Systems', 92.8, 4.2, 95000.25, 82.1, 650.40),
('Renewable Energy', 91.5, 4.0, 180000.60, 85.7, 980.50),
('Digital Industrial', 96.9, 4.4, 350000.90, 92.8, 450.25);`,
            solutionSql: `SELECT 
    bu.business_segment,
    bu.product_category,
    ROUND(bu.annual_revenue_millions, 2) as revenue_millions,
    ROUND(bu.service_margin_percent, 2) as service_margin_pct,
    ROUND(om.equipment_uptime_percent, 2) as uptime_pct,
    ROUND(om.customer_satisfaction, 2) as satisfaction
FROM ge_business_units bu
JOIN operational_metrics om ON bu.business_segment = om.business_segment
ORDER BY revenue_millions DESC;`,
            expectedOutput: `[{"business_segment":"Aviation Engines","product_category":"Commercial Jet Engines","revenue_millions":"22400.60","service_margin_pct":"32.80","uptime_pct":"98.20","satisfaction":"4.50"},{"business_segment":"Power Generation","product_category":"Gas Turbines & Wind","revenue_millions":"18500.75","service_margin_pct":"28.50","uptime_pct":"94.70","satisfaction":"4.10"},{"business_segment":"Healthcare Systems","product_category":"Medical Imaging Equipment","revenue_millions":"15800.90","service_margin_pct":"25.10","uptime_pct":"92.80","satisfaction":"4.20"},{"business_segment":"Renewable Energy","product_category":"Offshore Wind Turbines","revenue_millions":"12600.40","service_margin_pct":"22.70","uptime_pct":"91.50","satisfaction":"4.00"},{"business_segment":"Digital Industrial","product_category":"Predix Analytics Platform","revenue_millions":"8750.20","service_margin_pct":"45.60","uptime_pct":"96.90","satisfaction":"4.40"}]`
        },

        // Problem 70: Johnson & Johnson Analytics
        {
            problemId: 70,
            title: 'Johnson & Johnson Analytics',
            description: `You're a pharmaceutical portfolio analyst at Johnson & Johnson analyzing global healthcare product performance across different therapeutic categories and geographic markets. Your database contains comprehensive drug development data, clinical trial outcomes, market access metrics, and patient outcome indicators. J&J wants to understand which therapeutic areas and research investments deliver the highest patient impact and commercial success to optimize their pharmaceutical R&D and global market access strategies.`,
            setupSql: `-- Johnson & Johnson Analytics Database
CREATE TABLE jj_pharmaceuticals (
    drug_id VARCHAR(15) PRIMARY KEY,
    therapeutic_area VARCHAR(100),
    drug_name VARCHAR(100),
    global_sales_millions DECIMAL(10,2),
    rd_investment_millions DECIMAL(8,2),
    patient_outcomes_score DECIMAL(5,2)
);

CREATE TABLE clinical_performance (
    therapeutic_area VARCHAR(100),
    clinical_success_rate DECIMAL(5,2),
    regulatory_approvals INTEGER,
    market_access_percent DECIMAL(5,2),
    competitive_advantage DECIMAL(5,2),
    pipeline_value_billions DECIMAL(8,2)
);

INSERT INTO jj_pharmaceuticals VALUES
('JNJ_ONC_001', 'Oncology & Cancer Care', 'Darzalex Multiple Myeloma', 8950.75, 1250.50, 91.8),
('JNJ_IMM_001', 'Immunology Disorders', 'Stelara Psoriasis', 12400.60, 980.25, 88.3),
('JNJ_INF_001', 'Infectious Diseases', 'Edurant HIV Treatment', 2850.40, 450.75, 85.9),
('JNJ_NEU_001', 'Neuroscience Disorders', 'Spravato Depression', 1650.90, 780.60, 82.4),
('JNJ_CAR_001', 'Cardiovascular Health', 'Xarelto Blood Thinner', 6750.80, 650.90, 89.7);

INSERT INTO clinical_performance VALUES
('Oncology & Cancer Care', 78.5, 15, 85.7, 92.3, 25.80),
('Immunology Disorders', 82.1, 22, 91.4, 88.9, 18.50),
('Infectious Diseases', 75.8, 8, 78.9, 79.2, 8.75),
('Neuroscience Disorders', 68.9, 6, 72.4, 81.5, 12.40),
('Cardiovascular Health', 81.7, 12, 88.2, 85.6, 15.90);`,
            solutionSql: `SELECT 
    jp.therapeutic_area,
    jp.drug_name,
    ROUND(jp.global_sales_millions, 2) as sales_millions,
    ROUND(jp.rd_investment_millions, 2) as rd_investment,
    ROUND(jp.global_sales_millions / jp.rd_investment_millions, 2) as roi_ratio,
    ROUND(jp.patient_outcomes_score, 2) as patient_score
FROM jj_pharmaceuticals jp
ORDER BY roi_ratio DESC;`,
            expectedOutput: `[{"therapeutic_area":"Immunology Disorders","drug_name":"Stelara Psoriasis","sales_millions":"12400.60","rd_investment":"980.25","roi_ratio":"12.65","patient_score":"88.30"},{"therapeutic_area":"Cardiovascular Health","drug_name":"Xarelto Blood Thinner","sales_millions":"6750.80","rd_investment":"650.90","roi_ratio":"10.37","patient_score":"89.70"},{"therapeutic_area":"Oncology & Cancer Care","drug_name":"Darzalex Multiple Myeloma","sales_millions":"8950.75","rd_investment":"1250.50","roi_ratio":"7.16","patient_score":"91.80"},{"therapeutic_area":"Infectious Diseases","drug_name":"Edurant HIV Treatment","sales_millions":"2850.40","rd_investment":"450.75","roi_ratio":"6.32","patient_score":"85.90"},{"therapeutic_area":"Neuroscience Disorders","drug_name":"Spravato Depression","sales_millions":"1650.90","rd_investment":"780.60","roi_ratio":"2.12","patient_score":"82.40"}]`
        }
    ];

    let results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const problem of problemsToFix) {
        try {
            console.log(`🔧 Fixing Problem ${problem.problemId}: ${problem.title}...`);
            
            const updateQuery = `
                UPDATE problems 
                SET 
                    title = $1,
                    description = $2,
                    setup_sql = $3,
                    solution_sql = $4,
                    expected_output = $5,
                    updated_at = NOW()
                WHERE id = $6
            `;
            
            const result = await pool.query(updateQuery, [
                problem.title,
                problem.description,
                problem.setupSql,
                problem.solutionSql,
                problem.expectedOutput,
                problem.problemId
            ]);

            if (result.rowCount > 0) {
                console.log(`✅ Problem ${problem.problemId} successfully updated`);
                successCount++;
                results.push({
                    problemId: problem.problemId,
                    title: problem.title,
                    status: 'success',
                    message: 'Problem updated successfully'
                });
            } else {
                console.log(`⚠️ Problem ${problem.problemId} not found in database`);
                errorCount++;
                results.push({
                    problemId: problem.problemId,
                    title: problem.title,
                    status: 'warning',
                    message: 'Problem not found in database'
                });
            }
        } catch (error) {
            console.error(`❌ Error updating Problem ${problem.problemId}:`, error);
            errorCount++;
            results.push({
                problemId: problem.problemId,
                title: problem.title,
                status: 'error',
                message: error.message
            });
        }
    }

    console.log(`🎯 FINAL BATCH 7 COMPLETE: ${successCount} successes, ${errorCount} errors`);

    res.json({
        success: true,
        message: `SYSTEMATIC FIX BATCH 7 - FINAL BATCH COMPLETE: Problems 61-70 with perfect Fortune 100 alignment`,
        batchInfo: {
            batchNumber: 7,
            problemRange: "61-70",
            successCount,
            errorCount,
            totalProblems: problemsToFix.length
        },
        results
    });
});

module.exports = router;