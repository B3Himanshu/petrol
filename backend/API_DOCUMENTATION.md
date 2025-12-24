# API Documentation

## Base URL
`http://localhost:3001`

## Endpoints

### Sites API

#### GET /api/sites
Get all active sites

**Response:**
```json
{
  "success": true,
  "count": 31,
  "data": [
    {
      "id": 6,
      "name": "Manor Service Station",
      "postCode": "SO19 1AR",
      "city": "southampton",
      "cityDisplay": "Southampton"
    },
    ...
  ]
}
```

#### GET /api/sites/:id
Get site by ID (site_code)

**Parameters:**
- `id` - Site code (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Manor Service Station",
    "postCode": "SO19 1AR",
    "city": "southampton",
    "cityDisplay": "Southampton"
  }
}
```

#### GET /api/sites/city/:cityId
Get all sites for a specific city

**Parameters:**
- `cityId` - City identifier (e.g., "southampton", "all")

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

#### GET /api/sites/cities/list
Get list of unique cities

**Response:**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "southampton",
      "displayName": "Southampton"
    },
    ...
  ]
}
```

### Dashboard API

#### GET /api/dashboard/metrics
Get dashboard metrics for a specific site

**Query Parameters:**
- `siteId` (required) - Site code
- `month` (optional) - Month (1-12), defaults to current month
- `year` (optional) - Year, defaults to current year

**Example:**
```
GET /api/dashboard/metrics?siteId=6&month=11&year=2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFuelVolume": 118017.14,
    "netSales": 139861.64,
    "profit": 139861.64,
    "avgPPL": 10.04,
    "actualPPL": 10.04,
    "labourCostPercent": 0,
    "basketSize": 425.50,
    "customerCount": 12450
  }
}
```

**Data Sources:**
- `totalFuelVolume`: Sum of bunkered_volume + non_bunkered_volume from `monthly_summary`
- `netSales`: From `fuel_margin_data.net_sales` or calculated from monthly_summary
- `profit`: Sum of fuel_profit + shop_profit + valet_profit
- `avgPPL`: From `fuel_margin_data.ppl`
- `labourCostPercent`: Calculated from labour_cost / shop_sales
- `basketSize`: Calculated from shop_sales / transaction_count
- `customerCount`: Count of transactions

#### GET /api/dashboard/charts/monthly-performance
Get monthly performance chart data for a year

**Query Parameters:**
- `siteId` (required) - Site code
- `year` (optional) - Year, defaults to current year

**Example:**
```
GET /api/dashboard/charts/monthly-performance?siteId=6&year=2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "datasets": [
      {
        "name": "Sales",
        "data": [120000, 135000, 150000, ...]
      },
      {
        "name": "Profit",
        "data": [80000, 90000, 100000, ...]
      }
    ]
  }
}
```

**Data Source:** `monthly_summary` table

#### GET /api/dashboard/charts/sales-distribution
Get sales distribution chart data

**Query Parameters:**
- `siteId` (required) - Site code
- `month` (optional) - Month (1-12), defaults to current month
- `year` (optional) - Year, defaults to current year

**Example:**
```
GET /api/dashboard/charts/sales-distribution?siteId=6&month=11&year=2025
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "Fuel Sales", "value": 139861.64 },
    { "name": "Shop Sales", "value": 754.36 },
    { "name": "Valet Sales", "value": 72.00 }
  ]
}
```

**Data Source:** `monthly_summary` table

#### GET /api/dashboard/status
Get status cards data

**Query Parameters:**
- `siteId` (required) - Site code

**Response:**
```json
{
  "success": true,
  "data": {
    "bankClosingBalance": 0,
    "debtorsTotal": 0,
    "fuelCreditors": 0,
    "fuelCondition": "Normal",
    "discountsTotal": 0
  },
  "note": "Status data not available in current database schema..."
}
```

**Note:** These fields are not in the current database schema and would need to be added or calculated from transaction/accounting data.

## Database Schema Mapping

### Sites Table
- `site_code` → `id` (frontend)
- `site_name` → `name` (frontend)
- `post_code` → `postCode` (frontend)
- `city` → Derived from postcode using mapping utility
- `cityDisplay` → Derived from postcode using mapping utility

### Monthly Summary Table
Used for:
- Monthly performance charts
- Sales distribution
- Dashboard metrics (volumes, sales, profits)

### Fuel Margin Data Table
Used for:
- PPL (Price Per Liter) calculations
- Net sales
- Fuel profit and margin

### Daily Summary Table
Available for:
- Date-wise charts
- Daily breakdowns

### Transactions Table
Used for:
- Customer count
- Basket size calculations
- Transaction-level data

## City Mapping

Cities are derived from UK postcode area codes:
- `SO` → Southampton
- `GU` → Guildford
- `EX` → Exmouth
- `PE` → Peterborough (with exceptions for Wisbech)
- `WA` → Warrington
- etc.

See `utils/cityMapping.js` for full mapping logic.

