import { useState, useEffect, useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

// City coordinates configuration with optimized zoom levels for city-specific views
// Delta values control the zoom level - smaller = more zoomed in
const cityMapConfig = {
  london: { lat: 51.5074, lon: -0.1278, delta: 0.15 },      // Closer view for London
  manchester: { lat: 53.4808, lon: -2.2426, delta: 0.2 },
  birmingham: { lat: 52.4862, lon: -1.8904, delta: 0.2 },
  glasgow: { lat: 55.8642, lon: -4.2518, delta: 0.25 },
  liverpool: { lat: 53.4084, lon: -2.9916, delta: 0.2 },
  leeds: { lat: 53.8008, lon: -1.5491, delta: 0.2 },
  edinburgh: { lat: 55.9533, lon: -3.1883, delta: 0.25 },
  bristol: { lat: 51.4545, lon: -2.5879, delta: 0.2 },
  cardiff: { lat: 51.4816, lon: -3.1791, delta: 0.2 },
};

// UK bounding box for overall view
const UK_BOUNDS = {
  west: -8.0,
  south: 49.8,
  east: 2.0,
  north: 61.0
};

// UK bounding box string for OpenStreetMap embed (comma-separated, not URL encoded)
const UK_BBOX = `${UK_BOUNDS.west},${UK_BOUNDS.south},${UK_BOUNDS.east},${UK_BOUNDS.north}`;

// Build map URL based on selected city
const buildMapSrc = (selectedCity) => {
  // If no city selected or 'all', show UK overview
  if (!selectedCity || selectedCity === 'all' || !cityMapConfig[selectedCity]) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${UK_BBOX}&layer=mapnik`;
  }

  // Get city coordinates and calculate bounding box for city-specific view
  const { lat, lon, delta } = cityMapConfig[selectedCity];
  const d = delta ?? 0.2; // Smaller delta for closer city view

  // Calculate bounding box centered on the city
  // This creates a square area around the city center
  const south = lat - d;
  const north = lat + d;
  const west = lon - d;
  const east = lon + d;

  // Build OpenStreetMap embed URL with bounding box
  // OpenStreetMap embed format: bbox=west,south,east,north
  // OpenStreetMap expects bbox as comma-separated values (not URL encoded)
  const bbox = `${west},${south},${east},${north}`;
  
  // Return the embed URL - this will show a zoomed-in view of the selected city
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  
  return mapUrl;
};

// CityMap component for dashboard
export const CityMap = ({ selectedCity = 'all' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force iframe reload with key change
  
  // Build map source - use useMemo to recalculate when city changes
  const mapSrc = useMemo(() => {
    const src = buildMapSrc(selectedCity);
    return src;
  }, [selectedCity]);
  
  // Reset map loaded state and force iframe reload when city changes
  useEffect(() => {
    setMapLoaded(false);
    // Force iframe reload by changing key
    setMapKey(prev => prev + 1);
  }, [selectedCity]);

  // Format city name properly - memoized for performance
  const cityName = useMemo(() => {
    if (!selectedCity || selectedCity === 'all') return 'United Kingdom';
    const cityNames = {
      london: 'London',
      manchester: 'Manchester',
      birmingham: 'Birmingham',
      glasgow: 'Glasgow',
      liverpool: 'Liverpool',
      leeds: 'Leeds',
      edinburgh: 'Edinburgh',
      bristol: 'Bristol',
      cardiff: 'Cardiff',
    };
    return cityNames[selectedCity] || selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1);
  }, [selectedCity]);

  // Calculate pin position for selected city - memoized for performance
  // This calculates the relative position of the city within the map bounding box
  const pinPosition = useMemo(() => {
    if (!selectedCity || selectedCity === 'all' || !cityMapConfig[selectedCity]) {
      return null; // No pin for 'all' view
    }

    const { lat, lon, delta } = cityMapConfig[selectedCity];
    const d = delta ?? 0.2;
    
    // Calculate bounding box (same as in buildMapSrc)
    const south = lat - d;
    const north = lat + d;
    const west = lon - d;
    const east = lon + d;
    
    // Calculate relative position within the bounding box (0-100%)
    // City is at the center of the bounding box, approximately 50%, 50%
    const latRange = north - south;
    const lonRange = east - west;
    
    // For latitude: top is north, bottom is south
    const latPercent = ((north - lat) / latRange) * 100;
    
    // For longitude: left is west, right is east  
    const lonPercent = ((lon - west) / lonRange) * 100;
    
    return {
      top: `${latPercent}%`,
      left: `${lonPercent}%`,
    };
  }, [selectedCity]);

  return (
    <div className="chart-card mb-4 lg:mb-6 animate-slide-up">
      {/* Map Header */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Location Overview</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Navigation className="w-3 h-3" />
              {cityName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-xs font-semibold text-primary">Interactive Map</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl border border-border/50 overflow-hidden bg-card shadow-lg">
        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-card/90 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map Frame */}
        <div className="relative w-full h-[400px] lg:h-[500px]">
          <iframe
            key={`map-${selectedCity}-${mapKey}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapSrc}
            style={{ border: 0, pointerEvents: "none" }}
            title={`Map view of ${cityName}`}
            onLoad={() => {
              setMapLoaded(true);
            }}
            onError={() => {
              setMapLoaded(true); // Show map even if there's an error
            }}
            className={cn(
              "transition-opacity duration-500",
              mapLoaded ? "opacity-100" : "opacity-0"
            )}
            tabIndex="-1"
            allowFullScreen={false}
          />

          {/* City Pin Marker - Only show when map is loaded and a specific city is selected */}
          {mapLoaded && pinPosition && selectedCity !== 'all' && (
            <div
              className="absolute z-20 pointer-events-none animate-fade-in"
              style={{
                top: pinPosition.top,
                left: pinPosition.left,
                transform: 'translate(-50%, -100%)', // Center pin on coordinates, pin point at bottom
              }}
            >
              <div className="relative">
                {/* Pin Shadow */}
                <div className="absolute top-1 left-1 w-10 h-10 bg-black/20 rounded-full blur-sm" />
                {/* Red Pin Icon */}
                <MapPin className="w-10 h-10 text-red-500 drop-shadow-lg" fill="#ef4444" stroke="#dc2626" strokeWidth={1.5} />
                {/* Red Pulse Animation */}
                <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-red-500/30 animate-ping" style={{ transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }} />
              </div>
            </div>
          )}

          {/* City Info Badge - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <div className="bg-card/95 backdrop-blur-md rounded-lg px-4 py-2.5 border border-border/50 shadow-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Selected Location</p>
                  <p className="text-sm font-bold text-foreground">{cityName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative gradient corners */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-chart-blue/5 to-transparent pointer-events-none rounded-tl-full" />
        </div>
      </div>
    </div>
  );
};

