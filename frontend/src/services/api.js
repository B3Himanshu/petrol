/**
 * API Service
 * Handles all backend API communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    console.log(`🔵 [API Request] ${endpoint}`, {
      method: options.method || 'GET',
      body: options.body ? JSON.parse(options.body) : undefined,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`❌ [API Error] ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE_URL}${endpoint}`
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ [API Response] ${endpoint}`, {
      success: data.success,
      dataLength: Array.isArray(data.data) ? data.data.length : data.data ? Object.keys(data.data).length : 0,
      data: data,
      timestamp: new Date().toISOString()
    });
    return data;
  } catch (error) {
    console.error(`❌ [API Error] ${endpoint}`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Sites API
 */
export const sitesAPI = {
  /**
   * Get all sites
   */
  getAll: async () => {
    console.log('🏢 [Frontend] sitesAPI.getAll called');
    const response = await fetchAPI('/api/sites');
    console.log('🏢 [Frontend] sitesAPI.getAll response:', {
      count: response.count,
      sitesCount: response.data?.length || 0
    });
    return response.data || [];
  },

  /**
   * Get site by ID
   */
  getById: async (id) => {
    console.log('🏢 [Frontend] sitesAPI.getById called', { id });
    const response = await fetchAPI(`/api/sites/${id}`);
    console.log('🏢 [Frontend] sitesAPI.getById response:', response.data);
    return response.data;
  },

  /**
   * Get sites by city
   */
  getByCity: async (cityId) => {
    if (cityId === 'all') {
      return sitesAPI.getAll();
    }
    const response = await fetchAPI(`/api/sites/city/${cityId}`);
    return response.data || [];
  },

  /**
   * Get list of unique cities
   */
  getCities: async () => {
    const response = await fetchAPI('/api/sites/cities/list');
    return response.data || [];
  },
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  /**
   * Get dashboard metrics
   * @param {number} siteId - Site code
   * @param {number|number[]} month - Month (1-12) or array of months
   * @param {number|number[]} year - Year or array of years
   */
  getMetrics: async (siteId, month, year) => {
    console.log('📊 [Frontend] getMetrics called', {
      siteId,
      month,
      year,
      monthType: Array.isArray(month) ? 'array' : typeof month,
      yearType: Array.isArray(year) ? 'array' : typeof year
    });

    const params = new URLSearchParams({
      siteId: siteId.toString(),
    });
    
    // Handle multiple months/years
    if (Array.isArray(month) && month.length > 0) {
      params.append('months', month.join(','));
      console.log('📊 [Frontend] Adding months array:', month.join(','));
    } else if (month) {
      params.append('month', month.toString());
      console.log('📊 [Frontend] Adding single month:', month);
    }
    
    if (Array.isArray(year) && year.length > 0) {
      params.append('years', year.join(','));
      console.log('📊 [Frontend] Adding years array:', year.join(','));
    } else if (year) {
      params.append('year', year.toString());
      console.log('📊 [Frontend] Adding single year:', year);
    }
    
    const fullUrl = `/api/dashboard/metrics?${params}`;
    console.log('📊 [Frontend] Full API URL:', fullUrl);
    
    const response = await fetchAPI(fullUrl);
    console.log('📊 [Frontend] getMetrics response:', response);
    return response.data;
  },

  /**
   * Get monthly performance chart data
   * @param {number} siteId - Site code
   * @param {number|number[]} year - Year or array of years
   */
  getMonthlyPerformance: async (siteId, year) => {
    console.log('📈 [Frontend] getMonthlyPerformance called', {
      siteId,
      year,
      yearType: Array.isArray(year) ? 'array' : typeof year
    });

    const params = new URLSearchParams({
      siteId: siteId.toString(),
    });
    
    // Handle multiple years
    if (Array.isArray(year) && year.length > 0) {
      params.append('years', year.join(','));
      console.log('📈 [Frontend] Adding years array:', year.join(','));
    } else if (year) {
      params.append('year', year.toString());
      console.log('📈 [Frontend] Adding single year:', year);
    }
    
    const fullUrl = `/api/dashboard/charts/monthly-performance?${params}`;
    console.log('📈 [Frontend] Full API URL:', fullUrl);
    
    const response = await fetchAPI(fullUrl);
    console.log('📈 [Frontend] getMonthlyPerformance response:', response);
    return response.data;
  },

  /**
   * Get sales distribution chart data
   * @param {number} siteId - Site code
   * @param {number|number[]} month - Month (1-12) or array of months
   * @param {number|number[]} year - Year or array of years
   */
  getSalesDistribution: async (siteId, month, year) => {
    console.log('📊 [Frontend] getSalesDistribution called', {
      siteId,
      month,
      year,
      monthType: Array.isArray(month) ? 'array' : typeof month,
      yearType: Array.isArray(year) ? 'array' : typeof year
    });

    const params = new URLSearchParams({
      siteId: siteId.toString(),
    });
    
    // Handle multiple months/years
    if (Array.isArray(month) && month.length > 0) {
      params.append('months', month.join(','));
      console.log('📊 [Frontend] Adding months array:', month.join(','));
    } else if (month) {
      params.append('month', month.toString());
      console.log('📊 [Frontend] Adding single month:', month);
    }
    
    if (Array.isArray(year) && year.length > 0) {
      params.append('years', year.join(','));
      console.log('📊 [Frontend] Adding years array:', year.join(','));
    } else if (year) {
      params.append('year', year.toString());
      console.log('📊 [Frontend] Adding single year:', year);
    }
    
    const fullUrl = `/api/dashboard/charts/sales-distribution?${params}`;
    console.log('📊 [Frontend] Full API URL:', fullUrl);
    
    const response = await fetchAPI(fullUrl);
    console.log('📊 [Frontend] getSalesDistribution response:', response);
    return response.data;
  },

  /**
   * Get status cards data
   * @param {number} siteId - Site code
   */
  getStatus: async (siteId) => {
    console.log('📋 [Frontend] getStatus called', { siteId });
    const params = new URLSearchParams({
      siteId: siteId.toString(),
    });
    const fullUrl = `/api/dashboard/status?${params}`;
    console.log('📋 [Frontend] Full API URL:', fullUrl);
    const response = await fetchAPI(fullUrl);
    console.log('📋 [Frontend] getStatus response:', response);
    return response.data;
  },

  /**
   * Get date-wise/daily sales data
   * @param {number} siteId - Site code
   * @param {number|number[]} month - Month (1-12) or array of months
   * @param {number|number[]} year - Year or array of years
   */
  getDateWiseData: async (siteId, month, year) => {
    console.log('📅 [Frontend] getDateWiseData called', { siteId, month, year });
    
    const params = new URLSearchParams({
      siteId: siteId.toString(),
    });
    
    if (Array.isArray(month) && month.length > 0) {
      params.append('months', month.join(','));
    } else if (month) {
      params.append('month', month.toString());
    }
    
    if (Array.isArray(year) && year.length > 0) {
      params.append('years', year.join(','));
    } else if (year) {
      params.append('year', year.toString());
    }
    
    const fullUrl = `/api/dashboard/charts/date-wise?${params}`;
    console.log('📅 [Frontend] Full API URL:', fullUrl);
    const response = await fetchAPI(fullUrl);
    console.log('📅 [Frontend] getDateWiseData response:', response);
    return response.data;
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return fetchAPI('/health');
};

export default {
  sites: sitesAPI,
  dashboard: dashboardAPI,
  healthCheck,
};

