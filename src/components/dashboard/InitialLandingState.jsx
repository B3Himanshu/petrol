import { MapPin, Globe, ZoomIn, ZoomOut, Navigation, Layers, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// City positions on the map (top, left percentages) - Precisely adjusted for accurate UK geography
// Pin tip should point exactly to the city location on the map and stay comfortably within the visible map area
const cityPositions = {
  london: { top: '73%', left: '52%' },           // Southeast England - London (south of Thames)
  manchester: { top: '51%', left: '48%' },       // Northwest England (central)
  birmingham: { top: '59%', left: '49%' },       // Central England - Midlands (center)
  // Slightly lowered so the pin sits inside the map and not in the top gradient/header
  glasgow: { top: '35%', left: '43%' },          // Scotland (west) - Central Scotland
  liverpool: { top: '49%', left: '45%' },        // Northwest England (west coast - Merseyside)
  leeds: { top: '45%', left: '49%' },            // Northern England (Yorkshire)
  edinburgh: { top: '30%', left: '48%' },        // Scotland (east coast - Firth of Forth)
  bristol: { top: '65%', left: '47%' },          // Southwest England (Avon)
  cardiff: { top: '61%', left: '44%' },          // Wales (south - Cardiff Bay area)
};

// JSX version - Initial landing state before filters are applied
export const InitialLandingState = ({ onApplyFilters, selectedCity = 'london' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

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
              <h2 className="text-2xl font-bold text-foreground mb-1">UK in World Map</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Navigation className="w-3 h-3" />
                Geographic overview of all operational sites
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

        {/* Map Container with Enhanced Styling */}
        <div className="relative rounded-3xl border-2 border-border/50 overflow-hidden shadow-2xl bg-card group">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-chart-blue/5 pointer-events-none -z-10" />
          
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
          <div className="relative w-full h-[500px] lg:h-[650px]">
            {/* Top Gradient Overlay */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-card/80 to-transparent z-10 pointer-events-none" />
            
            {/* Lock Overlay - Prevents all interactions */}
            <div className="absolute inset-0 z-20 pointer-events-auto cursor-not-allowed" />
            
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              // Bounding box that fits the whole United Kingdom (including a bit of surrounding sea)
              // west,south,east,north  →  -11,49,3,61.5
              src="https://www.openstreetmap.org/export/embed.html?bbox=-11.0%2C49.0%2C3.0%2C61.5&layer=mapnik"
              style={{ border: 0, pointerEvents: 'none' }}
              title="UK in World map"
              onLoad={() => setMapLoaded(true)}
              className={cn(
                "transition-opacity duration-700 select-none",
                mapLoaded ? "opacity-100" : "opacity-0"
              )}
              tabIndex="-1"
            />
            
            {/* Professional City Marker - Large blue pin that moves to selected city */}
            {selectedCity && cityPositions[selectedCity] && (
              <div 
                key={selectedCity}
                className="absolute z-30 pointer-events-none transition-all duration-700 ease-in-out"
                style={{
                  top: cityPositions[selectedCity].top,
                  left: cityPositions[selectedCity].left,
                  transform: 'translate(-50%, -100%)',
                  transition: 'top 0.7s ease-in-out, left 0.7s ease-in-out',
                  transformOrigin: 'center bottom'
                }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Professional Red Map Pin */}
                  <div className="relative">
                    {/* Enhanced pin shadow for depth */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-6 h-4 bg-black/40 rounded-full blur-lg" />
                    
                    {/* Professional Red Pin Icon */}
                    <svg 
                      width="48" 
                      height="60" 
                      viewBox="0 0 24 32" 
                      className="drop-shadow-2xl"
                      style={{ filter: 'drop-shadow(0 6px 12px rgba(239, 68, 68, 0.5))' }}
                    >
                      {/* Outer glow effect */}
                      <defs>
                        <filter id="pinGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
                          <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                          <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      
                      {/* Teardrop pin shape with red gradient */}
                      <path
                        d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20C24 5.373 18.627 0 12 0z"
                        fill="url(#pinGradient)"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#pinGlow)"
                      />
                      
                      {/* White circle in center */}
                      <circle
                        cx="12"
                        cy="10"
                        r="4"
                        fill="#ffffff"
                      />
                      
                      {/* Inner highlight circle for depth */}
                      <ellipse
                        cx="12"
                        cy="10"
                        rx="5"
                        ry="4"
                        fill="#ffffff"
                        opacity="0.2"
                      />
                    </svg>
                  </div>
                  
                  {/* Professional Dark Blue Label with Gold Border */}
                  <div 
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-lg text-lg font-bold text-white shadow-2xl whitespace-nowrap border-3 relative overflow-hidden"
                    style={{
                      backgroundColor: '#1e3a8a',
                      borderColor: '#d4af37',
                      borderWidth: '3px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {/* Subtle inner highlight for depth */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/15 via-white/5 to-transparent pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">
                      {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
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


