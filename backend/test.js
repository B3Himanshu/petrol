import dotenv from 'dotenv';
import pool from './config/database.js';
import { mapSiteToFrontend } from './utils/cityMapping.js';

dotenv.config();

/**
 * Database Sites and Monthly Data Analysis Script
 * This script checks:
 * 1. All sites from the database (not hardcoded)
 * 2. Which sites have monthly data and for which months/years
 */

async function analyzeSitesAndMonthlyData() {
  let client;
  
  try {
    console.log('🔍 Starting Sites and Monthly Data Analysis...\n');
    console.log('📊 Database Connection Info:');
    
    // Parse connection info from DATABASE_URL if present
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        console.log(`   Connection: DATABASE_URL (connection string)`);
        console.log(`   Host: ${url.hostname}`);
        console.log(`   Port: ${url.port || 5432}`);
        console.log(`   Database: ${url.pathname.replace('/', '')}`);
        console.log(`   User: ${url.username || 'N/A'}`);
        console.log(`   SSL: ${url.searchParams.get('sslmode') || 'not specified'}\n`);
      } catch (e) {
        console.log(`   Connection: DATABASE_URL (could not parse)`);
        console.log(`   Host: ${process.env.DB_HOST || 'from DATABASE_URL'}`);
        console.log(`   Port: ${process.env.DB_PORT || 5432}`);
        console.log(`   Database: ${process.env.DB_NAME || 'from DATABASE_URL'}`);
        console.log(`   User: ${process.env.DB_USER || 'from DATABASE_URL'}\n`);
      }
    } else {
      console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`   Port: ${process.env.DB_PORT || 5432}`);
      console.log(`   Database: ${process.env.DB_NAME || 'petroleum_db'}`);
      console.log(`   User: ${process.env.DB_USER || 'N/A'}\n`);
    }

    // Connect to database
    client = await pool.connect();
    console.log('✅ Connected to database successfully!\n');

    // 1. Get all active sites from database (same query as in routes/sites.js)
    console.log('📋 Step 1: Fetching all active sites from database...');
    const sitesQuery = `
      SELECT 
        site_code,
        site_name,
        post_code,
        company,
        is_active,
        is_bunkered
      FROM sites
      WHERE is_active = true
        AND site_code > 1
        AND post_code IS NOT NULL
        AND post_code != ''
        AND site_name IS NOT NULL
        AND site_name != ''
      ORDER BY site_code;
    `;
    const sitesResult = await client.query(sitesQuery);
    console.log(`   ✅ Found ${sitesResult.rows.length} active sites\n`);
    
    // Map sites to frontend format
    const mappedSites = sitesResult.rows.map(mapSiteToFrontend);
    
    // 2. Check monthly data for each site
    console.log('📋 Step 2: Checking monthly data for each site...\n');
    
    const sitesWithData = [];
    const sitesWithoutData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (const site of mappedSites) {
      const siteCode = site.id;
      
      // Check if site has any monthly data
      const monthlyDataQuery = `
        SELECT 
          month,
          year,
          COUNT(*) as record_count,
          SUM(bunkered_sales + non_bunkered_sales) as total_sales
        FROM monthly_summary
        WHERE site_code = $1
        GROUP BY month, year
        ORDER BY year, month;
      `;
      
      const monthlyResult = await client.query(monthlyDataQuery, [siteCode]);
      
      if (monthlyResult.rows.length > 0) {
        const monthsWithData = monthlyResult.rows.map(r => ({
          month: r.month,
          year: r.year,
          monthName: monthNames[r.month - 1],
          sales: parseFloat(r.total_sales || 0)
        }));
        
        const years = [...new Set(monthlyResult.rows.map(r => r.year))].sort();
        const months = [...new Set(monthlyResult.rows.map(r => r.month))].sort();
        
        sitesWithData.push({
          siteCode,
          siteName: site.name,
          city: site.cityDisplay,
          postCode: site.postCode,
          totalRecords: monthlyResult.rows.length,
          years,
          months,
          monthsWithData,
          hasDataForAllMonths: months.length === 12
        });
      } else {
        sitesWithoutData.push({
          siteCode,
          siteName: site.name,
          city: site.cityDisplay,
          postCode: site.postCode
        });
      }
    }
    
    // 3. Display results
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 SITES WITH MONTHLY DATA');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`Total: ${sitesWithData.length} sites\n`);
    
    sitesWithData.forEach((site, index) => {
      console.log(`${index + 1}. Site ${site.siteCode}: ${site.siteName}`);
      console.log(`   City: ${site.city} (${site.postCode})`);
      console.log(`   Years with data: ${site.years.join(', ')}`);
      console.log(`   Months with data: ${site.months.map(m => monthNames[m - 1]).join(', ')} (${site.months.length}/12)`);
      console.log(`   Total records: ${site.totalRecords}`);
      console.log(`   Has data for all 12 months: ${site.hasDataForAllMonths ? '✅ YES' : '❌ NO'}`);
      
      // Show breakdown by year
      const byYear = {};
      site.monthsWithData.forEach(m => {
        if (!byYear[m.year]) byYear[m.year] = [];
        byYear[m.year].push(m);
      });
      
      Object.keys(byYear).sort().forEach(year => {
        const months = byYear[year].map(m => m.monthName).join(', ');
        console.log(`      ${year}: ${months} (${byYear[year].length} months)`);
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⚠️  SITES WITHOUT MONTHLY DATA');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`Total: ${sitesWithoutData.length} sites\n`);
    
    if (sitesWithoutData.length > 0) {
      sitesWithoutData.forEach((site, index) => {
        console.log(`${index + 1}. Site ${site.siteCode}: ${site.siteName}`);
        console.log(`   City: ${site.city} (${site.postCode})`);
        console.log(`   Status: ❌ No monthly data found`);
        console.log('');
      });
    } else {
      console.log('   ✅ All sites have monthly data!\n');
    }
    
    // 4. Summary statistics
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📈 SUMMARY STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const totalSites = mappedSites.length;
    const sitesWithFullYear = sitesWithData.filter(s => s.hasDataForAllMonths).length;
    const allYears = [...new Set(sitesWithData.flatMap(s => s.years))].sort();
    
    console.log(`Total Active Sites: ${totalSites}`);
    console.log(`Sites with Monthly Data: ${sitesWithData.length} (${((sitesWithData.length / totalSites) * 100).toFixed(1)}%)`);
    console.log(`Sites without Monthly Data: ${sitesWithoutData.length} (${((sitesWithoutData.length / totalSites) * 100).toFixed(1)}%)`);
    console.log(`Sites with Data for All 12 Months: ${sitesWithFullYear} (${((sitesWithFullYear / totalSites) * 100).toFixed(1)}%)`);
    console.log(`Years with Data: ${allYears.join(', ')}`);
    
    // Year-wise breakdown
    console.log('\n📅 Year-wise Data Coverage:');
    allYears.forEach(year => {
      const sitesForYear = sitesWithData.filter(s => s.years.includes(parseInt(year)));
      const avgMonths = sitesForYear.reduce((sum, s) => {
        const yearMonths = s.monthsWithData.filter(m => m.year === parseInt(year));
        return sum + yearMonths.length;
      }, 0) / sitesForYear.length;
      
      console.log(`   ${year}: ${sitesForYear.length} sites, avg ${avgMonths.toFixed(1)} months per site`);
    });
    
    console.log('\n✅ Analysis completed successfully!');

  } catch (error) {
    console.error('❌ Error exploring database:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your .env file has correct DATABASE_URL or DB_* settings');
    console.error('   2. Ensure PostgreSQL is running');
    console.error('   3. Verify database credentials are correct');
    console.error('   4. Check network connectivity to database server');
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the analysis
analyzeSitesAndMonthlyData();

