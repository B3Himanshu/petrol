import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const SplineLoader = ({ onLoadingComplete, isLoading }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [initialIframeLoaded, setInitialIframeLoaded] = useState(false);
  const [rocketIframeLoaded, setRocketIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(true);
  const [showRocket, setShowRocket] = useState(false); // Track rocket animation phase
  const [showBlackOverlay, setShowBlackOverlay] = useState(false); // Track black overlay visibility (0.5s delay after rocket)
  const [rocketExit, setRocketExit] = useState(false); // Track rocket exit animation
  // Track if callback has already been called to prevent multiple calls
  const callbackCalledRef = useRef(false);

  // Reset state when component mounts or isLoading becomes true
  useEffect(() => {
    if (isLoading) {
      setFadeOut(false);
      setInitialIframeLoaded(false);
      setRocketIframeLoaded(false);
      setShowFallback(true);
      setShowRocket(false);
      setShowBlackOverlay(false);
      setRocketExit(false);
      callbackCalledRef.current = false; // Reset callback flag when loading starts
    }
  }, [isLoading]);

  // Animation sequence: 5s initial animation → rocket fires → 3s later dashboard opens
  useEffect(() => {
    if (!isLoading || callbackCalledRef.current) return;

    // Wait for everything to be ready before starting animations
    let cleanupFunctions = [];
    
    const startAnimations = () => {
      // Use requestAnimationFrame to ensure smooth start
      requestAnimationFrame(() => {
        // Small delay to ensure CSS and styles are fully loaded
        const cssDelayTimer = setTimeout(() => {
          // Phase 1: Show initial animation for 5 seconds
          const initialTimer = setTimeout(() => {
            // Start smooth transition to rocket animation
            // Use a slight delay to ensure smooth crossfade
            requestAnimationFrame(() => {
              setShowRocket(true);
            });
            
            // Phase 2: After 3 seconds of rocket animation, rocket exits upward
            const rocketTimer = setTimeout(() => {
              // Start rocket exit animation (moves upward)
              requestAnimationFrame(() => {
                setRocketExit(true);
              });
              
              // After rocket exits, fade out the loader and open dashboard
              const exitTimer = setTimeout(() => {
                requestAnimationFrame(() => {
                  setFadeOut(true);
                });
                
                // After fade out completes, call onLoadingComplete
                const completeTimer = setTimeout(() => {
                  if (onLoadingComplete && !callbackCalledRef.current) {
                    callbackCalledRef.current = true;
                    requestAnimationFrame(() => {
                      onLoadingComplete();
                    });
                  }
                }, 500); // Smooth transition to dashboard

                cleanupFunctions.push(() => clearTimeout(completeTimer));
              }, 500); // Wait for rocket to exit (500ms = 0.5 sec gap)

              cleanupFunctions.push(() => clearTimeout(exitTimer));
            }, 3000); // Rocket animation for 3 seconds

            cleanupFunctions.push(() => clearTimeout(rocketTimer));
          }, 5000); // Initial animation for 5 seconds

          // Maximum timeout: if something goes wrong, proceed after 10 seconds
          const maxTimer = setTimeout(() => {
            if (onLoadingComplete && !callbackCalledRef.current) {
              callbackCalledRef.current = true;
              setFadeOut(true);
              setTimeout(() => {
                onLoadingComplete();
              }, 800);
            }
          }, 10000);

          cleanupFunctions.push(
            () => clearTimeout(initialTimer),
            () => clearTimeout(maxTimer)
          );
        }, 100); // Small delay to ensure CSS is loaded
        
        cleanupFunctions.push(() => clearTimeout(cssDelayTimer));
      });
    };

    // Wait for DOM, stylesheets, and fonts to be ready
    const checkReady = () => {
      // Check if document is ready and stylesheets are loaded
      if (document.readyState === 'complete') {
        // Additional check: ensure fonts are loaded
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            startAnimations();
          }).catch(() => {
            // Fallback if fonts.ready fails
            setTimeout(startAnimations, 50);
          });
        } else {
          // Fallback if fonts API not available
          setTimeout(startAnimations, 100);
        }
      } else if (document.readyState === 'interactive') {
        // If interactive, wait a bit more for complete
        window.addEventListener('load', () => {
          setTimeout(startAnimations, 50);
        }, { once: true });
      } else {
        // Wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(startAnimations, 100);
        }, { once: true });
      }
    };

    // Start checking immediately
    checkReady();

    // Fallback: ensure animations start even if checks fail
    const fallbackTimer = setTimeout(() => {
      startAnimations();
    }, 500);

    return () => {
      clearTimeout(fallbackTimer);
      // Clean up all timers
      cleanupFunctions.forEach(cleanup => cleanup());
      cleanupFunctions = [];
    };
  }, [isLoading, onLoadingComplete]);

  // Auto-hide fallback after 2 seconds to ensure iframe is visible
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setShowFallback(false);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Show black overlay 0.5 seconds after rocket animation starts
  useEffect(() => {
    if (showRocket) {
      const overlayTimer = setTimeout(() => {
        setShowBlackOverlay(true);
      }, 500); // 0.5 second delay

      return () => clearTimeout(overlayTimer);
    } else {
      setShowBlackOverlay(false);
    }
  }, [showRocket]);

  const handleInitialIframeLoad = () => {
    setInitialIframeLoaded(true);
    if (!showRocket) {
      setShowFallback(false);
    }
  };

  const handleInitialIframeError = () => {
    setInitialIframeLoaded(true);
    if (!showRocket) {
      setShowFallback(false);
    }
  };

  const handleRocketIframeLoad = () => {
    setRocketIframeLoaded(true);
    setShowFallback(false);
  };

  const handleRocketIframeError = () => {
    setRocketIframeLoaded(true);
    setShowFallback(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-background flex items-center justify-center",
        "transition-opacity duration-1000 ease-in-out",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Spline 3D Animation Container - Full Screen */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Initial Animation - Shows for first 5 seconds */}
        <iframe
          key="initial-animation"
          src="https://my.spline.design/prismcoin-VgyBFEJs7VFsxVJi9L05Uvoe/"
          frameBorder="0"
          width="100%"
          height="100%"
          className={cn(
            "w-full h-full absolute inset-0",
            "transition-opacity duration-1000 ease-in-out",
            showRocket ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onLoad={handleInitialIframeLoad}
          onError={handleInitialIframeError}
          style={{ 
            border: 'none', 
            display: 'block', 
            zIndex: showRocket ? 0 : 2,
            willChange: 'opacity'
          }}
        />
        
        {/* Rocket Animation - Shows after 5 seconds, fires for 3 seconds, then exits diagonally right at 75 degrees */}
        <iframe
          key="rocket-animation"
          src="https://my.spline.design/toyrocket-bQa4fhZIbA0s1eBkCmkAmTBk/"
          frameBorder="0"
          width="100%"
          height="100%"
          className={cn(
            "w-full h-full absolute inset-0",
            showRocket ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onLoad={handleRocketIframeLoad}
          onError={handleRocketIframeError}
          style={{ 
            border: 'none', 
            display: 'block', 
            zIndex: showRocket ? 1 : 0, // Lower z-index so rocket flies below the black overlay
            willChange: showRocket && !rocketExit ? 'opacity' : 'transform, opacity',
            transformOrigin: 'center center',
            transform: rocketExit ? 'translate(120%, -450%) rotate(75deg) scale(0.9)' : 'none',
            transition: showRocket && !rocketExit 
              ? 'opacity 1000ms ease-in-out' 
              : rocketExit 
                ? 'transform 2000ms cubic-bezier(0.4, 0.0, 0.2, 1), opacity 2000ms ease-out' 
                : 'opacity 1000ms ease-in-out'
          }}
        />
        
        {/* Loading Text Overlay */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {showRocket ? "Launching Dashboard..." : "Loading Dashboard..."}
            </p>
          </div>
        </div>

        {/* Fallback loading indicator - shown only briefly while iframe loads */}
        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-30 transition-opacity duration-500">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-chart-blue/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {showRocket ? "Loading rocket animation..." : "Loading 3D animation..."}
              </p>
            </div>
          </div>
        )}

        {/* Black overlay to hide "Built with Spline" button in bottom right */}
        {/* Shows during initial animation */}
        {!showRocket && (
          <div 
            className="absolute bottom-0 right-0 w-56 h-20 bg-background z-40 pointer-events-none"
          />
        )}

          {/* Black overlay for rocket animation - covers 20% of right side, stays fixed while rocket flies underneath */}
          {/* Appears 0.5 seconds after rocket animation starts */}
          {showBlackOverlay && (
            <div 
              className="absolute top-0 right-0 w-[20%] h-full pointer-events-none transition-opacity duration-300 ease-in"
              style={{
                backgroundColor: 'hsl(var(--background))', // Use CSS variable for solid background
                zIndex: 10, // Higher than rocket iframe (z-index: 1) so it stays on top
                boxShadow: '0 0 0 1px hsl(var(--background))' // Ensure solid coverage
              }}
            />
          )}
      </div>
    </div>
  );
};

