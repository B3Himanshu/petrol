import dotenv from 'dotenv';
import pool from './config/database.js';
import * as XLSX from 'xlsx';
import { mapSiteToFrontend } from './utils/cityMapping.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database Data Export Script
 * Exports all database data to Excel format
 */

async function exportToExcel() {
  let client;
  
  try {
    console.log('📊 Starting database data export to Excel...\n');
    
    // Connect to database
    client = await pool.connect();
    console.log('✅ Connected to database successfully!\n');
    
    const workbook = XLSX.utils.book_new();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Step 0: Discover all tables in the database
    console.log('📋 Step 0: Discovering all tables in database...');
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
    console.log(`   ✅ Found ${tablesResult.rows.length} table(s) in database\n`);
    
    const allTables = tablesResult.rows.map(row => ({
      schema: row.table_schema,
      name: row.table_name,
      fullName: `${row.table_schema}.${row.table_name}`
    }));
    
    console.log('   Tables to export:');
    allTables.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table.fullName}`);
    });
    console.log('');
    
    // 1. Export Sites Data
    console.log('📋 Step 1: Exporting Sites data...');
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
    console.log(`   ✅ Found ${sitesResult.rows.length} sites`);
    
    // Map sites and add city information
    const sitesData = sitesResult.rows.map(row => {
      const mapped = mapSiteToFrontend(row);
      return {
        'Site Code': row.site_code,
        'Site Name': row.site_name,
        'Post Code': row.post_code,
        'City': mapped.cityDisplay,
        'Company': row.company || '',
        'Is Active': row.is_active ? 'Yes' : 'No',
        'Is Bunkered': row.is_bunkered ? 'Yes' : 'No'
      };
    });
    
    const sitesSheet = XLSX.utils.json_to_sheet(sitesData);
    XLSX.utils.book_append_sheet(workbook, sitesSheet, 'Sites');
    console.log('   ✅ Sites sheet created\n');
    
    // 2. Export Monthly Summary Data
    console.log('📋 Step 2: Exporting Monthly Summary data...');
    const monthlySummaryQuery = `
      SELECT 
        ms.site_code,
        s.site_name,
        ms.month,
        ms.year,
        ms.bunkered_volume,
        ms.bunkered_sales,
        ms.bunkered_purchases,
        ms.non_bunkered_volume,
        ms.non_bunkered_sales,
        ms.non_bunkered_purchases,
        ms.shop_sales,
        ms.shop_purchases,
        ms.valet_sales,
        ms.valet_purchases,
        ms.overheads,
        ms.labour_cost,
        (ms.bunkered_sales + ms.non_bunkered_sales) as total_fuel_sales,
        (ms.bunkered_sales + ms.non_bunkered_sales) - (ms.bunkered_purchases + ms.non_bunkered_purchases) as fuel_profit,
        (ms.shop_sales - ms.shop_purchases) as shop_profit,
        (ms.valet_sales - ms.valet_purchases) as valet_profit
      FROM monthly_summary ms
      LEFT JOIN sites s ON ms.site_code = s.site_code
      ORDER BY ms.site_code, ms.year, ms.month;
    `;
    const monthlyResult = await client.query(monthlySummaryQuery);
    console.log(`   ✅ Found ${monthlyResult.rows.length} monthly records`);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthlyResult.rows.map(row => ({
      'Site Code': row.site_code,
      'Site Name': row.site_name || '',
      'Month Number': row.month,
      'Month Name': monthNames[row.month - 1] || '',
      'Year': row.year,
      'Bunkered Volume': parseFloat(row.bunkered_volume || 0),
      'Bunkered Sales': parseFloat(row.bunkered_sales || 0),
      'Bunkered Purchases': parseFloat(row.bunkered_purchases || 0),
      'Non-Bunkered Volume': parseFloat(row.non_bunkered_volume || 0),
      'Non-Bunkered Sales': parseFloat(row.non_bunkered_sales || 0),
      'Non-Bunkered Purchases': parseFloat(row.non_bunkered_purchases || 0),
      'Shop Sales': parseFloat(row.shop_sales || 0),
      'Shop Purchases': parseFloat(row.shop_purchases || 0),
      'Valet Sales': parseFloat(row.valet_sales || 0),
      'Valet Purchases': parseFloat(row.valet_purchases || 0),
      'Overheads': parseFloat(row.overheads || 0),
      'Labour Cost': parseFloat(row.labour_cost || 0),
      'Total Fuel Sales': parseFloat(row.total_fuel_sales || 0),
      'Fuel Profit': parseFloat(row.fuel_profit || 0),
      'Shop Profit': parseFloat(row.shop_profit || 0),
      'Valet Profit': parseFloat(row.valet_profit || 0)
    }));
    
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary');
    console.log('   ✅ Monthly Summary sheet created\n');
    
    // 3. Export Fuel Margin Data
    console.log('📋 Step 3: Exporting Fuel Margin data...');
    const fuelMarginQuery = `
      SELECT 
        fmd.site_code,
        s.site_name,
        fmd.month,
        fmd.year,
        fmd.ppl,
        fmd.fuel_profit,
        fmd.net_sales,
        fmd.sale_volume
      FROM fuel_margin_data fmd
      LEFT JOIN sites s ON fmd.site_code = s.site_code
      ORDER BY fmd.site_code, fmd.year, fmd.month;
    `;
    const fuelMarginResult = await client.query(fuelMarginQuery);
    console.log(`   ✅ Found ${fuelMarginResult.rows.length} fuel margin records`);
    
    const fuelMarginData = fuelMarginResult.rows.map(row => ({
      'Site Code': row.site_code,
      'Site Name': row.site_name || '',
      'Month Number': row.month,
      'Month Name': monthNames[row.month - 1] || '',
      'Year': row.year,
      'PPL (Price Per Liter)': parseFloat(row.ppl || 0),
      'Fuel Profit': parseFloat(row.fuel_profit || 0),
      'Net Sales': parseFloat(row.net_sales || 0),
      'Sale Volume': parseFloat(row.sale_volume || 0)
    }));
    
    const fuelMarginSheet = XLSX.utils.json_to_sheet(fuelMarginData);
    XLSX.utils.book_append_sheet(workbook, fuelMarginSheet, 'Fuel Margin');
    console.log('   ✅ Fuel Margin sheet created\n');
    
    // 4. Try to export Transactions data (if table exists)
    console.log('📋 Step 4: Checking for Transactions data...');
    try {
      const transactionsQuery = `
        SELECT 
          t.site_code,
          s.site_name,
          t.transaction_date,
          t.category,
          t.amount,
          t.deleted_flag
        FROM transactions t
        LEFT JOIN sites s ON t.site_code = s.site_code
        WHERE t.deleted_flag = 0
        ORDER BY t.site_code, t.transaction_date
        LIMIT 10000;
      `;
      const transactionsResult = await client.query(transactionsQuery);
      console.log(`   ✅ Found ${transactionsResult.rows.length} transaction records`);
      
      if (transactionsResult.rows.length > 0) {
        const transactionsData = transactionsResult.rows.map(row => ({
          'Site Code': row.site_code,
          'Site Name': row.site_name || '',
          'Transaction Date': row.transaction_date ? new Date(row.transaction_date).toISOString().split('T')[0] : '',
          'Category': row.category || '',
          'Amount': parseFloat(row.amount || 0),
          'Deleted': row.deleted_flag ? 'Yes' : 'No'
        }));
        
        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
        console.log('   ✅ Transactions sheet created\n');
      }
    } catch (err) {
      console.log(`   ⚠️  Transactions table not found or error: ${err.message}\n`);
    }
    
    // 5. Try to export Daily Summary data (if table exists)
    console.log('📋 Step 5: Checking for Daily Summary data...');
    try {
      const dailySummaryQuery = `
        SELECT 
          ds.site_code,
          s.site_name,
          ds.date,
          ds.sales,
          ds.volume
        FROM daily_summary ds
        LEFT JOIN sites s ON ds.site_code = s.site_code
        ORDER BY ds.site_code, ds.date
        LIMIT 50000;
      `;
      const dailySummaryResult = await client.query(dailySummaryQuery);
      console.log(`   ✅ Found ${dailySummaryResult.rows.length} daily summary records`);
      
      if (dailySummaryResult.rows.length > 0) {
        const dailySummaryData = dailySummaryResult.rows.map(row => ({
          'Site Code': row.site_code,
          'Site Name': row.site_name || '',
          'Date': row.date ? new Date(row.date).toISOString().split('T')[0] : '',
          'Sales': parseFloat(row.sales || 0),
          'Volume': parseFloat(row.volume || 0)
        }));
        
        const dailySummarySheet = XLSX.utils.json_to_sheet(dailySummaryData);
        XLSX.utils.book_append_sheet(workbook, dailySummarySheet, 'Daily Summary');
        console.log('   ✅ Daily Summary sheet created\n');
      }
    } catch (err) {
      console.log(`   ⚠️  Daily Summary table not found or error: ${err.message}\n`);
    }
    
    // 6. Export all other tables dynamically
    console.log('📋 Step 6: Exporting all other tables...\n');
    const exportedTables = ['sites', 'monthly_summary', 'fuel_margin_data', 'transactions', 'daily_summary'];
    const exportStats = [];
    
    for (const table of allTables) {
      const tableName = table.name.toLowerCase();
      
      // Skip tables we've already exported
      if (exportedTables.includes(tableName)) {
        continue;
      }
      
      try {
        console.log(`   📊 Exporting table: ${table.fullName}...`);
        
        // Get column information first
        const columnsQuery = `
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position;
        `;
        const columnsResult = await client.query(columnsQuery, [table.schema, table.name]);
        
        if (columnsResult.rows.length === 0) {
          console.log(`   ⚠️  No columns found for ${table.fullName}\n`);
          continue;
        }
        
        // Get all data from table (with limit for very large tables)
        const dataQuery = `SELECT * FROM ${table.fullName} LIMIT 100000;`;
        const dataResult = await client.query(dataQuery);
        
        if (dataResult.rows.length === 0) {
          console.log(`   ⚠️  No data found in ${table.fullName}\n`);
          exportStats.push({ table: table.fullName, rows: 0, status: 'Empty' });
          continue;
        }
        
        // Convert data to array of objects with proper formatting
        const tableData = dataResult.rows.map(row => {
          const formattedRow = {};
          Object.keys(row).forEach(key => {
            const value = row[key];
            // Format dates
            if (value instanceof Date) {
              formattedRow[key] = value.toISOString().split('T')[0];
            } else if (value === null || value === undefined) {
              formattedRow[key] = '';
            } else if (typeof value === 'number') {
              formattedRow[key] = value;
            } else {
              formattedRow[key] = String(value);
            }
          });
          return formattedRow;
        });
        
        // Create sheet (limit sheet name to 31 characters as per Excel limit)
        const sheetName = table.name.length > 31 ? table.name.substring(0, 31) : table.name;
        const tableSheet = XLSX.utils.json_to_sheet(tableData);
        XLSX.utils.book_append_sheet(workbook, tableSheet, sheetName);
        
        console.log(`   ✅ Exported ${dataResult.rows.length} rows from ${table.fullName}\n`);
        exportStats.push({ table: table.fullName, rows: dataResult.rows.length, status: 'Success' });
        
      } catch (err) {
        console.log(`   ❌ Error exporting ${table.fullName}: ${err.message}\n`);
        exportStats.push({ table: table.fullName, rows: 0, status: `Error: ${err.message}` });
      }
    }
    
    // 7. Create Summary Sheet
    console.log('📋 Step 7: Creating Summary sheet...');
    const summaryData = [
      { 'Metric': 'Total Sites', 'Value': sitesData.length },
      { 'Metric': 'Total Monthly Records', 'Value': monthlyData.length },
      { 'Metric': 'Total Fuel Margin Records', 'Value': fuelMarginData.length },
      { 'Metric': 'Total Tables in Database', 'Value': allTables.length },
      { 'Metric': 'Tables Exported', 'Value': workbook.SheetNames.length - 1 }, // -1 for Summary sheet
      { 'Metric': 'Export Date', 'Value': new Date().toISOString() },
      { 'Metric': 'Database', 'Value': process.env.DB_NAME || 'N/A' }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    console.log('   ✅ Summary sheet created\n');
    
    // 8. Create Export Statistics Sheet
    console.log('📋 Step 8: Creating Export Statistics sheet...');
    const statsData = [
      { 'Table Name': 'Sites', 'Rows Exported': sitesData.length, 'Status': 'Success' },
      { 'Table Name': 'Monthly Summary', 'Rows Exported': monthlyData.length, 'Status': 'Success' },
      { 'Table Name': 'Fuel Margin', 'Rows Exported': fuelMarginData.length, 'Status': 'Success' },
      ...exportStats.map(stat => ({
        'Table Name': stat.table,
        'Rows Exported': stat.rows,
        'Status': stat.status
      }))
    ];
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Export Statistics');
    console.log('   ✅ Export Statistics sheet created\n');
    
    // 7. Write Excel file
    const filename = `petroleum_data_export_${timestamp}.xlsx`;
    const filepath = join(__dirname, filename);
    
    XLSX.writeFile(workbook, filepath);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Excel export completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`📁 File saved: ${filepath}`);
    console.log(`📊 Total sheets: ${workbook.SheetNames.length}`);
    console.log(`   - ${workbook.SheetNames.join('\n   - ')}\n`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
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
    console.log('🔌 Database connection closed.');
  }
}

// Run the export
exportToExcel();

