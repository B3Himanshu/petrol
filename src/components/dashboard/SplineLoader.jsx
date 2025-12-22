import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const SplineLoader = ({ onLoadingComplete, isLoading }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true);
  // Track if callback has already been called to prevent multiple calls
  const callbackCalledRef = useRef(false);

  // Reset state when component mounts or isLoading becomes true
  useEffect(() => {
    if (isLoading) {
      setFadeOut(false);
      setIframeLoaded(false);
      setShowFallback(true);
      callbackCalledRef.current = false; // Reset callback flag when loading starts
    }
  }, [isLoading]);

  // Start the transition timer as soon as component mounts
  // This ensures the animation shows for 5 seconds, then fades out
  useEffect(() => {
    if (!isLoading || callbackCalledRef.current) return;

    // Display time: 5 seconds to let users see the animation
    const displayTimer = setTimeout(() => {
      setFadeOut(true);
      
      // After fade out completes, call onLoadingComplete
      const completeTimer = setTimeout(() => {
        if (onLoadingComplete && !callbackCalledRef.current) {
          callbackCalledRef.current = true;
          onLoadingComplete();
        }
      }, 800); // Match the fade-out duration

      return () => clearTimeout(completeTimer);
    }, 5000); // Show animation for 5 seconds

    // Maximum timeout: if something goes wrong, proceed after 8 seconds
    const maxTimer = setTimeout(() => {
      if (onLoadingComplete && !callbackCalledRef.current) {
        callbackCalledRef.current = true;
        setFadeOut(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 800);
      }
    }, 8000);

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(maxTimer);
    };
  }, [isLoading, onLoadingComplete]);

  // Auto-hide fallback after 2 seconds to ensure iframe is visible
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setShowFallback(false);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setShowFallback(false);
  };

  const handleIframeError = () => {
    setIframeLoaded(true);
    setShowFallback(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-800 ease-in-out",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Spline 3D Animation Container - Full Screen */}
      <div className="relative w-full h-full">
        <iframe
          src="https://my.spline.design/prismcoin-VgyBFEJs7VFsxVJi9L05Uvoe/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ border: 'none', display: 'block', position: 'relative', zIndex: 1 }}
        />
        
        {/* Loading Text Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Loading Dashboard...
            </p>
          </div>
        </div>

        {/* Fallback loading indicator - shown only briefly while iframe loads */}
        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 transition-opacity duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-chart-blue/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm font-medium text-foreground">Loading 3D animation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

