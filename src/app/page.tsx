"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import * as turf from "@turf/turf";

// Dynamically import the map component to avoid SSR issues
const MapWithDraw = dynamic(() => import("./components/MapWithDraw"), {
  ssr: false,
  loading: () => (
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
  )
});

interface TerrainAnalysis {
  id: string;
  timestamp: Date;
  area: number;
  coordinates: any;
  analysis: {
    topography: string[];
    routes: string[];
    obstacles: string[];
    cover: string[];
    observation: string[];
    infrastructure: string[];
    hydrology: string[];
  };
}

export default function Home() {
  const [selectedAOI, setSelectedAOI] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [terrainAnalysis, setTerrainAnalysis] = useState<TerrainAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAOISubmit = async (geojson: any) => {
    console.log("handleAOISubmit called with:", geojson);
    setSelectedAOI(geojson);
    setIsAnalyzing(true);
    
    console.log("Starting analysis simulation...");
    
    // Simulate AI terrain analysis (in a real app, this would call an AI service)
    setTimeout(() => {
      console.log("Analysis simulation completed, creating analysis object");
      const analysis: TerrainAnalysis = {
        id: Date.now().toString(),
        timestamp: new Date(),
        area: calculateArea(geojson),
        coordinates: geojson,
        analysis: {
          topography: [
            "Dominant ridgelines identified along northern and eastern boundaries",
            "High ground advantage in southeastern quadrant (elevation +150m)",
            "Multiple valleys providing natural corridors for movement",
            "Key terrain identified at grid coordinates [X, Y]"
          ],
          routes: [
            "Primary arterial road running north-south through center",
            "Secondary network of agricultural tracks",
            "Natural ridgeline routes along eastern boundary",
            "Chokepoint identified at major intersection"
          ],
          obstacles: [
            "Dense forest coverage in western sector (restrictive)",
            "River system with seasonal flooding patterns",
            "Urban development creating built-up obstacles",
            "Agricultural fields providing seasonal restrictions"
          ],
          cover: [
            "Forest belts offer excellent concealment",
            "Urban areas provide cover from direct fire",
            "Terrain folds create natural protected positions",
            "Agricultural areas offer limited concealment"
          ],
          observation: [
            "High ground provides 360° observation capability",
            "Long lines of sight along ridgelines",
            "Blind spots identified in valley systems",
            "Urban areas restrict observation capabilities"
          ],
          infrastructure: [
            "Major settlement at northern boundary",
            "Industrial zone with logistical potential",
            "Bridge crossing over primary waterway",
            "Power transmission lines running east-west"
          ],
          hydrology: [
            "Primary river system with seasonal variations",
            "Multiple tributaries creating drainage patterns",
            "Wetland areas in low-lying regions",
            "Groundwater access points identified"
          ]
        }
      };
      
      console.log("Analysis object created:", analysis);
      setTerrainAnalysis(analysis);
      setIsAnalyzing(false);
      console.log("Analysis state updated, component should re-render");
    }, 2000);
  };

  const calculateArea = (geojson: any) => {
    if (geojson.features && geojson.features[0]) {
      try {
        // Use Turf.js for accurate area calculation in square kilometers
        const area = turf.area(geojson.features[0]);
        return Math.round((area / 1000000) * 100) / 100; // Convert m² to km²
      } catch (error) {
        console.error("Error calculating area:", error);
        return 0;
      }
    }
    return 0;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Terrain Intelligence Analysis</h1>
        <p>Strategic terrain analysis tool for operational planning</p>
      </header>
      
      <main className={styles.main}>
        <div className={styles.instructions}>
          <h3>How to Use</h3>
          <ol>
            <li>Use the drawing tools (rectangle or polygon) in the top-right corner of the map</li>
            <li>Draw your Area of Interest (AOI) on the map</li>
            <li>Click "Analyze AOI" to generate terrain intelligence report</li>
            <li>Review the comprehensive analysis below</li>
          </ol>
        </div>
        
        <div className={styles.mapContainer}>
          <MapWithDraw onSubmitAOI={handleAOISubmit} />
        </div>
        
        {isAnalyzing && (
          <div className={styles.analysisStatus}>
            <div className={styles.spinner}></div>
            <p>Analyzing terrain... AI processing in progress</p>
          </div>
        )}
        
        {terrainAnalysis && (
          <div className={styles.analysisResults}>
            <h2>Terrain Analysis Report</h2>
            <div className={styles.analysisMeta}>
              <span>Analysis ID: {terrainAnalysis.id}</span>
              <span>Timestamp: {terrainAnalysis.timestamp.toLocaleString()}</span>
              <span>Area: ~{terrainAnalysis.area} km²</span>
            </div>
            
            <div className={styles.analysisGrid}>
              <div className={styles.analysisSection}>
                <h3>Topography</h3>
                <ul>
                  {terrainAnalysis.analysis.topography.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Routes & Movement</h3>
                <ul>
                  {terrainAnalysis.analysis.routes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Obstacles</h3>
                <ul>
                  {terrainAnalysis.analysis.obstacles.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Cover & Concealment</h3>
                <ul>
                  {terrainAnalysis.analysis.cover.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Observation & Fields of Fire</h3>
                <ul>
                  {terrainAnalysis.analysis.observation.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Infrastructure</h3>
                <ul>
                  {terrainAnalysis.analysis.infrastructure.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Hydrology & Weather</h3>
                <ul>
                  {terrainAnalysis.analysis.hydrology.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
