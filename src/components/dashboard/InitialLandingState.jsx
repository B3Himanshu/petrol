import { MapPin, Globe, ZoomIn, ZoomOut, Navigation, Layers, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

// Lat/lon for each city so we can build a focused map view when a city is selected
const cityMapConfig = {
  // Major cities (existing)
  london: { lat: 51.5074, lon: -0.1278, delta: 1.0 },
  manchester: { lat: 53.4808, lon: -2.2426, delta: 1.0 },
  birmingham: { lat: 52.4862, lon: -1.8904, delta: 1.0 },
  glasgow: { lat: 55.8642, lon: -4.2518, delta: 1.2 },
  liverpool: { lat: 53.4084, lon: -2.9916, delta: 1.0 },
  leeds: { lat: 53.8008, lon: -1.5491, delta: 1.0 },
  edinburgh: { lat: 55.9533, lon: -3.1883, delta: 1.2 },
  bristol: { lat: 51.4545, lon: -2.5879, delta: 1.0 },
  cardiff: { lat: 51.4816, lon: -3.1791, delta: 1.0 },
  // Additional major UK cities
  newcastle: { lat: 54.9783, lon: -1.6178, delta: 1.0 },
  sheffield: { lat: 53.3811, lon: -1.4701, delta: 1.0 },
  nottingham: { lat: 52.9548, lon: -1.1581, delta: 1.0 },
  leicester: { lat: 52.6369, lon: -1.1398, delta: 1.0 },
  coventry: { lat: 52.4068, lon: -1.5197, delta: 1.0 },
  southampton: { lat: 50.9097, lon: -1.4044, delta: 1.0 },
  portsmouth: { lat: 50.8198, lon: -1.0880, delta: 1.0 },
  brighton: { lat: 50.8225, lon: -0.1372, delta: 1.0 },
  norwich: { lat: 52.6309, lon: 1.2974, delta: 1.0 },
  cambridge: { lat: 52.2053, lon: 0.1218, delta: 1.0 },
  oxford: { lat: 51.7520, lon: -1.2577, delta: 1.0 },
  york: { lat: 53.9600, lon: -1.0873, delta: 1.0 },
  hull: { lat: 53.7457, lon: -0.3367, delta: 1.0 },
  derby: { lat: 52.9225, lon: -1.4746, delta: 1.0 },
  stoke: { lat: 53.0258, lon: -2.1774, delta: 1.0 },
  reading: { lat: 51.4543, lon: -0.9781, delta: 1.0 },
  plymouth: { lat: 50.3755, lon: -4.1427, delta: 1.0 },
  exeter: { lat: 50.7184, lon: -3.5339, delta: 1.0 },
  bournemouth: { lat: 50.7192, lon: -1.8808, delta: 1.0 },
  swansea: { lat: 51.6214, lon: -3.9436, delta: 1.0 },
  belfast: { lat: 54.5973, lon: -5.9301, delta: 1.0 },
  aberdeen: { lat: 57.1497, lon: -2.0943, delta: 1.2 },
  dundee: { lat: 56.4620, lon: -2.9707, delta: 1.2 },
  inverness: { lat: 57.4778, lon: -4.2247, delta: 1.2 },
};

// Derive a tighter "visual UK" bounding box from the city coordinates so the
// iframe starts closer to the island (less surrounding sea, easier pin mapping).
const CITY_BOUNDS = (() => {
  const lats = Object.values(cityMapConfig).map((c) => c.lat);
  const lons = Object.values(cityMapConfig).map((c) => c.lon);
  const margin = 1.5; // degrees padding around all cities

  const south = Math.min(...lats) - margin;
  const north = Math.max(...lats) + margin;
  const west = Math.min(...lons) - margin;
  const east = Math.max(...lons) + margin;

  return { west, south, east, north };
})();

// UK bounding box for Google Maps - adjusted to match the actual visible map area
// These bounds must match exactly what the Google Maps embed shows at zoom level 3.8
// Based on the map view showing UK, Ireland, and surrounding areas
const UK_BOUNDS_GOOGLE = {
  west: -9.0,   // Western edge (includes Ireland and western UK)
  south: 49.8,  // Southern edge (English Channel - adjusted to match visible area)
  east: 2.8,    // Eastern edge (North Sea - adjusted to match visible area)
  north: 60.5   // Northern edge (Scotland - adjusted to match visible area)
};

// Numeric bounds for projecting lat/lon to percentage positions (for Google Maps)
const UK_BOUNDS = UK_BOUNDS_GOOGLE;

// UK-wide bounding box string: west,south,east,north (for OpenStreetMap fallback)
const UK_BBOX = `${UK_BOUNDS.west}%2C${UK_BOUNDS.south}%2C${UK_BOUNDS.east}%2C${UK_BOUNDS.north}`;

// Global visual tweak for pin alignment inside Google Maps iframe
// Adjusted for Google Maps satellite view - fine-tuned for proper alignment
const PIN_OFFSET = {
  // Global offset to align pins with Google Maps view
  // These values compensate for the map's actual visible area vs calculated bounds
  x: 1.0,   // Shift pins right to align with actual map view
  y: 1.5,   // Shift pins down to align with actual map view
};

// Per-city fine-tune offsets (in percentage points) for Google Maps
// Positive x -> right, positive y -> down
// These offsets fine-tune each city pin to align perfectly with the map
const CITY_OFFSETS = {
  // Major cities (existing) - Reset to zero, will be fine-tuned based on actual map alignment
  london: { x: 0, y: 0 },
  manchester: { x: 0, y: 0 },
  birmingham: { x: 0, y: 0 },
  glasgow: { x: 0, y: 0 },
  liverpool: { x: 0, y: 0 },
  leeds: { x: 0, y: 0 },
  edinburgh: { x: 0, y: 0 },
  bristol: { x: 0, y: 0 },
  cardiff: { x: 0, y: 0 },
  // Additional cities - Reset to zero, will be fine-tuned based on actual map alignment
  newcastle: { x: 0, y: 0 },
  sheffield: { x: 0, y: 0 },
  nottingham: { x: 0, y: 0 },
  leicester: { x: 0, y: 0 },
  coventry: { x: 0, y: 0 },
  southampton: { x: 0, y: 0 },
  portsmouth: { x: 0, y: 0 },
  brighton: { x: 0, y: 0 },
  norwich: { x: 0, y: 0 },
  cambridge: { x: 0, y: 0 },
  oxford: { x: 0, y: 0 },
  york: { x: 0, y: 0 },
  hull: { x: 0, y: 0 },
  derby: { x: 0, y: 0 },
  stoke: { x: 0, y: 0 },
  reading: { x: 0, y: 0 },
  plymouth: { x: 0, y: 0 },
  exeter: { x: 0, y: 0 },
  bournemouth: { x: 0, y: 0 },
  swansea: { x: 0, y: 0 },
  belfast: { x: 0, y: 0 },
  aberdeen: { x: 0, y: 0 },
  dundee: { x: 0, y: 0 },
  inverness: { x: 0, y: 0 },
};

// Convert degrees to radians
const degToRad = (deg) => (deg * Math.PI) / 180;

// Web Mercator projection for latitude (used by OpenStreetMap tiles)
const mercatorY = (latDeg) =>
  Math.log(Math.tan(Math.PI / 4 + degToRad(latDeg) / 2));

// Convert a lat/lon into top/left percentages for Google Maps - dynamically calculated
// This function calculates positions based on actual map coordinates, not hardcoded values
const projectLatLonToPercent = (lat, lon) => {
  const { west, south, east, north } = UK_BOUNDS_GOOGLE;
  
  // Calculate horizontal position (longitude) - linear interpolation
  const lonRange = east - west;
  const lonNormalized = (lon - west) / lonRange; // 0 to 1
  const xPercent = lonNormalized * 100; // Convert to percentage
  
  // Calculate vertical position (latitude) - using Web Mercator projection
  // This matches Google Maps' projection for accurate positioning
  const mercNorth = mercatorY(north);
  const mercSouth = mercatorY(south);
  const mercLat = mercatorY(lat);
  const latRange = mercNorth - mercSouth;
  const latNormalized = (mercNorth - mercLat) / latRange; // 0 to 1
  const yPercent = latNormalized * 100; // Convert to percentage

  return {
    top: yPercent,
    left: xPercent,
  };
};

// City positions on the map (top, left percentages) - dynamically calculated from lat/lon
// Positions are calculated based on actual map coordinates, ensuring pins appear on the map
const cityPositions = Object.fromEntries(
  Object.entries(cityMapConfig).map(([key, cfg]) => {
    // Calculate base position from lat/lon coordinates
    const base = projectLatLonToPercent(cfg.lat, cfg.lon);
    // Apply fine-tuning offsets for perfect alignment
    const offset = CITY_OFFSETS[key] ?? { x: 0, y: 0 };
    
    // Calculate final position with offsets
    const finalTop = base.top + PIN_OFFSET.y + offset.y;
    const finalLeft = base.left + PIN_OFFSET.x + offset.x;
    
    // Clamp values to ensure pins stay within map bounds (0-100%)
    return [
      key,
      {
        top: `${Math.max(0, Math.min(100, finalTop))}%`,
        left: `${Math.max(0, Math.min(100, finalLeft))}%`,
      },
    ];
  })
);

// Build Google Earth (3D satellite view) embed URL for UK with zoom level and markers
// Using Google Maps embed with satellite view - shows UK in 3D-like view
// No API key required for basic embed
const buildGoogleEarthSrc = (zoom = 5, showMarkers = true) => {
  // UK center coordinates (latitude, longitude) - centered to show UK and Ireland
  // Adjusted to match the actual map view at zoom 3.8
  const ukLat = 54.2;  // Centered to show UK and Ireland together
  const ukLon = -2.8;  // Centered to show both UK and Ireland
  
  // Cities in the filter - only these will have markers
  const citiesInFilter = ['london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'leeds', 'edinburgh', 'bristol', 'cardiff'];
  
  // Google Maps embed URL - satellite view of UK
  // Using a working embed format that shows UK in satellite/3D view
  // Zoom levels: 1=world, 3=continent, 5=country, 6=UK perfect, 10=city
  const zoomParam = Math.max(1, Math.min(20, Math.round(zoom))); // Clamp zoom between 1-20
  
  // Use a working Google Maps embed URL format
  // This format works reliably without API key
  // The distance parameter controls zoom: larger = more zoomed out
  const zoomToDistance = {
    1: 12000000,
    1.5: 8000000,
    2: 6000000,
    2.5: 4000000,
    3: 4500000,    // Very wide view
    3.4: 3800000,  // Even wider view
    3.5: 3600000,  // Wide Europe view
    3.6: 3400000,  // Wider view
    3.8: 3200000,  // Wide view for UK with more context
    4: 3000000,    // Much wider view showing UK and surrounding Europe
    4.2: 2800000,  // UK view with proper margins
    4.5: 2500000,  // Wide view showing UK and surrounding areas
    5: 1500000,    // Full UK view with proper margins
    5.5: 1200000,  // Slightly closer but still full UK
    6: 1000000     // Closer view
  };
  
  // Get distance for current zoom, or interpolate
  const getDistance = (z) => {
    if (zoomToDistance[z]) return zoomToDistance[z];
    // Interpolate between nearest values
    const lower = Math.floor(z);
    const upper = Math.ceil(z);
    if (zoomToDistance[lower] && zoomToDistance[upper]) {
      return Math.round(zoomToDistance[lower] + (zoomToDistance[upper] - zoomToDistance[lower]) * (z - lower));
    }
    return zoomToDistance[6] || 375000;
  };
  
  const distance = getDistance(zoomParam);
  // Use stable timestamp to prevent unnecessary reloads during animation
  // Only change when zoom actually changes
  const timestamp = Math.floor(zoomParam * 1000); // Stable based on zoom level
  
  // Build markers string for cities in the filter - markers come from the map itself
  // Using Google Maps share/embed URL that includes place markers
  if (showMarkers) {
    const markerCoords = citiesInFilter.map(cityKey => {
      const city = cityMapConfig[cityKey];
      if (city) {
        return `${city.lat},${city.lon}`;
      }
      return null;
    }).filter(Boolean);
    
    if (markerCoords.length > 0) {
      // Use Google Maps share URL format with place markers
      // This format includes markers directly in the map URL
      // The markers appear on the actual map locations from Google Maps itself
      // Format: Use the standard embed with query parameter for places
      const placesParam = markerCoords.map(coord => `place_id=${encodeURIComponent(coord)}`).join('&');
      
      // Alternative: Use the search/place format that Google Maps supports
      // This will show markers for each city location on the map
      const searchQuery = citiesInFilter.map(key => {
        const city = cityMapConfig[key];
        return city ? `${city.lat},${city.lon}` : null;
      }).filter(Boolean).join('/');
      
      // Google Maps embed URLs don't support custom markers without an API key
      // The compressed pb= format doesn't accept simple query parameters
      // 
      // Workaround: Use Google Maps Static API (free tier) with markers
      // This shows markers directly on the map image itself
      // Format: https://maps.googleapis.com/maps/api/staticmap?center=lat,lon&zoom=level&size=widthxheight&markers=...
      // 
      // However, Static API also requires an API key for production use
      // 
      // For now, we'll use the standard embed without markers in URL
      // The user will need to either:
      // 1. Get a free Google Maps API key and use JavaScript API
      // 2. Use overlay pins with accurate positioning (current approach)
    }
  }
  
  // Fallback to original format if no markers needed
  // Working Google Maps embed URL for satellite/3D view of UK
  // Using the standard embed format from Google Maps share feature
  // This shows satellite imagery which appears 3D-like
  return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${distance}!2d${ukLon}!3d${ukLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v${timestamp}!5m2!1sen!2suk&maptype=satellite`;
};

// Build the correct map URL based on the selected city.
// For homepage: Always show Google Earth 3D view of UK
// For city selection: Show OpenStreetMap (but this is only used in InitialLandingState before filters)
const buildMapSrc = (selectedCity) => {
  // Always use Google Earth for the homepage landing state
  return buildGoogleEarthSrc();
};


// JSX version - Initial landing state before filters are applied
// Default city is "all" so we start with the full UK map
export const InitialLandingState = ({ onApplyFilters, selectedCity = 'all', dashboardVisible = false }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0); // 0 to 1 for animation progress
  const [animationComplete, setAnimationComplete] = useState(false);
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false);
  
  // Cities in the filter - only these will have markers
  const citiesInFilter = ['london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'leeds', 'edinburgh', 'bristol', 'cardiff'];
  
  // Use the Google Maps embed URL that includes UK cities with markers
  // This embed already shows cities with markers on the map - no API key needed!
  // Original URL maintains the proper UK boundary/viewport
  const mapSrc = useMemo(() => {
    return "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3497124.3563092486!2d-5.152729057005384!3d52.752343304531756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1suk%20cities!5e0!3m2!1sen!2sin!4v1766387741474!5m2!1sen!2sin";
  }, []);
  
  // Reset animation state when dashboard becomes visible (after SplineLoader)
  useEffect(() => {
    if (dashboardVisible) {
      // Reset animation state when dashboard becomes visible
      setAnimationProgress(0);
      setAnimationComplete(false);
      setShouldStartAnimation(false);
      // Map will start loading when dashboard is visible
    }
  }, [dashboardVisible]);

  // Start animation when dashboard is visible AND map is loaded
  // This ensures the zoom-out animation happens after SplineLoader completes
  useEffect(() => {
    if (dashboardVisible && mapLoaded && !shouldStartAnimation) {
      // Wait a moment for initial map to render, then start smooth zoom-out animation
      const startDelay = setTimeout(() => {
        setShouldStartAnimation(true);
        
        const duration = 7000; // 7 seconds total animation for ultra-smooth zoom-out effect
        const steps = 140; // More steps for ultra-smooth animation (50ms per step)
        let currentStep = 0;
        let lastTime = performance.now();

        const animate = (currentTime) => {
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;
          
          if (currentStep < steps) {
            currentStep++;
            const progress = currentStep / steps;
            // Use easing function for smoother acceleration/deceleration
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out for smooth zoom
            setAnimationProgress(easedProgress);
            
            requestAnimationFrame(animate);
          } else {
            setAnimationComplete(true);
            setAnimationProgress(1);
          }
        };

        requestAnimationFrame(animate);

        return () => {
          // Cleanup handled by requestAnimationFrame
        };
      }, 1200); // Wait 1.2 seconds after map loads for better initialization

      return () => clearTimeout(startDelay);
    }
  }, [dashboardVisible, mapLoaded, shouldStartAnimation]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 lg:p-8 space-y-6">
      {/* Enhanced UK Map Container */}
      <div className="w-full max-w-5xl">
        {/* Map Header with Enhanced Design */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Globe className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-chart-green rounded-full border-2 border-card animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">UK in 3D View</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Navigation className="w-3 h-3" />
                Interactive 3D geographic overview of all operational sites
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Interactive</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-muted-foreground">
              Real-time Data
            </div>
          </div>
        </div>

        {/* Map Container with Clean Styling */}
        <div className="relative overflow-hidden bg-card group">
          
          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-card via-muted/30 to-card flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-chart-blue/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Loading map data...</p>
                  <p className="text-xs text-muted-foreground">Preparing geographic visualization</p>
                </div>
              </div>
            </div>
          )}

          {/* Map Frame with Enhanced Border - Locked/Non-interactive */}
          <div className="relative w-full h-[500px] lg:h-[650px] overflow-hidden">
            {/* Top Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-card/80 to-transparent z-10 pointer-events-none" />
            
            {/* Lock Overlay - Prevents all interactions */}
            <div className="absolute inset-0 z-20 pointer-events-auto cursor-not-allowed" />
            
            {/* Animation Progress Indicator - Shows during fly-in */}
            {dashboardVisible && mapLoaded && !animationComplete && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
                <div className="bg-card/90 backdrop-blur-md rounded-lg px-4 py-2.5 border border-primary/30 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Flying to UK...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Map Container with Smooth CSS Zoom Animation - Single iframe, no reload = no blink */}
            <div className="relative w-full h-full overflow-hidden">
              <div
                className="relative w-full h-full origin-center"
                style={{
                  // Animate from scale 9 (zoomed in/world view) to scale 1.4 (more zoomed in on UK - no gap due to overflow-hidden)
                  // Animation starts when dashboard becomes visible (after SplineLoader completes)
                  transform: !dashboardVisible || !mapLoaded
                    ? 'scale(9)' // Start zoomed in (world view) before dashboard is visible or map loads
                    : !animationComplete
                    ? `scale(${9 - (animationProgress * 7.6)})` // Smoothly zoom out from 9x to 1.4x during animation (more zoomed in on UK)
                    : 'scale(1.4)', // Final state: more zoomed in on UK (overflow-hidden prevents gaps)
                  transition: dashboardVisible && mapLoaded && shouldStartAnimation && !animationComplete
                    ? 'transform 0.016s cubic-bezier(0.4, 0, 0.2, 1)' // Ultra-smooth zoom-out transition
                    : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'center center' // Ensures UK stays centered during zoom
                }}
              >
                <iframe
                  key={mapSrc}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapSrc}
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ 
                    border: 0, 
                    pointerEvents: "none",
                    transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  title="UK in Google Earth 3D View"
                  onLoad={() => {
                    if (!mapLoaded) {
                      setMapLoaded(true);
                    }
                  }}
                  className={cn(
                    "select-none w-full h-full",
                    mapLoaded ? "opacity-100" : "opacity-0"
                  )}
                  tabIndex="-1"
                  allowFullScreen
                  loading="eager"
                />
              </div>
              
              {/* Markers are already included in the Google Maps embed URL - no overlay pins needed! */}
              {/* The embed URL shows UK cities with markers directly from Google Maps */}
            </div>
            
            {/* UK Coastline Highlight removed - no border/outline */}

            {/* Animated Zoom Level Indicator - Shows current zoom during animation */}
            {dashboardVisible && mapLoaded && !animationComplete && (
              <div className="absolute bottom-4 right-4 z-30 pointer-events-none animate-fade-in">
                <div className="bg-card/90 backdrop-blur-md rounded-lg px-3 py-2 border border-primary/30 shadow-lg">
                  <p className="text-xs font-bold text-primary animate-pulse">
                    Zoom: {(1 + (animationProgress * 3)).toFixed(1)}x
                  </p>
                </div>
              </div>
            )}

            {/* Note: Google Maps embed doesn't support custom markers without API key */}
            {/* The overlay pins have been removed - markers would need to come from Google Maps API */}
            {/* To add markers from the map itself, you would need a Google Maps API key */}

            {/* Selected city name badge - Only show when "all" is selected, hide when specific city is selected */}
            {/* Removed: Blue box with city name should not appear when a specific city is selected */}
            
            {/* Decorative Corner Accents with Animation */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent pointer-events-none rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-chart-blue/15 via-chart-blue/5 to-transparent pointer-events-none rounded-tl-full" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-chart-green/10 to-transparent pointer-events-none rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-chart-purple/10 to-transparent pointer-events-none rounded-tr-full" />
          </div>

          {/* Professional Map Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none z-20">
            {/* Primary Location Badge - Bottom Left */}
            <div className="bg-[#1e3a8a] backdrop-blur-md rounded-xl px-6 py-4 border-2 border-[#d4af37]/30 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border-2 border-[#d4af37]/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium mb-1">Primary Location</p>
                  <p className="text-base font-bold text-white">United Kingdom</p>
                </div>
              </div>
            </div>

            {/* Map Controls Info - Bottom Right */}
            <div className="flex items-center gap-3">
              <div className="bg-[#1e3a8a] backdrop-blur-md rounded-xl px-5 py-3 border-2 border-[#d4af37]/30 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <ZoomIn className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">Zoom: 6x</span>
                </div>
              </div>
              <div className="bg-[#1e3a8a] backdrop-blur-md rounded-xl px-5 py-3 border-2 border-[#d4af37]/30 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-white" />
                  <span className="text-sm font-semibold text-white">View Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* UK Cities Legend */}
          <div className="absolute top-6 right-6 bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border/50 shadow-2xl pointer-events-none z-20 max-w-[220px]">
            <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">UK Cities</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary border border-card" />
                <span className="text-xs text-muted-foreground">London</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-green border border-card" />
                <span className="text-xs text-muted-foreground">Manchester</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-blue border border-card" />
                <span className="text-xs text-muted-foreground">Birmingham</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-purple border border-card" />
                <span className="text-xs text-muted-foreground">Glasgow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-yellow border border-card" />
                <span className="text-xs text-muted-foreground">Liverpool</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-orange border border-card" />
                <span className="text-xs text-muted-foreground">Leeds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-pink border border-card" />
                <span className="text-xs text-muted-foreground">Edinburgh</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary border border-card" />
                <span className="text-xs text-muted-foreground">Bristol</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-green border border-card" />
                <span className="text-xs text-muted-foreground">Cardiff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Overall Sales Summary Box */}
      <div className="w-full max-w-lg">
        <div className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-3xl p-8 lg:p-10 border-2 border-border/50 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-chart-blue/10 rounded-full blur-2xl group-hover:bg-chart-blue/15 transition-colors duration-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-chart-purple/5 rounded-full blur-3xl" />
          
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Icon Badge with Animation */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">📊</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-chart-green rounded-full border-2 border-card animate-pulse" />
              </div>
            </div>
            
            {/* Description with Better Typography */}
            <p className="text-xs text-muted-foreground mb-6 text-center leading-relaxed px-2">
              The data shown represents <span className="font-semibold text-foreground">all sites</span> and <span className="font-semibold text-foreground">all months</span> in the current year combined.
            </p>
            
            {/* Sales Display with Enhanced Design */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Company's Overall Sales
                </p>
              </div>
              
              <div className="flex items-baseline justify-center gap-2 pt-2">
                <span className="text-2xl font-bold text-muted-foreground">£</span>
                <p className="text-5xl lg:text-6xl font-extrabold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  39.27
                </p>
                <p className="text-2xl font-bold text-muted-foreground">M</p>
              </div>
              
              {/* Additional Info Badge */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs text-muted-foreground font-medium">All Regions</span>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Prompt Message */}
      <div className="text-center space-y-5 max-w-2xl">
        {/* Status Badge with Enhanced Design */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-chart-blue/10 border border-primary/20 shadow-lg">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping opacity-75" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Ready to explore detailed analytics
          </p>
        </div>
        
        {/* Description with Better Layout */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            Unlock Comprehensive Business Insights
          </p>
          <p className="text-base text-muted-foreground leading-relaxed px-4">
            Apply filters to access a detailed analytical view of your business performance across different time periods, locations, and metrics.
          </p>
        </div>
        
        {/* Enhanced CTA Button */}
        {onApplyFilters && (
          <div className="pt-2">
            <button
              onClick={onApplyFilters}
              className="group relative px-10 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl font-bold text-base shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              {/* Button Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <span className="relative flex items-center gap-2">
                <span>Apply Filters</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            {/* Helper Text */}
            <p className="text-xs text-muted-foreground mt-3">
              Select month, year, and site to begin analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


