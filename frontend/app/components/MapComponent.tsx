"use client";

import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Feature, FeatureCollection, LineString } from 'geojson';

interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  colors?: string[];
}

interface Props {
  stations: Station[];
}

export default function MapComponent({ stations }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [77.209, 28.6139],
      zoom: 12,
    });

    new maplibregl.Marker().setLngLat([77.209, 28.6139]).addTo(mapRef.current);
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current.on("error", (e) => console.log(e));

    if (mapRef.current.isStyleLoaded()) {
      setMapReady(true);
    } else {
      mapRef.current.once("load", () => setMapReady(true));
    }

    // Force maplibre to re-measure its container once real layout is settled
    requestAnimationFrame(() => mapRef.current?.resize());

    const resizeObserver = new ResizeObserver(() => mapRef.current?.resize());
    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);


useEffect(() => {
  const map = mapRef.current;
    if (!map || !mapReady || !stations || stations.length === 0) return;

  const drawRoute = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (map.getLayer("route-layer")) map.removeLayer("route-layer");
    if (map.getSource("route-source")) map.removeSource("route-source");

    const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    for (let i = 0; i < stations.length - 1; i++) {
      const a = stations[i];
      const b = stations[i + 1];

      const sharedColor =
        a.colors?.find((c) => b.colors?.includes(c)) ?? "808080";

      features.push({
        type: "Feature",
        properties: {
          color: `#${sharedColor}`,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [a.lng, a.lat],
            [b.lng, b.lat],
          ],
        },
      });
    }

    const geojsonData: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: "FeatureCollection",
      features: features,
    };

    map.addSource("route-source", {
      type: "geojson",
      data: geojsonData,
    });

    map.addLayer({
      id: "route-layer",
      type: "line",
      source: "route-source",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 5,
        "line-opacity": 0.9,
      },
    });

    stations.forEach((s, index) => {
      const isStart = index === 0;
      const isEnd = index === stations.length - 1;

      const prevColors = index > 0 ? stations[index - 1].colors : null;
      const nextColors =
        index < stations.length - 1 ? stations[index + 1].colors : null;
      const isInterchange =
        prevColors && nextColors
          ? !prevColors.some((c) => nextColors.includes(c))
          : false;

      const el = document.createElement("div");

      if (isStart || isEnd) {
        el.style.width = "28px";
        el.style.height = "34px";
        el.innerHTML = `
            <svg width="28" height="34" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18c0-6.627-5.373-12-12-12z" 
                fill="#FF0000" stroke="#0A0F1E" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="5" fill="#0A0F1E"/>
            </svg>
          `;
      } else {
        const markerColor = isInterchange
          ? "#ffffff"
          : `#${s.colors?.[0] ?? "808080"}`;

        el.style.width = isInterchange ? "16px" : "10px";
        el.style.height = isInterchange ? "16px" : "10px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = markerColor;
        el.style.border = "2px solid #0A0F1E";
      }

      const popup = new maplibregl.Popup({
        offset: isStart || isEnd ? 20 : 12,
      }).setText(s.name);

      popup.on("open", () => {
        const container = popup.getElement();
        const content = container.querySelector(
          ".maplibregl-popup-content"
        ) as HTMLElement;
        const tip = container.querySelector(
          ".maplibregl-popup-tip"
        ) as HTMLElement;

        if (content) {
          content.style.backgroundColor = "#131B2E";
          content.style.color = "#E7ECF5";
          content.style.fontWeight = "600";
          content.style.fontFamily = "var(--font-display)";
          content.style.border = "1px solid #232D42";
        }
        if (tip) tip.style.borderTopColor = "#131B2E";
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: isStart || isEnd ? "bottom" : "center",
      })
        .setLngLat([s.lng, s.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    const bounds = new maplibregl.LngLatBounds();
    stations.forEach((s) => bounds.extend([s.lng, s.lat]));
    map.fitBounds(bounds, { padding: 60 });
  };

  if (map.isStyleLoaded()) {
    drawRoute();
  } else {
    map.once("load", drawRoute);
  }
}, [stations, mapReady]);
  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}