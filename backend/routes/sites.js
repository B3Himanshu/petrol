import express from 'express';
import { query } from '../config/database.js';
import { mapSiteToFrontend, getCityFromPostcode } from '../utils/cityMapping.js';

const router = express.Router();

/**
 * GET /api/sites
 * Get all sites
 */
router.get('/', async (req, res) => {
  try {
    console.log('🏢 [Backend] GET /api/sites');
    console.log('🏢 [Backend] Query params:', req.query);
    
    // Get sites from database - using actual schema: site_code, site_name, post_code
    // Filter out sites with site_code 0 or 1 (these appear to be header/company rows)
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
    console.log('🏢 [Backend] Executing sites query');
    const result = await query(sitesQuery);
    console.log('🏢 [Backend] Sites query result:', {
      rowCount: result.rows.length,
      sampleSites: result.rows.slice(0, 3).map(r => ({ code: r.site_code, name: r.site_name }))
    });
    
    // Map database format to frontend format
    const mappedSites = result.rows.map(mapSiteToFrontend);
    console.log('🏢 [Backend] Mapped sites:', {
      totalCount: mappedSites.length,
      sampleMapped: mappedSites.slice(0, 3)
    });
    
    res.json({
      success: true,
      count: mappedSites.length,
      data: mappedSites
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching sites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sites',
      error: error.message
    });
  }
});

/**
 * GET /api/sites/:id
 * Get site by ID (site_code)
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('🏢 [Backend] GET /api/sites/:id');
    console.log('🏢 [Backend] Params:', req.params);
    
    const { id } = req.params;
    const siteCode = parseInt(id, 10);
    console.log('🏢 [Backend] Parsed siteCode:', siteCode);
    
    if (isNaN(siteCode)) {
      console.error('❌ [Backend] Invalid site ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid site ID'
      });
    }
    
    const siteQuery = `
      SELECT 
        site_code,
        site_name,
        post_code,
        company,
        is_active,
        is_bunkered
      FROM sites
      WHERE site_code = $1;
    `;
    console.log('🏢 [Backend] Executing site query:', { query: siteQuery, params: [siteCode] });
    const result = await query(siteQuery, [siteCode]);
    console.log('🏢 [Backend] Site query result:', {
      rowCount: result.rows.length,
      data: result.rows[0]
    });
    
    if (result.rows.length === 0) {
      console.warn('⚠️ [Backend] Site not found:', siteCode);
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }
    
    // Map to frontend format
    const mappedSite = mapSiteToFrontend(result.rows[0]);
    console.log('🏢 [Backend] Mapped site:', mappedSite);
    
    res.json({
      success: true,
      data: mappedSite
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching site:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching site',
      error: error.message
    });
  }
});

/**
 * GET /api/sites/city/:cityId
 * Get all sites for a specific city
 */
router.get('/city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    
    if (cityId === 'all') {
      // Return all sites
      const result = await query(`
        SELECT 
          site_code,
          site_name,
          post_code,
          company,
          is_active,
          is_bunkered
        FROM sites
        WHERE is_active = true
        ORDER BY site_code;
      `);
      
      const mappedSites = result.rows.map(mapSiteToFrontend);
      
      return res.json({
        success: true,
        count: mappedSites.length,
        data: mappedSites
      });
    }
    
    // Get all sites and filter by city (since city is derived from postcode)
    const result = await query(`
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
    `);
    
    // Map and filter by city
    const mappedSites = result.rows
      .map(mapSiteToFrontend)
      .filter(site => site.city === cityId);
    
    res.json({
      success: true,
      count: mappedSites.length,
      data: mappedSites
    });
  } catch (error) {
    console.error('Error fetching sites by city:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sites by city',
      error: error.message
    });
  }
});

/**
 * GET /api/sites/cities/list
 * Get list of unique cities (derived from postcodes)
 */
router.get('/cities/list', async (req, res) => {
  try {
    // Get all sites with postcodes
    const result = await query(`
      SELECT DISTINCT post_code
      FROM sites
      WHERE is_active = true 
        AND site_code > 1
        AND post_code IS NOT NULL
        AND post_code != ''
      ORDER BY post_code;
    `);
    
    // Extract unique cities from postcodes
    const cityMap = new Map();
    result.rows.forEach(row => {
      const cityInfo = getCityFromPostcode(row.post_code);
      if (cityInfo && !cityMap.has(cityInfo.city)) {
        cityMap.set(cityInfo.city, {
          id: cityInfo.city,
          displayName: cityInfo.cityDisplay
        });
      }
    });
    
    const cities = Array.from(cityMap.values())
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    
    res.json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
      error: error.message
    });
  }
});

export default router;

