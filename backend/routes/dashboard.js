import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics for a specific site
 * Query params: siteId (site_code), month (or months as comma-separated), year (or years as comma-separated)
 */
router.get('/metrics', async (req, res) => {
  try {
    console.log('📊 [Backend] GET /api/dashboard/metrics');
    console.log('📊 [Backend] Query params:', req.query);
    
    const { siteId, month, months, year, years } = req.query;
    
    if (!siteId) {
      console.error('❌ [Backend] Missing siteId parameter');
      return res.status(400).json({
        success: false,
        message: 'siteId is required'
      });
    }
    
    const siteCode = parseInt(siteId, 10);
    console.log('📊 [Backend] Parsed siteCode:', siteCode);
    
    // Parse months - support both single month and comma-separated months
    let monthsArray = [];
    if (months) {
      monthsArray = months.split(',').map(m => parseInt(m.trim(), 10)).filter(m => !isNaN(m) && m >= 1 && m <= 12);
      console.log('📊 [Backend] Parsed months array from "months" param:', monthsArray);
    } else if (month) {
      monthsArray = [parseInt(month, 10)];
      console.log('📊 [Backend] Parsed single month from "month" param:', monthsArray);
    } else {
      monthsArray = [new Date().getMonth() + 1];
      console.log('📊 [Backend] Using default month (current):', monthsArray);
    }
    
    // Parse years - support both single year and comma-separated years
    let yearsArray = [];
    if (years) {
      yearsArray = years.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
      console.log('📊 [Backend] Parsed years array from "years" param:', yearsArray);
    } else if (year) {
      yearsArray = [parseInt(year, 10)];
      console.log('📊 [Backend] Parsed single year from "year" param:', yearsArray);
    } else {
      yearsArray = [new Date().getFullYear()];
      console.log('📊 [Backend] Using default year (current):', yearsArray);
    }
    
    if (monthsArray.length === 0 || yearsArray.length === 0) {
      console.error('❌ [Backend] Invalid month or year parameters', { monthsArray, yearsArray });
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year parameters'
      });
    }
    
    console.log('📊 [Backend] Final parameters:', {
      siteCode,
      monthsArray,
      yearsArray,
      totalCombinations: monthsArray.length * yearsArray.length
    });
    
    // Build parameterized query for multiple months and years
    // Create placeholders dynamically but safely using parameterized queries
    const allParams = [siteCode, ...monthsArray, ...yearsArray];
    const monthPlaceholders = monthsArray.map((_, i) => `$${i + 2}`).join(',');
    const yearStartIndex = monthsArray.length + 2;
    const yearPlaceholders = yearsArray.map((_, i) => `$${yearStartIndex + i}`).join(',');
    
    // Get monthly summary data aggregated across all selected months/years
    const monthlyQuery = `
      SELECT 
        SUM(bunkered_volume) as bunkered_volume,
        SUM(bunkered_sales) as bunkered_sales,
        SUM(bunkered_purchases) as bunkered_purchases,
        SUM(non_bunkered_volume) as non_bunkered_volume,
        SUM(non_bunkered_sales) as non_bunkered_sales,
        SUM(non_bunkered_purchases) as non_bunkered_purchases,
        SUM(shop_sales) as shop_sales,
        SUM(shop_purchases) as shop_purchases,
        SUM(valet_sales) as valet_sales,
        SUM(valet_purchases) as valet_purchases,
        SUM(overheads) as overheads,
        SUM(labour_cost) as labour_cost
      FROM monthly_summary
      WHERE site_code = $1
        AND month IN (${monthPlaceholders})
        AND year IN (${yearPlaceholders});
    `;
    console.log('📊 [Backend] Executing monthly_summary query:', {
      query: monthlyQuery,
      params: allParams
    });
    const monthlyResult = await query(monthlyQuery, allParams);
    console.log('📊 [Backend] monthly_summary query result:', {
      rowCount: monthlyResult.rows.length,
      data: monthlyResult.rows[0]
    });
    
    // Get fuel margin data aggregated for PPL calculation
    const fuelMarginQuery = `
      SELECT 
        AVG(ppl) as avg_ppl,
        SUM(fuel_profit) as fuel_profit,
        SUM(net_sales) as net_sales,
        SUM(sale_volume) as sale_volume
      FROM fuel_margin_data
      WHERE site_code = $1
        AND month IN (${monthPlaceholders})
        AND year IN (${yearPlaceholders});
    `;
    console.log('📊 [Backend] Executing fuel_margin_data query:', {
      query: fuelMarginQuery,
      params: allParams
    });
    const fuelMarginResult = await query(fuelMarginQuery, allParams);
    console.log('📊 [Backend] fuel_margin_data query result:', {
      rowCount: fuelMarginResult.rows.length,
      data: fuelMarginResult.rows[0]
    });
    
    // Calculate totals from monthly summary
    const monthly = monthlyResult.rows[0] || {};
    const fuelMargin = fuelMarginResult.rows[0] || {};
    
    console.log('📊 [Backend] Raw data from queries:', {
      monthly: {
        bunkered_volume: monthly.bunkered_volume,
        bunkered_sales: monthly.bunkered_sales,
        non_bunkered_volume: monthly.non_bunkered_volume,
        non_bunkered_sales: monthly.non_bunkered_sales,
        shop_sales: monthly.shop_sales,
        valet_sales: monthly.valet_sales
      },
      fuelMargin: {
        avg_ppl: fuelMargin.avg_ppl,
        fuel_profit: fuelMargin.fuel_profit,
        net_sales: fuelMargin.net_sales
      }
    });
    
    // Calculate total fuel volume - use sale_volume from fuel_margin_data to match Excel data
    // Fallback to monthly_summary if fuel_margin_data doesn't have sale_volume
    const totalFuelVolume = parseFloat(fuelMargin.sale_volume || 0) || 
                           (parseFloat(monthly.bunkered_volume || 0) + 
                            parseFloat(monthly.non_bunkered_volume || 0));
    
    // Calculate net sales (sum across all months) - use net_sales from fuel_margin_data to match Excel
    const totalFuelSales = parseFloat(monthly.bunkered_sales || 0) + 
                          parseFloat(monthly.non_bunkered_sales || 0);
    const netSales = parseFloat(fuelMargin.net_sales || totalFuelSales);
    
    // Calculate profit (sum across all months)
    const fuelProfit = parseFloat(fuelMargin.fuel_profit || 0);
    const shopProfit = parseFloat(monthly.shop_sales || 0) - parseFloat(monthly.shop_purchases || 0);
    const valetProfit = parseFloat(monthly.valet_sales || 0) - parseFloat(monthly.valet_purchases || 0);
    const totalProfit = fuelProfit + shopProfit + valetProfit;
    
    // Get average PPL across all months (weighted average would be better, but simple avg for now)
    const avgPPL = parseFloat(fuelMargin.avg_ppl || 0);
    const actualPPL = avgPPL;
    
    // Calculate labour cost as percentage of total shop sales
    const shopSales = parseFloat(monthly.shop_sales || 0);
    const labourCost = parseFloat(monthly.labour_cost || 0);
    const labourCostPercent = shopSales > 0 ? (labourCost / shopSales) * 100 : 0;
    
    console.log('📊 [Backend] Calculated intermediate values:', {
      totalFuelVolume,
      totalFuelSales,
      netSales,
      fuelProfit,
      shopProfit,
      valetProfit,
      totalProfit,
      avgPPL,
      shopSales,
      labourCost,
      labourCostPercent
    });
    
    // Basket size - aggregate transactions across all months/years
    const transactionQuery = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE site_code = $1
        AND EXTRACT(MONTH FROM transaction_date) IN (${monthPlaceholders})
        AND EXTRACT(YEAR FROM transaction_date) IN (${yearPlaceholders})
        AND deleted_flag = 0
        AND category IN ('shop_sales', 'fuel_sales');
    `;
    console.log('📊 [Backend] Executing transactions query:', {
      query: transactionQuery,
      params: allParams
    });
    const transactionCount = await query(transactionQuery, allParams);
    console.log('📊 [Backend] transactions query result:', {
      rowCount: transactionCount.rows.length,
      count: transactionCount.rows[0]?.count
    });
    
    const transactionCountValue = parseInt(transactionCount.rows[0]?.count || 0);
    const basketSize = transactionCountValue > 0 ? (shopSales / transactionCountValue) : 0;
    
    // Calculate detailed breakdowns for modals
    const bunkeredVolume = parseFloat(monthly.bunkered_volume || 0);
    const nonBunkeredVolume = parseFloat(monthly.non_bunkered_volume || 0);
    const bunkeredSales = parseFloat(monthly.bunkered_sales || 0);
    const nonBunkeredSales = parseFloat(monthly.non_bunkered_sales || 0);
    const bunkeredPurchases = parseFloat(monthly.bunkered_purchases || 0);
    const nonBunkeredPurchases = parseFloat(monthly.non_bunkered_purchases || 0);
    // shopSales and labourCost already declared above
    const shopPurchases = parseFloat(monthly.shop_purchases || 0);
    const valetSales = parseFloat(monthly.valet_sales || 0);
    const valetPurchases = parseFloat(monthly.valet_purchases || 0);
    const overheads = parseFloat(monthly.overheads || 0);
    
    const responseData = {
      totalFuelVolume: totalFuelVolume, // Liters (sum)
      netSales: netSales, // Pounds (sum)
      profit: totalProfit, // Pounds (sum)
      avgPPL: avgPPL, // Pence per liter (average)
      actualPPL: actualPPL, // Pence per liter (average)
      labourCostPercent: parseFloat(labourCostPercent.toFixed(2)),
      basketSize: parseFloat(basketSize.toFixed(2)),
      customerCount: transactionCountValue, // Total count
      // Detailed breakdowns for modals
      bunkeredVolume: bunkeredVolume,
      nonBunkeredVolume: nonBunkeredVolume,
      bunkeredSales: bunkeredSales,
      nonBunkeredSales: nonBunkeredSales,
      bunkeredPurchases: bunkeredPurchases,
      nonBunkeredPurchases: nonBunkeredPurchases,
      shopSales: shopSales,
      shopPurchases: shopPurchases,
      valetSales: valetSales,
      valetPurchases: valetPurchases,
      overheads: overheads,
      labourCost: labourCost,
      fuelProfit: fuelProfit,
      shopProfit: shopProfit,
      valetProfit: valetProfit
    };
    
    console.log('📊 [Backend] Final calculated metrics:', responseData);
    console.log('📊 [Backend] Response summary:', {
      success: true,
      dataKeys: Object.keys(responseData),
      totalFuelVolume: responseData.totalFuelVolume,
      netSales: responseData.netSales,
      profit: responseData.profit,
      avgPPL: responseData.avgPPL,
      customerCount: responseData.customerCount,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching dashboard metrics:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/charts/monthly-performance
 * Get monthly performance chart data for year(s)
 * Query params: siteId (site_code), year (or years as comma-separated)
 */
router.get('/charts/monthly-performance', async (req, res) => {
  try {
    console.log('📈 [Backend] GET /api/dashboard/charts/monthly-performance');
    console.log('📈 [Backend] Query params:', req.query);
    
    const { siteId, year, years } = req.query;
    
    if (!siteId) {
      console.error('❌ [Backend] Missing siteId parameter');
      return res.status(400).json({
        success: false,
        message: 'siteId is required'
      });
    }
    
    const siteCode = parseInt(siteId, 10);
    console.log('📈 [Backend] Parsed siteCode:', siteCode);
    
    // Parse years - support both single year and comma-separated years
    let yearsArray = [];
    if (years) {
      yearsArray = years.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
      console.log('📈 [Backend] Parsed years array from "years" param:', yearsArray);
    } else if (year) {
      yearsArray = [parseInt(year, 10)];
      console.log('📈 [Backend] Parsed single year from "year" param:', yearsArray);
    } else {
      yearsArray = [new Date().getFullYear()];
      console.log('📈 [Backend] Using default year (current):', yearsArray);
    }
    
    if (yearsArray.length === 0) {
      console.error('❌ [Backend] Invalid year parameter');
      return res.status(400).json({
        success: false,
        message: 'Invalid year parameter'
      });
    }
    
    // Build parameterized query
    const yearPlaceholders = yearsArray.map((_, i) => `$${i + 2}`).join(',');
    const allParams = [siteCode, ...yearsArray];
    
    console.log('📈 [Backend] Final parameters:', {
      siteCode,
      yearsArray,
      yearPlaceholders
    });
    
    // Get monthly summary data aggregated across all selected years
    // Group by month and sum across all years
    // Also check fuel_margin_data for months that might not be in monthly_summary
    // Use monthly_summary as primary source, fallback to fuel_margin_data for missing months
    // This ensures we get ALL months from the database (May-Nov from fuel_margin_data, Oct-Nov from monthly_summary)
    const monthlyPerfQuery = `
      WITH monthly_data AS (
        SELECT 
          month,
          SUM(bunkered_sales + non_bunkered_sales) as total_fuel_sales,
          SUM((bunkered_sales + non_bunkered_sales) - (bunkered_purchases + non_bunkered_purchases)) as fuel_profit,
          SUM(shop_sales) as shop_sales,
          SUM(valet_sales) as valet_sales
        FROM monthly_summary
        WHERE site_code = $1
          AND year IN (${yearPlaceholders})
        GROUP BY month
      ),
      fuel_margin_data_agg AS (
        SELECT 
          month,
          SUM(net_sales) as net_sales,
          SUM(fuel_profit) as fuel_profit,
          SUM(sale_volume) as sale_volume,
          AVG(ppl) as avg_ppl
        FROM fuel_margin_data
        WHERE site_code = $1
          AND year IN (${yearPlaceholders})
        GROUP BY month
      ),
      all_months AS (
        SELECT DISTINCT month FROM monthly_data
        UNION
        SELECT DISTINCT month FROM fuel_margin_data_agg
      )
      SELECT 
        am.month,
        -- Prioritize fuel_margin_data.net_sales to match Excel data
        -- Fallback to monthly_summary if fuel_margin_data is not available
        CASE 
          WHEN fmd.net_sales IS NOT NULL AND fmd.net_sales > 0 
          THEN fmd.net_sales 
          ELSE COALESCE(md.total_fuel_sales, 0) 
        END as total_fuel_sales,
        CASE 
          WHEN fmd.fuel_profit IS NOT NULL 
          THEN fmd.fuel_profit 
          ELSE COALESCE(md.fuel_profit, 0) 
        END as fuel_profit,
        COALESCE(fmd.sale_volume, 0) as sale_volume,
        COALESCE(fmd.avg_ppl, 0) as avg_ppl,
        COALESCE(md.shop_sales, 0) as shop_sales,
        COALESCE(md.valet_sales, 0) as valet_sales
      FROM all_months am
      LEFT JOIN monthly_data md ON am.month = md.month
      LEFT JOIN fuel_margin_data_agg fmd ON am.month = fmd.month
      ORDER BY am.month;
    `;
    console.log('📈 [Backend] Executing monthly performance query from DATABASE:', {
      siteCode,
      yearsArray,
      query: monthlyPerfQuery,
      params: allParams,
      note: 'Querying monthly_summary and fuel_margin_data tables to get ALL months with data'
    });
    // Initialize data for all 12 months - ensure ALL months are included even if no data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const result = await query(monthlyPerfQuery, allParams);
    console.log('📈 [Backend] Monthly performance query result from DATABASE:', {
      rowCount: result.rows.length,
      months: result.rows.map(r => ({ 
        month: r.month, 
        monthName: monthNames[r.month - 1],
        sales: r.total_fuel_sales,
        profit: r.fuel_profit,
        shopSales: r.shop_sales,
        valetSales: r.valet_sales
      })),
      monthsList: result.rows.map(r => `${monthNames[r.month - 1]} (${r.month})`).join(', '),
      dataSource: 'DATABASE - Combined from monthly_summary and fuel_margin_data tables'
    });
    
    if (result.rows.length === 0) {
      console.warn('⚠️ [Backend] No data found in database for site', siteCode, 'year(s)', yearsArray);
    }
    const salesData = new Array(12).fill(0);
    const profitData = new Array(12).fill(0);
    const saleVolumeData = new Array(12).fill(0);
    const pplData = new Array(12).fill(0);
    const shopSalesData = new Array(12).fill(0);
    const valetSalesData = new Array(12).fill(0);
    
    console.log('📈 [Backend] Initializing arrays for all 12 months:', {
      monthNames,
      initialSalesData: salesData,
      rowsFromDB: result.rows.length,
      monthsWithData: result.rows.map(r => r.month)
    });
    
    // Fill in actual data (aggregated across all years)
    result.rows.forEach(row => {
      const monthIndex = row.month - 1; // month is 1-12, array is 0-11
      if (monthIndex >= 0 && monthIndex < 12) {
        salesData[monthIndex] = parseFloat(row.total_fuel_sales || 0);
        profitData[monthIndex] = parseFloat(row.fuel_profit || 0);
        saleVolumeData[monthIndex] = parseFloat(row.sale_volume || 0);
        pplData[monthIndex] = parseFloat(row.avg_ppl || 0);
        shopSalesData[monthIndex] = parseFloat(row.shop_sales || 0);
        valetSalesData[monthIndex] = parseFloat(row.valet_sales || 0);
      }
    });
    
    console.log('📈 [Backend] After filling data from database:', {
      salesData,
      shopSalesData,
      valetSalesData,
      monthsWithSales: salesData.map((val, idx) => ({ month: monthNames[idx], value: val })).filter(m => m.value > 0),
      allMonthsIncluded: salesData.length === 12
    });
    
    const responseData = {
      labels: monthNames,
      datasets: [
        {
          name: 'Sales',
          data: salesData
        },
        {
          name: 'Profit',
          data: profitData
        },
        {
          name: 'Sale Volume',
          data: saleVolumeData
        },
        {
          name: 'PPL',
          data: pplData
        },
        {
          name: 'Shop Sales',
          data: shopSalesData
        },
        {
          name: 'Valet Sales',
          data: valetSalesData
        }
      ]
    };
    
    console.log('📈 [Backend] Monthly performance response data:', {
      labelsCount: responseData.labels.length,
      labels: responseData.labels,
      salesDataPoints: salesData.filter(v => v > 0).length,
      profitDataPoints: profitData.filter(v => v > 0).length,
      shopSalesDataPoints: shopSalesData.filter(v => v > 0).length,
      valetSalesDataPoints: valetSalesData.filter(v => v > 0).length,
      totalSales: salesData.reduce((a, b) => a + b, 0),
      totalProfit: profitData.reduce((a, b) => a + b, 0),
      allMonthsIncluded: responseData.labels.length === 12,
      datasetsCount: responseData.datasets.length
    });
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching monthly performance:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly performance',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/charts/sales-distribution
 * Get sales distribution chart data
 * Query params: siteId (site_code), month (or months), year (or years)
 */
router.get('/charts/sales-distribution', async (req, res) => {
  try {
    console.log('📊 [Backend] GET /api/dashboard/charts/sales-distribution');
    console.log('📊 [Backend] Query params:', req.query);
    
    const { siteId, month, months, year, years } = req.query;
    
    if (!siteId) {
      console.error('❌ [Backend] Missing siteId parameter');
      return res.status(400).json({
        success: false,
        message: 'siteId is required'
      });
    }
    
    const siteCode = parseInt(siteId, 10);
    console.log('📊 [Backend] Parsed siteCode:', siteCode);
    
    // Parse months
    let monthsArray = [];
    if (months) {
      monthsArray = months.split(',').map(m => parseInt(m.trim(), 10)).filter(m => !isNaN(m) && m >= 1 && m <= 12);
      console.log('📊 [Backend] Parsed months array from "months" param:', monthsArray);
    } else if (month) {
      monthsArray = [parseInt(month, 10)];
      console.log('📊 [Backend] Parsed single month from "month" param:', monthsArray);
    } else {
      monthsArray = [new Date().getMonth() + 1];
      console.log('📊 [Backend] Using default month (current):', monthsArray);
    }
    
    // Parse years
    let yearsArray = [];
    if (years) {
      yearsArray = years.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
      console.log('📊 [Backend] Parsed years array from "years" param:', yearsArray);
    } else if (year) {
      yearsArray = [parseInt(year, 10)];
      console.log('📊 [Backend] Parsed single year from "year" param:', yearsArray);
    } else {
      yearsArray = [new Date().getFullYear()];
      console.log('📊 [Backend] Using default year (current):', yearsArray);
    }
    
    if (monthsArray.length === 0 || yearsArray.length === 0) {
      console.warn('⚠️ [Backend] Empty months or years array, returning zero data');
      return res.json({
        success: true,
        data: [
          { name: 'Fuel Sales', value: 0 },
          { name: 'Shop Sales', value: 0 },
          { name: 'Valet Sales', value: 0 }
        ]
      });
    }
    
    // Build parameterized query for multiple months and years
    const allParams = [siteCode, ...monthsArray, ...yearsArray];
    const monthPlaceholders = monthsArray.map((_, i) => `$${i + 2}`).join(',');
    const yearStartIndex = monthsArray.length + 2;
    const yearPlaceholders = yearsArray.map((_, i) => `$${yearStartIndex + i}`).join(',');
    
    console.log('📊 [Backend] Final parameters:', {
      siteCode,
      monthsArray,
      yearsArray,
      monthPlaceholders,
      yearPlaceholders
    });
    
    // Get sales data from fuel_margin_data (net_sales) to match Excel data
    // Also get shop/valet sales from monthly_summary for breakdown
    const fuelSalesQuery = `
      SELECT 
        SUM(net_sales) as net_sales
      FROM fuel_margin_data
      WHERE site_code = $1
        AND month IN (${monthPlaceholders})
        AND year IN (${yearPlaceholders});
    `;
    
    const shopValetQuery = `
      SELECT 
        SUM(shop_sales) as shop_sales,
        SUM(valet_sales) as valet_sales
      FROM monthly_summary
      WHERE site_code = $1
        AND month IN (${monthPlaceholders})
        AND year IN (${yearPlaceholders});
    `;
    
    console.log('📊 [Backend] Executing sales distribution queries:', {
      fuelSalesQuery,
      shopValetQuery,
      params: allParams
    });
    
    const [fuelResult, shopValetResult] = await Promise.all([
      query(fuelSalesQuery, allParams),
      query(shopValetQuery, allParams)
    ]);
    
    console.log('📊 [Backend] Sales distribution query results:', {
      fuelSales: {
        rowCount: fuelResult.rows.length,
        data: fuelResult.rows[0]
      },
      shopValet: {
        rowCount: shopValetResult.rows.length,
        data: shopValetResult.rows[0]
      }
    });
    
    if ((fuelResult.rows.length === 0 || !fuelResult.rows[0]) && 
        (shopValetResult.rows.length === 0 || !shopValetResult.rows[0])) {
      return res.json({
        success: true,
        data: [
          { name: 'Fuel Sales', value: 0 },
          { name: 'Shop Sales', value: 0 },
          { name: 'Valet Sales', value: 0 }
        ]
      });
    }
    
    // Use net_sales from fuel_margin_data (matches Excel data)
    const fuelRow = fuelResult.rows[0] || {};
    const shopValetRow = shopValetResult.rows[0] || {};
    const fuelSales = parseFloat(fuelRow.net_sales || 0);
    const shopSales = parseFloat(shopValetRow.shop_sales || 0);
    const valetSales = parseFloat(shopValetRow.valet_sales || 0);
    
    const responseData = [
      { name: 'Fuel Sales', value: fuelSales },
      { name: 'Shop Sales', value: shopSales },
      { name: 'Valet Sales', value: valetSales }
    ];
    
    console.log('📊 [Backend] Calculated sales distribution:', responseData);
    console.log('📊 [Backend] Total sales:', fuelSales + shopSales + valetSales);
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching sales distribution:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching sales distribution',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/status
 * Get status cards data (bank balance, debtors, etc.)
 * Note: These might not be in the current database schema
 * Query params: siteId (site_code)
 */
router.get('/status', async (req, res) => {
  try {
    const { siteId } = req.query;
    
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'siteId is required'
      });
    }
    
    const siteCode = parseInt(siteId, 10);
    
    // Note: Bank balance, debtors, creditors, discounts are not in current schema
    // These would typically come from accounting/transaction data
    // For now, return placeholder structure that can be updated when data is available
    
    // Check if we can derive any of this from transactions
    // This is a placeholder - adjust based on your actual accounting data structure
    
    res.json({
      success: true,
      data: {
        bankClosingBalance: 0, // Would need accounting data
        debtorsTotal: 0, // Would need accounts receivable data
        fuelCreditors: 0, // Would need accounts payable data
        fuelCondition: 'Normal', // Would need stock/condition data
        discountsTotal: 0 // Would need discount/transaction data
      },
      note: 'Status data not available in current database schema. These fields would need to be added or calculated from transaction/accounting data.'
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/charts/date-wise
 * Get daily/date-wise sales data for a specific site and month/year
 * Query params: siteId, month (or months), year (or years)
 */
router.get('/charts/date-wise', async (req, res) => {
  try {
    console.log('📅 [Backend] GET /api/dashboard/charts/date-wise');
    console.log('📅 [Backend] Query params:', req.query);
    
    const { siteId, month, months, year, years } = req.query;
    
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'siteId is required'
      });
    }
    
    const siteCode = parseInt(siteId, 10);
    
    // Parse months and years
    let monthsArray = [];
    if (months) {
      monthsArray = months.split(',').map(m => parseInt(m.trim(), 10)).filter(m => !isNaN(m) && m >= 1 && m <= 12);
    } else if (month) {
      monthsArray = [parseInt(month, 10)];
    } else {
      monthsArray = [new Date().getMonth() + 1];
    }
    
    let yearsArray = [];
    if (years) {
      yearsArray = years.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
    } else if (year) {
      yearsArray = [parseInt(year, 10)];
    } else {
      yearsArray = [new Date().getFullYear()];
    }
    
    if (monthsArray.length === 0 || yearsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year parameters'
      });
    }
    
    // Get daily sales from transactions table
    // Aggregate by day for the selected months/years
    const monthPlaceholders = monthsArray.map((_, i) => `$${i + 2}`).join(',');
    const yearStartIndex = monthsArray.length + 2;
    const yearPlaceholders = yearsArray.map((_, i) => `$${yearStartIndex + i}`).join(',');
    const allParams = [siteCode, ...monthsArray, ...yearsArray];
    
    const dailySalesQuery = `
      SELECT 
        EXTRACT(DAY FROM transaction_date) as day,
        SUM(CASE WHEN category = 'fuel_sales' THEN amount ELSE 0 END) as fuel_sales,
        SUM(CASE WHEN category = 'shop_sales' THEN amount ELSE 0 END) as shop_sales,
        SUM(CASE WHEN category = 'valet_sales' THEN amount ELSE 0 END) as valet_sales,
        SUM(CASE WHEN category IN ('fuel_sales', 'shop_sales', 'valet_sales') THEN amount ELSE 0 END) as total_sales,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE site_code = $1
        AND EXTRACT(MONTH FROM transaction_date) IN (${monthPlaceholders})
        AND EXTRACT(YEAR FROM transaction_date) IN (${yearPlaceholders})
        AND deleted_flag = 0
        AND category IN ('fuel_sales', 'shop_sales', 'valet_sales')
      GROUP BY EXTRACT(DAY FROM transaction_date)
      ORDER BY day;
    `;
    
    console.log('📅 [Backend] Executing daily sales query:', {
      query: dailySalesQuery,
      params: allParams
    });
    
    const result = await query(dailySalesQuery, allParams);
    console.log('📅 [Backend] Daily sales query result:', {
      rowCount: result.rows.length,
      sampleData: result.rows.slice(0, 5)
    });
    
    // Transform data for chart
    const chartData = result.rows.map(row => ({
      day: parseInt(row.day, 10),
      sales: parseFloat(row.total_sales || 0),
      fuelSales: parseFloat(row.fuel_sales || 0),
      shopSales: parseFloat(row.shop_sales || 0),
      valetSales: parseFloat(row.valet_sales || 0),
      transactionCount: parseInt(row.transaction_count || 0, 10)
    }));
    
    console.log('📅 [Backend] Transformed chart data:', {
      totalDays: chartData.length,
      daysWithData: chartData.filter(d => d.sales > 0).length,
      totalSales: chartData.reduce((sum, d) => sum + d.sales, 0),
      sampleDays: chartData.slice(0, 5)
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching date-wise data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching date-wise data',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/total-sales
 * Get total sales across all sites
 * Query params: month (or months as comma-separated), year (or years as comma-separated)
 */
router.get('/total-sales', async (req, res) => {
  try {
    console.log('📊 [Backend] GET /api/dashboard/total-sales');
    console.log('📊 [Backend] Query params:', req.query);
    
    const { month, months, year, years } = req.query;
    
    // If no month/year provided, get ALL data across all months and years
    const getAllData = !month && !months && !year && !years;
    
    let totalSalesQuery, shopValetQuery, allParams;
    
    if (getAllData) {
      // Get total sales across all sites, all months, all years
      totalSalesQuery = `
        SELECT 
          SUM(net_sales) as total_net_sales
        FROM fuel_margin_data;
      `;
      
      shopValetQuery = `
        SELECT 
          SUM(shop_sales) as total_shop_sales,
          SUM(valet_sales) as total_valet_sales
        FROM monthly_summary;
      `;
      
      allParams = [];
      
      console.log('📊 [Backend] Getting ALL sales data (no month/year filter)');
    } else {
      // Parse months - support both single month and comma-separated months
      let monthsArray = [];
      if (months) {
        monthsArray = months.split(',').map(m => parseInt(m.trim(), 10)).filter(m => !isNaN(m) && m >= 1 && m <= 12);
      } else if (month) {
        monthsArray = [parseInt(month, 10)];
      } else {
        monthsArray = [new Date().getMonth() + 1];
      }
      
      // Parse years - support both single year and comma-separated years
      let yearsArray = [];
      if (years) {
        yearsArray = years.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
      } else if (year) {
        yearsArray = [parseInt(year, 10)];
      } else {
        yearsArray = [new Date().getFullYear()];
      }
      
      if (monthsArray.length === 0 || yearsArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month or year parameters'
        });
      }
      
      // Build parameterized query for multiple months and years
      const monthPlaceholders = monthsArray.map((_, i) => `$${i + 1}`).join(',');
      const yearStartIndex = monthsArray.length + 1;
      const yearPlaceholders = yearsArray.map((_, i) => `$${yearStartIndex + i}`).join(',');
      allParams = [...monthsArray, ...yearsArray];
      
      // Get total sales across all sites from fuel_margin_data
      totalSalesQuery = `
        SELECT 
          SUM(net_sales) as total_net_sales
        FROM fuel_margin_data
        WHERE month IN (${monthPlaceholders})
          AND year IN (${yearPlaceholders});
      `;
      
      // Also get shop and valet sales from monthly_summary
      shopValetQuery = `
        SELECT 
          SUM(shop_sales) as total_shop_sales,
          SUM(valet_sales) as total_valet_sales
        FROM monthly_summary
        WHERE month IN (${monthPlaceholders})
          AND year IN (${yearPlaceholders});
      `;
    }
    
    console.log('📊 [Backend] Executing total sales queries:', {
      totalSalesQuery,
      shopValetQuery,
      params: allParams,
      getAllData
    });
    
    const [totalSalesResult, shopValetResult] = await Promise.all([
      query(totalSalesQuery, allParams),
      query(shopValetQuery, allParams)
    ]);
    
    const totalNetSales = parseFloat(totalSalesResult.rows[0]?.total_net_sales || 0);
    const totalShopSales = parseFloat(shopValetResult.rows[0]?.total_shop_sales || 0);
    const totalValetSales = parseFloat(shopValetResult.rows[0]?.total_valet_sales || 0);
    
    // Total sales = net sales (fuel) + shop sales + valet sales
    const grandTotal = totalNetSales + totalShopSales + totalValetSales;
    
    console.log('📊 [Backend] Total sales across all sites:', {
      totalNetSales,
      totalShopSales,
      totalValetSales,
      grandTotal,
      getAllData
    });
    
    res.json({
      success: true,
      data: {
        totalSales: grandTotal,
        fuelSales: totalNetSales,
        shopSales: totalShopSales,
        valetSales: totalValetSales
      }
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching total sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total sales',
      error: error.message
    });
  }
});

export default router;

