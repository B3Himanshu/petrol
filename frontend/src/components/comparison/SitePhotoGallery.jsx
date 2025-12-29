import { useState, useEffect } from "react";
import { Image, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sitesAPI } from "@/services/api";
import { cn } from "@/lib/utils";

export const SitePhotoGallery = ({ siteId, siteName }) => {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    // Fetch site photos - for now using placeholder images
    // In production, this would fetch actual photos from API
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call when photos endpoint is available
        // const siteData = await sitesAPI.getSitePhotos(siteId);
        
        // Placeholder: Generate sample photo URLs
        // In production, these would come from your database/API
        const placeholderPhotos = [
          `https://images.unsplash.com/photo-1549923746-c502dccb95e7?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop`,
        ];
        
        setPhotos(placeholderPhotos);
      } catch (error) {
        console.error('Error fetching site photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [siteId]);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="chart-card h-64 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading photos...</div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="chart-card h-64">
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Image className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{siteName}</p>
            <p className="text-xs text-muted-foreground mt-1">No photos available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card animate-slide-up">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">{siteName}</h3>
        <p className="text-xs text-muted-foreground">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
        <img
          src={photos[currentIndex]}
          alt={`${siteName} - Photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/800x600/1a1a1a/ffffff?text=${encodeURIComponent(siteName)}`;
          }}
        />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Photo Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80/1a1a1a/ffffff?text=${index + 1}`;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

