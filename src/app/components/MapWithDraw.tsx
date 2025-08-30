"use client";

import { useEffect, useState, useRef } from "react";

type Props = {
  onSubmitAOI: (geojson: any) => void;
};

export default function MapWithDraw({ onSubmitAOI }: Props) {
  const [isClient, setIsClient] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);
  const [hasDrawnFeatures, setHasDrawnFeatures] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let map: any = null;
    let drawControl: any = null;
    let featureGroup: any = null;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet only when we're on the client
        const L = await import("leaflet");
        await import("leaflet-draw");

        // Fix Leaflet icon issues
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create the map using vanilla Leaflet
        if (mapContainerRef.current) {
          map = L.default.map(mapContainerRef.current, {
            center: [31.771959, 35.217018],
            zoom: 12,
          });
        }

        if (!map) {
          console.error("Failed to create map");
          return;
        }

        // Store map instance for later use
        mapInstanceRef.current = map;

        // Add tile layer
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        }).addTo(map);

        // Create feature group for drawing
        featureGroup = L.default.featureGroup().addTo(map);
        featureGroupRef.current = featureGroup;

        // Add drawing controls
        drawControl = new L.default.Control.Draw({
          position: "topright",
          edit: {
            featureGroup: featureGroup,
            remove: true,
          },
          draw: {
            polyline: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polygon: {
              allowIntersection: false,
              showArea: true,
            },
            rectangle: {
              showArea: true,
            },
          },
        });

        map.addControl(drawControl);

        // Handle drawing events
        map.on(L.default.Draw.Event.CREATED, (e: any) => {
          console.log("Feature created:", e);
          const layer = e.layer;
          featureGroup.clearLayers();
          featureGroup.addLayer(layer);
          setHasDrawnFeatures(true);
          console.log("Feature added to group, hasDrawnFeatures set to true");
        });

        map.on(L.default.Draw.Event.EDITED, (e: any) => {
          console.log("Feature edited:", e);
          setHasDrawnFeatures(true);
        });

        map.on(L.default.Draw.Event.DELETED, () => {
          console.log("Feature deleted");
          setHasDrawnFeatures(false);
        });

        console.log("Map initialized successfully with drawing controls");

      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isClient]);

  const exportGeoJSON = () => {
    console.log("Export button clicked");
    console.log("featureGroupRef.current:", featureGroupRef.current);
    console.log("hasDrawnFeatures:", hasDrawnFeatures);
    
    if (!featureGroupRef.current) {
      console.error("Feature group not available");
      alert("Map not ready. Please wait for the map to load completely.");
      return;
    }

    if (!hasDrawnFeatures) {
      alert("Please draw an area of interest first using the drawing tools on the map.");
      return;
    }

    try {
      const geojson = featureGroupRef.current.toGeoJSON();
      console.log("Exported GeoJSON:", geojson);
      
      if (!geojson.features || geojson.features.length === 0) {
        alert("No features found to analyze. Please draw an area first.");
        return;
      }

      // Call the parent component's onSubmitAOI function
      onSubmitAOI(geojson);
      console.log("Analysis submitted successfully");
      
    } catch (error) {
      console.error("Error exporting GeoJSON:", error);
      alert("Error exporting area data. Please try drawing the area again.");
    }
  };

  const clearFeatures = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      setHasDrawnFeatures(false);
      console.log("Features cleared");
    }
  };

  if (!isClient) {
    return (
      <div style={{ 
        height: "70vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f8f9fa",
        border: "2px dashed #dee2e6",
        borderRadius: "12px"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
          <p style={{ color: "#6c757d", margin: 0 }}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div 
        ref={mapContainerRef}
        style={{ height: "70vh", width: "100%" }}
      />
      <div style={{ 
        padding: "16px", 
        display: "flex", 
        gap: "12px", 
        justifyContent: "center",
        background: "#f8f9fa",
        borderTop: "1px solid #e9ecef"
      }}>
        <button 
          onClick={exportGeoJSON} 
          style={{ 
            padding: "12px 24px",
            backgroundColor: hasDrawnFeatures ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: hasDrawnFeatures ? "pointer" : "not-allowed",
            fontWeight: "600",
            fontSize: "14px"
          }}
          onMouseOver={(e) => {
            if (hasDrawnFeatures) {
              e.currentTarget.style.backgroundColor = "#0056b3";
            }
          }}
          onMouseOut={(e) => {
            if (hasDrawnFeatures) {
              e.currentTarget.style.backgroundColor = "#007bff";
            }
          }}
        >
          🎯 Analyze AOI {!hasDrawnFeatures && "(Draw area first)"}
        </button>
        <button
          onClick={clearFeatures}
          style={{ 
            padding: "12px 24px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#545b62"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}


