"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

export type MissionMapPoint = {
  id: "requester" | "interpreter";
  label: string;
  name: string;
  detail: string;
  sourceLabel: string;
  updatedAtLabel: string | null;
  accuracyMeters: number | null;
  isCurrentViewer: boolean;
  latitude: number;
  longitude: number;
};

type MissionLocationMapProps = {
  points: MissionMapPoint[];
  title: string;
  loadingLabel: string;
  youLabel: string;
  coordinatesLabel: string;
  accuracyLabel: string;
  updatedLabel: string;
  expandMapLabel: string;
  collapseMapLabel: string;
  touchZoomLabel: string;
};

const DEFAULT_CENTER: Leaflet.LatLngExpression = [8.64, 99.9];
const DEFAULT_ZOOM = 12;

function markerIcon(L: typeof import("leaflet"), point: MissionMapPoint) {
  const roleClass = point.id === "requester"
    ? "khvi-mission-marker--requester"
    : "khvi-mission-marker--interpreter";

  return L.divIcon({
    className: `khvi-mission-marker ${roleClass}`,
    html: `<span class="khvi-mission-marker__dot"><span class="khvi-mission-marker__glyph" aria-hidden="true">${point.id === "requester" ? "R" : "I"}</span></span>`,
    iconSize: [44, 44],
    iconAnchor: [point.id === "requester" ? 28 : 16, 42],
    tooltipAnchor: [point.id === "requester" ? -18 : 18, -33],
  });
}

function markerHeading(point: MissionMapPoint, youLabel: string) {
  return `${point.label} · ${point.name}${point.isCurrentViewer ? ` (${youLabel})` : ""}`;
}

function tooltipContent(point: MissionMapPoint, youLabel: string) {
  const content = document.createElement("span");
  content.textContent = markerHeading(point, youLabel);
  return content;
}

function popupContent(
  point: MissionMapPoint,
  labels: Pick<MissionLocationMapProps, "youLabel" | "coordinatesLabel" | "accuracyLabel" | "updatedLabel">,
) {
  const content = document.createElement("div");
  content.className = "khvi-mission-popup";

  const heading = document.createElement("strong");
  heading.textContent = markerHeading(point, labels.youLabel);
  content.append(heading);

  const source = document.createElement("span");
  source.textContent = point.sourceLabel;
  content.append(source);

  const coordinates = document.createElement("span");
  coordinates.textContent = `${labels.coordinatesLabel}: ${point.detail}`;
  content.append(coordinates);

  if (point.accuracyMeters !== null) {
    const accuracy = document.createElement("span");
    accuracy.textContent = `${labels.accuracyLabel}: ±${Math.round(point.accuracyMeters)} m`;
    content.append(accuracy);
  }

  if (point.updatedAtLabel) {
    const updated = document.createElement("span");
    updated.textContent = `${labels.updatedLabel}: ${point.updatedAtLabel}`;
    content.append(updated);
  }

  return content;
}

