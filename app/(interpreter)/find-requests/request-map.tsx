"use client";

import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import type { HelpRequest } from "@/app/lib/mock-requests";

export type RequestMapCoordinates = {
  latitude: number;
  longitude: number;
};

type RequestMapProps = {
  requests: HelpRequest[];
  userLocation: RequestMapCoordinates | null;
  selectedRequest: HelpRequest | null;
  mapLabel: string;
  loadingLabel: string;
  myLocationLabel: string;
  onSelect: (request: HelpRequest) => void;
};

const DEFAULT_CENTER: L.LatLngExpression = [8.64, 99.9];
const DEFAULT_ZOOM = 12;

function markerIcon(request: HelpRequest, isSelected: boolean) {
  const isUrgent = request.urgency === "Immediate";
  const markerClass = [
    "khvi-leaflet-marker",
    isUrgent ? "khvi-leaflet-marker--urgent" : "khvi-leaflet-marker--scheduled",
    isSelected ? "khvi-leaflet-marker--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: markerClass,
    html: `<span class="khvi-leaflet-marker__dot"><span class="khvi-leaflet-marker__glyph" aria-hidden="true">${isUrgent ? "!" : "◷"}</span></span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 42],
    tooltipAnchor: [0, -40],
  });
}

export function RequestMap({
  requests,
  userLocation,
  selectedRequest,
  mapLabel,
  loadingLabel,
  myLocationLabel,
  onSelect,
}: RequestMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const requestLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      attributionControl: true,
      zoomControl: false,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      detectRetina: true,
      keepBuffer: 4,
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    requestLayerRef.current = L.layerGroup().addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      requestLayerRef.current = null;
      userLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const requestLayer = requestLayerRef.current;
    if (!map || !requestLayer) return;

    requestLayer.clearLayers();

    requests.forEach((request) => {
      if (request.latitude === null || request.longitude === null) return;

      const coordinates: [number, number] = [request.latitude, request.longitude];

      const marker = L.marker(coordinates, {
        icon: markerIcon(request, selectedRequest?.requestId === request.requestId),
        title: request.areaName,
      });

      marker.bindTooltip(request.areaName, {
        direction: "top",
        opacity: 0.96,
        sticky: true,
      });
      marker.on("click", () => onSelect(request));
      marker.addTo(requestLayer);
    });
  }, [onSelect, requests, selectedRequest]);

  useEffect(() => {
    const userLayer = userLayerRef.current;
    if (!userLayer) return;

    userLayer.clearLayers();

    if (userLocation) {
      const userCoordinates: [number, number] = [userLocation.latitude, userLocation.longitude];

      L.circleMarker(userCoordinates, {
        color: "#ffffff",
        fillColor: "#4d8a93",
        fillOpacity: 1,
        radius: 8,
        weight: 4,
      })
        .bindTooltip(myLocationLabel, { direction: "top", opacity: 0.96 })
        .addTo(userLayer);
    }
  }, [myLocationLabel, userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const boundsPoints: [number, number][] = requests.flatMap((request) => (
      request.latitude === null || request.longitude === null
        ? []
        : [[request.latitude, request.longitude] as [number, number]]
    ));

    if (userLocation) {
      boundsPoints.push([userLocation.latitude, userLocation.longitude]);
    }

    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds.pad(boundsPoints.length === 1 ? 0.45 : 0.18), {
        animate: false,
        maxZoom: 14,
      });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
    }
  }, [requests, userLocation]);

  return (
    <div className="request-leaflet-map relative min-h-[430px] sm:min-h-[520px]" aria-label={mapLabel}>
      <div ref={mapContainerRef} className="h-full min-h-[430px] w-full sm:min-h-[520px]" />
      {!mapReady && (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-white/65 backdrop-blur-[1px]">
          <p role="status" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#425761] shadow-sm">
            {loadingLabel}
          </p>
        </div>
      )}
    </div>
  );
}
