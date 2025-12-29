import dotenv from 'dotenv';
import pool from './config/database.js';
import { mapSiteToFrontend } from './utils/cityMapping.js';

dotenv.config();

/**
 * Database Complete Structure Analysis Script
 * This script checks:
 * 1. All tables in the database
 * 2. All columns in each table with their data types
 * 3. Row counts for each table
 * 4. Sample data from each table
 * 5. Sites and monthly data analysis
 */

async function analyzeCompleteDatabase() {
  let client;
  
  try {
    console.log('🔍 Starting Complete Database Structure Analysis...\n');
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
    
    // Step 0: Discover all tables
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 STEP 0: DISCOVERING ALL TABLES');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const tablesQuery = `
      SELECT 
        table_schema,
        table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name;
    `;
    const tablesResult = await client.query(tablesQuery);
    console.log(`✅ Found ${tablesResult.rows.length} table(s) in database\n`);
    
    const allTables = tablesResult.rows.map(row => ({
      schema: row.table_schema,
      name: row.table_name,
      fullName: `${row.table_schema}.${row.table_name}`
    }));
    
    // Step 1: Analyze each table structure
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 STEP 1: TABLE STRUCTURE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const tableStructures = [];
    
    for (const table of allTables) {
      console.log(`📊 Analyzing table: ${table.fullName}`);
      
      // Get all columns with details
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position;
      `;
      const columnsResult = await client.query(columnsQuery, [table.schema, table.name]);
      
      // Get row count
      const countQuery = `SELECT COUNT(*) as row_count FROM ${table.fullName};`;
      const countResult = await client.query(countQuery);
      const rowCount = parseInt(countResult.rows[0].row_count);
      
      const columns = columnsResult.rows.map(col => ({
        name: col.column_name,
        type: col.data_type,
        maxLength: col.character_maximum_length,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        position: col.ordinal_position
      }));
      
      tableStructures.push({
        ...table,
        columns,
        rowCount
      });
      
      console.log(`   ✅ Columns: ${columns.length}, Rows: ${rowCount}`);
      console.log(`   Columns:`);
      columns.forEach(col => {
        const typeInfo = col.maxLength ? `${col.type}(${col.maxLength})` : col.type;
        const nullable = col.nullable ? 'NULL' : 'NOT NULL';
        console.log(`      - ${col.name}: ${typeInfo} ${nullable}`);
      });
      
      // Get sample data (first 3 rows)
      if (rowCount > 0) {
        const sampleQuery = `SELECT * FROM ${table.fullName} LIMIT 3;`;
        const sampleResult = await client.query(sampleQuery);
        console.log(`   Sample data (${sampleResult.rows.length} row(s)):`);
        sampleResult.rows.forEach((row, idx) => {
          console.log(`      Row ${idx + 1}:`, Object.keys(row).slice(0, 5).map(k => `${k}=${row[k]}`).join(', '), 
                     Object.keys(row).length > 5 ? '...' : '');
        });
      }
      console.log('');
    }
    
    // Summary of all tables
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 TABLE SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`Total Tables: ${tableStructures.length}`);
    console.log(`Total Rows Across All Tables: ${tableStructures.reduce((sum, t) => sum + t.rowCount, 0)}`);
    console.log('\nTable Details:');
    tableStructures.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table.fullName}`);
      console.log(`      Columns: ${table.columns.length}, Rows: ${table.rowCount}`);
    });
    console.log('');

    // Step 2: Sites and Monthly Data Analysis
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 STEP 2: SITES AND MONTHLY DATA ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // 1. Get all active sites from database (same query as in routes/sites.js)
    console.log('📋 Step 2.1: Fetching all active sites from database...');
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
    console.log('📋 Step 2.2: Checking monthly data for each site...\n');
    
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
    console.log('═══════════════════════════════════════════════════════════════');
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
    console.log('\n═══════════════════════════════════════════════════════════════');
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
    
    // Step 3: Check for any new or unexpected columns
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 STEP 3: CHECKING FOR NEW COLUMNS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const expectedTables = ['sites', 'monthly_summary', 'fuel_margin_data', 'transactions', 'daily_summary'];
    const newTables = tableStructures.filter(t => !expectedTables.includes(t.name.toLowerCase()));
    
    if (newTables.length > 0) {
      console.log('⚠️  NEW TABLES FOUND (not in expected list):');
      newTables.forEach(table => {
        console.log(`   - ${table.fullName} (${table.columns.length} columns, ${table.rowCount} rows)`);
      });
    } else {
      console.log('✅ No new tables found (all tables are expected)');
    }
    
    // Check for columns in known tables
    console.log('\n📊 Column details for key tables:');
    const keyTables = ['sites', 'monthly_summary', 'fuel_margin_data', 'transactions', 'daily_summary'];
    keyTables.forEach(tableName => {
      const table = tableStructures.find(t => t.name.toLowerCase() === tableName.toLowerCase());
      if (table) {
        console.log(`\n   ${table.fullName}:`);
        table.columns.forEach(col => {
          console.log(`      - ${col.name} (${col.type}${col.maxLength ? `(${col.maxLength})` : ''})`);
        });
      }
    });
    
    console.log('\n✅ Complete database analysis finished successfully!');

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
analyzeCompleteDatabase();

