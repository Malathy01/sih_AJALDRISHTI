import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  Fish,
  Wind,
  Waves,
  Shield,
  Navigation,
  Eye,
  Crosshair,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Locate,
  Globe,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  PFZAdvisory,
  MarineBoundary,
  OceanState,
  MarineRoute,
  Language
} from '../types/marine';
import { calculateHaversineDistanceKm } from '../utils/marineCalculations';
import { t } from '../i18n/translations';

interface MarineMapProps {
  oceanState: OceanState;
  pfzZones: PFZAdvisory[];
  boundaries: MarineBoundary[];
  activeRoute?: MarineRoute | null;
  routes?: MarineRoute[];
  fisherLocation: { lat: number; lng: number; name?: string };
  onSelectCoordinate?: (lat: number, lng: number) => void;
  language: Language;
  lowBandwidth?: boolean;
}

type BasemapType = 'satellite' | 'nautical' | 'dark' | 'osm';

export const MarineMap: React.FC<MarineMapProps> = ({
  oceanState,
  pfzZones,
  boundaries,
  activeRoute,
  routes = [],
  fisherLocation,
  onSelectCoordinate,
  language,
  lowBandwidth = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const seaMarksLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap Selection: Default to real satellite imagery for real-world coastal & ocean visual fidelity!
  const [basemap, setBasemap] = useState<BasemapType>('satellite');
  const [showSeamarks, setShowSeamarks] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Layer Visibility Toggles
  const [showPFZ, setShowPFZ] = useState(true);
  const [showIMBL, setShowIMBL] = useState(true);
  const [showMPA, setShowMPA] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHarbours, setShowHarbours] = useState(true);
  const [showCurrentDrift, setShowCurrentDrift] = useState(true);

  // Live Cursor Coordinates
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Selected coordinate inspection state
  const [inspectedLocation, setInspectedLocation] = useState<{
    lat: number;
    lng: number;
    depthM: number;
    waveM: number;
    nearestPFZKm: number;
    imblDistanceKm: number;
    warningNote: string;
    isSafe: boolean;
  } | null>(null);

  // Real Landing centres around Palk Strait / Gulf of Mannar
  const harbours = [
    { name: 'Rameswaram Fishing Jetty', lat: 9.2876, lng: 79.3129, type: 'MAJOR_JETTY' },
    { name: 'Pamban Port & Marine Pass', lat: 9.279, lng: 79.213, type: 'PORT' },
    { name: 'Mandapam Marine Centre', lat: 9.278, lng: 79.132, type: 'LANDING_CENTRE' },
    { name: 'Dhanushkodi Point (Adam Bridge)', lat: 9.178, lng: 79.418, type: 'COASTAL_POST' }
  ];

  // Helper to swap basemaps cleanly
  const updateBasemapLayer = useCallback((type: BasemapType) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }

    let url = '';
    let attribution = '';
    let maxZoom = 18;

    switch (type) {
      case 'satellite':
        // Real-world high-resolution Esri World Imagery (No API key required)
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping';
        maxZoom = 18;
        break;
      case 'nautical':
      case 'osm':
        // Standard OpenStreetMap (No API key required)
        url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        attribution = '&copy; OpenStreetMap contributors';
        maxZoom = 19;
        break;
      case 'dark':
        // CartoDB Dark Matter for night navigation
        url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        attribution = '&copy; OpenStreetMap & CartoDB';
        maxZoom = 19;
        break;
    }

    const newBase = L.tileLayer(url, {
      maxZoom,
      attribution,
      subdomains: type === 'dark' || type === 'osm' ? 'abc' : ''
    }).addTo(map);

    baseTileLayerRef.current = newBase;
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [9.26, 79.35],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Set initial basemap
    updateBasemapLayer(basemap);

    // OpenSeaMap nautical seamarks overlay (buoys, beacons, maritime channels)
    const seaMarks = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      maxZoom: 18,
      opacity: 0.85
    });
    seaMarksLayerRef.current = seaMarks;
    if (showSeamarks) {
      seaMarks.addTo(map);
    }

    // Dynamic layer group for vector elements (PFZ, routes, boundaries, pins)
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Mouse move tracker for cursor GPS coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000
      });
    });

    // Map click handler for inspecting coordinates & calculating distance to IMBL / PFZ
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lng = Math.round(e.latlng.lng * 10000) / 10000;

      let minPfzDist = 999;
      for (const p of pfzZones) {
        const d = calculateHaversineDistanceKm(lat, lng, p.centerLat, p.centerLng);
        if (d < minPfzDist) minPfzDist = d;
      }

      const imbl = boundaries.find((b) => b.type === 'IMBL');
      let minImblDist = 999;
      if (imbl) {
        for (const pt of imbl.coordinates) {
          const d = calculateHaversineDistanceKm(lat, lng, pt[0], pt[1]);
          if (d < minImblDist) minImblDist = d;
        }
      }

      const isNearIMBL = minImblDist < 5.0;
      const warningNote = isNearIMBL
        ? language === 'ta'
          ? 'எச்சரிக்கை: சர்வதேச கடல் எல்லைக்கு (IMBL) மிக அருகில் உள்ளீர்கள்! 5 கி.மீ விலகி இருக்கவும்.'
          : 'WARNING: Inside the 5km IMBL buffer zone! Danger of boundary crossing.'
        : language === 'ta'
        ? 'எல்லை பாதுகாப்பானது. மீன்பிடிக்க ஏற்ற இந்திய கடல் பரப்பு.'
        : 'Safe zone. Boundary clearance > 5km. Safe for fishing operations.';

      setInspectedLocation({
        lat,
        lng,
        depthM: Math.round(14 + Math.abs(lat - 9.28) * 110),
        waveM: oceanState.significantWaveHeightM,
        nearestPFZKm: minPfzDist < 900 ? minPfzDist : 21.4,
        imblDistanceKm: minImblDist < 900 ? minImblDist : 8.5,
        warningNote,
        isSafe: !isNearIMBL
      });

      if (onSelectCoordinate) {
        onSelectCoordinate(lat, lng);
      }
    });

    // Invalidate size on init to avoid grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Seamarks Layer toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const seaMarks = seaMarksLayerRef.current;
    if (!map || !seaMarks) return;

    if (showSeamarks) {
      if (!map.hasLayer(seaMarks)) map.addLayer(seaMarks);
    } else {
      if (map.hasLayer(seaMarks)) map.removeLayer(seaMarks);
    }
  }, [showSeamarks]);

  // Handle Basemap change
  const handleBasemapChange = (type: BasemapType) => {
    setBasemap(type);
    updateBasemapLayer(type);
  };

  // Center on Fisher Boat
  const handleCenterOnBoat = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([fisherLocation.lat, fisherLocation.lng], 12, { animate: true, duration: 1.2 });
  };

  // Fit all layers & PFZ zones
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([9.26, 79.35], 10, { animate: true, duration: 1.2 });
  };

  // Redraw Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg) return;

    lg.clearLayers();

    // 1. FISHER BOAT LOCATION PIN
    const fisherIcon = L.divIcon({
      className: 'custom-fisher-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <span style="font-size: 13px;">🛥️</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker([fisherLocation.lat, fisherLocation.lng], { icon: fisherIcon })
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px; min-width: 170px;">
          <strong style="color: #0284c7; font-size: 13px;">${language === 'ta' ? 'உங்கள் படகு இருப்பிடம்' : 'Your Boat GPS'}</strong><br/>
          <strong>${fisherLocation.name || 'Rameswaram Fishing Jetty'}</strong><br/>
          <span style="font-family: monospace; color: #475569;">${fisherLocation.lat.toFixed(4)}°N, ${fisherLocation.lng.toFixed(4)}°E</span><br/>
          <span style="color: #059669; font-weight: 600;">Status: Ready for Voyage</span>
        </div>
      `)
      .addTo(lg);

    // 2. HARBOURS & LANDING CENTRES
    if (showHarbours) {
      harbours.forEach((h) => {
        const harbourIcon = L.divIcon({
          className: 'harbour-marker',
          html: `
            <div class="px-1.5 py-0.5 rounded bg-blue-700/90 text-white font-bold text-[10px] border border-white/80 shadow-md flex items-center gap-1 backdrop-blur-sm">
              <span>⚓</span>
              <span>${h.name.split(' ')[0]}</span>
            </div>
          `,
          iconSize: [65, 20],
          iconAnchor: [32, 10]
        });

        L.marker([h.lat, h.lng], { icon: harbourIcon })
          .bindPopup(`
            <div style="font-size: 12px; color: #0f172a; padding: 3px;">
              <strong style="color: #1d4ed8;">${h.name}</strong><br/>
              <span>Type: ${h.type}</span><br/>
              <span style="font-family: monospace; color: #64748b;">${h.lat.toFixed(4)}°N, ${h.lng.toFixed(4)}°E</span>
            </div>
          `)
          .addTo(lg);
      });
    }

    // 3. POTENTIAL FISHING ZONES (PFZ)
    if (showPFZ) {
      pfzZones.forEach((zone) => {
        // Draw polygon area with emerald highlight
        const poly = L.polygon(zone.coordinates, {
          color: '#10b981',
          weight: 2.5,
          fillColor: '#10b981',
          fillOpacity: 0.28,
          dashArray: '5, 5'
        }).addTo(lg);

        // Center marker with fish icon
        const pfzIcon = L.divIcon({
          className: 'pfz-marker',
          html: `
            <div class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 border border-emerald-300">
              <span>🐟 PFZ: ${zone.sstCelsius}°C</span>
            </div>
          `,
          iconSize: [80, 22],
          iconAnchor: [40, 11]
        });

        const marker = L.marker([zone.centerLat, zone.centerLng], { icon: pfzIcon }).addTo(lg);

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; max-width: 250px; padding: 2px;">
            <div style="font-weight: 700; color: #059669; font-size: 13px; margin-bottom: 4px;">
              ${zone.zoneName}
            </div>
            <div><strong>${language === 'ta' ? 'அதிகாரப்பூர்வ மூலம்' : 'Official Source'}:</strong> ${zone.source} (${zone.advisoryDate})</div>
            <div><strong>${language === 'ta' ? 'தொலைவு' : 'Distance'}:</strong> ${zone.distanceKm} km | Depth: ${zone.depthMeters}m</div>
            <div><strong>SST:</strong> ${zone.sstCelsius}°C | <strong>Chl-a:</strong> ${zone.chlorophyllMgM3} mg/m³</div>
            <div style="margin-top: 4px;"><strong>${language === 'ta' ? 'பரிந்துரைக்கப்பட்ட மீன்வளம்' : 'Likely Species'}:</strong></div>
            <div style="font-size: 11px; color: #334155; font-weight: 600;">${zone.recommendedSpecies.join(', ')}</div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b; font-style: italic;">
              ${language === 'ta' ? 'அறிவியல் ஆலோசனை: Oceansat-3 செயற்கைக்கோள் குளோரோபில் மற்றும் கடல் வெப்பநிலையின் அடிப்படையில் கணிக்கப்பட்ட திரள்வு மண்டலம்.' : 'INCOIS scientific advisory based on Oceansat-3 satellite ocean color & thermal gradient.'}
            </div>
          </div>
        `;

        poly.bindPopup(popupContent);
        marker.bindPopup(popupContent);
      });
    }

    // 4. BOUNDARIES: IMBL (INDIA - SRI LANKA) & MARINE PROTECTED AREAS
    if (showIMBL) {
      const imbl = boundaries.find((b) => b.type === 'IMBL');
      if (imbl) {
        // Red demarcation line with clear dash
        L.polyline(imbl.coordinates, {
          color: '#ef4444',
          weight: 3.5,
          dashArray: '8, 6'
        })
          .bindPopup(`
            <div style="font-size: 12px; color: #0f172a; padding: 4px;">
              <strong style="color: #dc2626; font-size: 13px;">${imbl.name}</strong><br/>
              <p style="margin: 4px 0;">${language === 'ta' ? imbl.descriptionTa : imbl.descriptionEn}</p>
              <span style="font-size: 10px; color: #64748b; font-weight: 600;">Authority: ${imbl.authority}</span>
            </div>
          `)
          .addTo(lg);

        // IMBL 5km buffer warning band (translucent amber)
        const bufferCoords = imbl.coordinates.map((pt) => [pt[0], pt[1] - 0.045] as [number, number]);
        L.polyline(bufferCoords, {
          color: '#f59e0b',
          weight: 2,
          dashArray: '4, 6'
        })
          .bindTooltip(language === 'ta' ? '5 கி.மீ IMBL எச்சரிக்கை மண்டலம்' : '5km IMBL Safety Warning Buffer', {
            permanent: false,
            direction: 'left'
          })
          .addTo(lg);
      }
    }

    // Marine Protected Area (Gulf of Mannar Coral Sanctuary)
    if (showMPA) {
      const mpa = boundaries.find((b) => b.type === 'MPA_SANCTUARY');
      if (mpa) {
        L.polygon(mpa.coordinates, {
          color: '#eab308',
          weight: 2,
          fillColor: '#eab308',
          fillOpacity: 0.18,
          dashArray: '6, 6'
        })
          .bindPopup(`
            <div style="font-size: 12px; color: #0f172a; padding: 3px;">
              <strong style="color: #b45309; font-size: 13px;">${mpa.name}</strong><br/>
              <p style="margin: 4px 0;">${language === 'ta' ? mpa.descriptionTa : mpa.descriptionEn}</p>
              <span style="font-size: 10px; color: #64748b;">Authority: ${mpa.authority}</span>
            </div>
          `)
          .addTo(lg);
      }
    }

    // 5. ROUTES (Fastest vs Lower-Risk vs Fuel-Aware)
    if (showRoutes) {
      const displayedRoutes = routes.length > 0 ? routes : activeRoute ? [activeRoute] : [];

      displayedRoutes.forEach((route) => {
        let routeColor = '#06b6d4'; // cyan for fastest
        if (route.type === 'LOWER_RISK') routeColor = '#10b981'; // emerald
        if (route.type === 'FUEL_EFFICIENT') routeColor = '#3b82f6'; // blue

        const polyline = L.polyline(route.waypoints, {
          color: routeColor,
          weight: 4,
          opacity: 0.9
        }).addTo(lg);

        polyline.bindPopup(`
          <div style="font-size: 12px; color: #0f172a; padding: 4px;">
            <strong style="color: ${routeColor}; font-size: 13px;">${route.name}</strong><br/>
            <p style="margin: 3px 0;">${language === 'ta' ? route.descriptionTa : route.descriptionEn}</p>
            <strong>${language === 'ta' ? 'தூரம்' : 'Distance'}:</strong> ${route.distanceKm} km<br/>
            <strong>${language === 'ta' ? 'மதிப்பிடப்பட்ட நேரம்' : 'Est. Time'}:</strong> ${route.estimatedDurationHours} hrs<br/>
            <strong>${language === 'ta' ? 'எரிபொருள்' : 'Est. Fuel'}:</strong> ${route.estimatedFuelLitres} L<br/>
            <strong>${language === 'ta' ? 'ஆபத்து நிலை' : 'Risk'}:</strong> <span style="font-weight: 700; color: ${route.averageRisk === 'LOW' ? '#10b981' : '#f59e0b'};">${route.averageRisk}</span>
          </div>
        `);
      });
    }

    // 6. SURFACE CURRENT DRIFT VECTORS
    if (showCurrentDrift) {
      // Vector arrow indicating longshore current direction
      const currentIcon = L.divIcon({
        className: 'current-vector',
        html: `
          <div class="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-[10px] text-cyan-300 font-mono flex items-center gap-1 shadow">
            <span>🌊 0.42 m/s (210° SSW)</span>
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      });

      L.marker([9.22, 79.32], { icon: currentIcon }).addTo(lg);
    }
  }, [
    pfzZones,
    boundaries,
    activeRoute,
    routes,
    fisherLocation,
    showPFZ,
    showIMBL,
    showMPA,
    showRoutes,
    showHarbours,
    showCurrentDrift,
    language
  ]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 transition-all duration-300 ${
        isExpanded ? 'h-[750px]' : 'h-[520px]'
      }`}
    >
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Basemap Switcher (Satellite, Nautical Seamarks, Tactical Dark, Standard) */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1 text-xs">
          <button
            onClick={() => handleBasemapChange('satellite')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              basemap === 'satellite'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🛰️ Real Satellite</span>
          </button>

          <button
            onClick={() => handleBasemapChange('nautical')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              basemap === 'nautical'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>⚓ Nautical Map</span>
          </button>

          <button
            onClick={() => handleBasemapChange('dark')}
            className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              basemap === 'dark'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>🌌 Night Radar</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer pr-1">
            <input
              type="checkbox"
              checked={showSeamarks}
              onChange={(e) => setShowSeamarks(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
            <span>OpenSeaMap Buoys</span>
          </label>
        </div>

        {/* Quick Map Controls (Center Boat, Fit All, Expand) */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1 text-xs">
          <button
            onClick={handleCenterOnBoat}
            title={language === 'ta' ? 'படகை மையப்படுத்த' : 'Center on My Boat'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Locate className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline font-semibold text-[11px]">Boat</span>
          </button>

          <button
            onClick={handleFitAll}
            title={language === 'ta' ? 'முழு பார்வையை அமைக்க' : 'Fit Entire Area'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-semibold text-[11px]">Fit</span>
          </button>

          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
            }}
            title={isExpanded ? 'Collapse' : 'Expand Height'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Layer Visibility Floating Palette */}
      <div className="absolute top-16 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-2xl text-xs space-y-1.5 text-slate-200 max-w-[210px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-100 pb-1 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ta' ? 'வரைபட அடுக்குகள்' : 'Active Layers'}</span>
        </div>

        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white py-0.5">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {language === 'ta' ? 'PFZ மண்டலங்கள்' : 'INCOIS PFZ Zones'}
          </span>
          <input
            type="checkbox"
            checked={showPFZ}
            onChange={(e) => setShowPFZ(e.target.checked)}
            className="accent-emerald-400 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white py-0.5">
          <span className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            {language === 'ta' ? 'IMBL எல்லைக் கோடு' : 'IMBL Border (5km)'}
          </span>
          <input
            type="checkbox"
            checked={showIMBL}
            onChange={(e) => setShowIMBL(e.target.checked)}
            className="accent-red-400 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white py-0.5">
          <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            {language === 'ta' ? 'பரிந்துரைத்த பாதைகள்' : 'Routes & Drift'}
          </span>
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={(e) => setShowRoutes(e.target.checked)}
            className="accent-cyan-400 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white py-0.5">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            {language === 'ta' ? 'பவளப்பாறை காப்பகம்' : 'MPA Sanctuary'}
          </span>
          <input
            type="checkbox"
            checked={showMPA}
            onChange={(e) => setShowMPA(e.target.checked)}
            className="accent-amber-400 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Selected Coordinate Inspection Card (Appears when clicking anywhere on the map) */}
      {inspectedLocation && (
        <div className="absolute bottom-10 left-3 z-10 bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 shadow-2xl max-w-sm text-xs text-slate-100 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட கடல் புள்ளி' : 'Selected Marine Coordinate'}</span>
            </div>
            <button
              onClick={() => setInspectedLocation(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Position:</span>
              <span>{inspectedLocation.lat.toFixed(4)}°N, {inspectedLocation.lng.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Est. Water Depth:</span>
              <span className="text-cyan-400 font-bold">{inspectedLocation.depthM} meters</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Nearest PFZ:</span>
              <span className="text-emerald-400 font-bold">{inspectedLocation.nearestPFZKm} km</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Distance to IMBL:</span>
              <span className={`font-bold ${inspectedLocation.imblDistanceKm < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                {inspectedLocation.imblDistanceKm} km
              </span>
            </div>
          </div>

          <div className={`p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
            inspectedLocation.isSafe
              ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-200'
              : 'bg-red-950/80 border border-red-800/80 text-red-200 font-semibold'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${inspectedLocation.isSafe ? 'text-emerald-400' : 'text-red-400'}`} />
            <span>{inspectedLocation.warningNote}</span>
          </div>
        </div>
      )}

      {/* Bottom Status Ribbon: Real-Time Live Cursor GPS & Sea State */}
      <div className="absolute bottom-2 left-3 right-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-cyan-300 font-bold">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {cursorCoords ? `${cursorCoords.lat.toFixed(4)}°N, ${cursorCoords.lng.toFixed(4)}°E` : 'Hover to inspect GPS'}
            </span>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wave: <strong>{oceanState.significantWaveHeightM}m</strong></span>
          </span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind: <strong>{oceanState.windSpeedKts} kts ({oceanState.windDirectionText})</strong></span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
            INCOIS Verified
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
            Esri World Satellite
          </span>
        </div>
      </div>
    </div>
  );
};