export function MissionLocationMap({
  points,
  title,
  loadingLabel,
  youLabel,
  coordinatesLabel,
  accuracyLabel,
  updatedLabel,
  expandMapLabel,
  collapseMapLabel,
  touchZoomLabel,
}: MissionLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapGeneration, setMapGeneration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let disposed = false;
    setMapReady(false);

    void import("leaflet").then((L) => {
      if (disposed || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        attributionControl: true,
        zoomControl: false,
        touchZoom: true,
        dragging: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        keyboard: true,
        tapHold: true,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        detectRetina: true,
        keepBuffer: 4,
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      markerLayerRef.current = L.layerGroup().addTo(map);
      leafletRef.current = L;
      mapRef.current = map;
      setMapGeneration((current) => current + 1);
      setMapReady(true);
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      leafletRef.current = null;
    };
  }, [isExpanded]);

  useEffect(() => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!mapReady || !map || !container) return;

    let animationFrame: number | null = null;
    const refreshMapSize = () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        map.invalidateSize({ animate: false, pan: false });
      });
    };
    const resizeObserver = new ResizeObserver(refreshMapSize);

    resizeObserver.observe(container);
    window.addEventListener("resize", refreshMapSize);
    refreshMapSize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", refreshMapSize);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [mapReady]);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isExpanded]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !markerLayer || !L) return;

    markerLayer.clearLayers();

    points.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: markerIcon(L, point),
        title: markerHeading(point, youLabel),
        keyboard: true,
      });

      marker.bindTooltip(tooltipContent(point, youLabel), {
        permanent: true,
        direction: point.id === "requester" ? "left" : "right",
        opacity: 0.96,
        className: "khvi-mission-tooltip",
      });
      marker.bindPopup(popupContent(point, { youLabel, coordinatesLabel, accuracyLabel, updatedLabel }), {
        closeButton: false,
        maxWidth: 280,
      });
      marker.addTo(markerLayer);
    });

    const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]));
    map.fitBounds(bounds.pad(points.length === 1 ? 0.45 : 0.18), {
      animate: false,
      maxZoom: 16,
      padding: [56, 56],
    });
  }, [accuracyLabel, coordinatesLabel, mapGeneration, mapReady, points, updatedLabel, youLabel]);

  return (
    <div
      className={isExpanded
        ? "fixed inset-0 z-[1200] flex h-[100dvh] flex-col bg-white"
        : "overflow-hidden rounded-xl border border-[#c7d5da] bg-white"}
      role={isExpanded ? "dialog" : undefined}
      aria-modal={isExpanded ? true : undefined}
      aria-label={isExpanded ? title : undefined}
    >
      <div
        className={isExpanded
          ? "mission-leaflet-map relative min-h-0 flex-1"
          : "mission-leaflet-map relative h-72 min-h-72 sm:h-96 sm:min-h-96"}
        role="region"
        aria-label={title}
      >
        <div
          ref={mapContainerRef}
          className={isExpanded ? "h-full min-h-0 w-full" : "h-full min-h-72 w-full sm:min-h-96"}
        />
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="absolute right-3 top-3 z-[600] inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#c7d5da] bg-white px-3 py-2 text-xs font-extrabold text-(--khvi-navy) shadow-[0_8px_20px_rgba(16,40,58,0.15)] transition-colors hover:bg-[#f7f9fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--khvi-sun)"
        >
          {isExpanded ? (
            <ArrowsPointingInIcon aria-hidden="true" className="h-5 w-5" />
          ) : (
            <ArrowsPointingOutIcon aria-hidden="true" className="h-5 w-5" />
          )}
          <span className={isExpanded ? "inline" : "hidden sm:inline"}>
            {isExpanded ? collapseMapLabel : expandMapLabel}
          </span>
          {!isExpanded && <span className="sr-only sm:hidden">{expandMapLabel}</span>}
        </button>
        {!mapReady && (
          <div className="absolute inset-0 z-[500] grid place-items-center bg-white/65 backdrop-blur-[1px]">
            <p role="status" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#425761] shadow-sm">
              {loadingLabel}
            </p>
          </div>
        )}
      </div>

      <p className="border-t border-[#c7d5da] bg-[#f7f9fa] px-4 py-2 text-xs font-bold text-[#52676f] sm:hidden">
        {touchZoomLabel}
      </p>

      <ul className={`grid gap-3 border-t border-[#c7d5da] bg-white px-4 py-3 sm:grid-cols-2 ${isExpanded ? "max-h-[34dvh] overflow-y-auto" : ""}`}>
        {points.map((point) => (
          <li key={point.id} className="flex min-w-0 items-start gap-2.5 text-xs">
            <span
              aria-hidden="true"
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white ${point.id === "requester" ? "bg-[#087f80]" : "bg-(--khvi-coral)"}`}
            />
            <span className="min-w-0">
              <span className="block font-extrabold text-[#294554]">
                {point.label} · {point.name}{point.isCurrentViewer ? ` (${youLabel})` : ""}
              </span>
              <span className="mt-0.5 block font-bold text-[#52676f]">{point.detail}</span>
              <span className="mt-0.5 block text-[#73848a]">
                {point.sourceLabel}
                {point.accuracyMeters !== null ? ` · ${accuracyLabel}: ±${Math.round(point.accuracyMeters)} m` : ""}
                {point.updatedAtLabel ? ` · ${updatedLabel}: ${point.updatedAtLabel}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
