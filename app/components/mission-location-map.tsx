"use client";

import { MapPinIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export type MissionMapPoint = {
  id: "requester" | "interpreter";
  label: string;
  detail: string;
  latitude: number;
  longitude: number;
};

type Viewport = {
  north: number;
  south: number;
  east: number;
  west: number;
};

const MIN_ZOOM_STEP = -2;
const MAX_ZOOM_STEP = 4;

function mercatorY(latitude: number) {
  const clamped = Math.max(-85, Math.min(85, latitude));
  const radians = clamped * Math.PI / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function viewportFor(points: MissionMapPoint[]): Viewport {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.008);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.008);

  return {
    north: Math.min(85, maxLatitude + latitudeSpan * 0.45),
    south: Math.max(-85, minLatitude - latitudeSpan * 0.45),
    east: Math.min(180, maxLongitude + longitudeSpan * 0.45),
    west: Math.max(-180, minLongitude - longitudeSpan * 0.45),
  };
}

function markerPosition(point: MissionMapPoint, viewport: Viewport) {
  const x = (point.longitude - viewport.west) / (viewport.east - viewport.west);
  const north = mercatorY(viewport.north);
  const south = mercatorY(viewport.south);
  const y = (north - mercatorY(point.latitude)) / (north - south);
  return { left: `${x * 100}%`, top: `${y * 100}%` };
}

function boundedRange(center: number, span: number, minimum: number, maximum: number) {
  const boundedSpan = Math.min(span, maximum - minimum);
  let start = center - boundedSpan / 2;
  let end = center + boundedSpan / 2;

  if (start < minimum) {
    end += minimum - start;
    start = minimum;
  }
  if (end > maximum) {
    start -= end - maximum;
    end = maximum;
  }

  return [start, end] as const;
}

function zoomViewport(viewport: Viewport, zoomStep: number): Viewport {
  const scale = 2 ** -zoomStep;
  const latitudeCenter = (viewport.north + viewport.south) / 2;
  const longitudeCenter = (viewport.east + viewport.west) / 2;
  const [south, north] = boundedRange(
    latitudeCenter,
    (viewport.north - viewport.south) * scale,
    -85,
    85,
  );
  const [west, east] = boundedRange(
    longitudeCenter,
    (viewport.east - viewport.west) * scale,
    -180,
    180,
  );

  return { north, south, east, west };
}

export function MissionLocationMap({
  points,
  title,
  zoomInLabel,
  zoomOutLabel,
}: {
  points: MissionMapPoint[];
  title: string;
  zoomInLabel: string;
  zoomOutLabel: string;
}) {
  const [zoomStep, setZoomStep] = useState(0);

  if (points.length === 0) return null;

  const viewport = zoomViewport(viewportFor(points), zoomStep);
  const params = new URLSearchParams({
    bbox: [viewport.west, viewport.south, viewport.east, viewport.north].join(","),
    layer: "mapnik",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-[#c7d5da] bg-[#e9f0ef]">
      <div className="relative h-64 overflow-hidden sm:h-80" role="region" aria-label={title}>
        <div className="absolute inset-y-0 -left-12 -right-12">
          <iframe
            title={title}
            src={`https://www.openstreetmap.org/export/embed.html?${params.toString()}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08),rgba(255,255,255,0.08))]" />
          {points.map((point, index) => {
            const position = markerPosition(point, viewport);
            const isRequester = point.id === "requester";
            const overlaps = points.length === 2
              && Math.abs(points[0].latitude - points[1].latitude) < 0.00005
              && Math.abs(points[0].longitude - points[1].longitude) < 0.00005;
            return (
              <div
                key={point.id}
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
                style={{ ...position, marginLeft: overlaps ? (index === 0 ? -18 : 18) : 0 }}
                aria-hidden="true"
              >
                <span className={`mb-1 block whitespace-nowrap rounded-md border bg-white px-2 py-1 text-[11px] font-extrabold shadow-sm ${isRequester ? "border-[#087f80] text-[#087f80]" : "border-(--khvi-coral) text-(--khvi-coral)"}`}>
                  {point.label}
                </span>
                <MapPinIcon className={`mx-auto h-9 w-9 drop-shadow-sm ${isRequester ? "text-[#087f80]" : "text-(--khvi-coral)"}`} />
              </div>
            );
          })}
        </div>
        <div
          className="absolute top-2.5 left-2.5 z-20 flex flex-col overflow-hidden rounded-lg border border-[#9fb1b9] bg-white shadow-sm"
          role="group"
          aria-label={title}
        >
          <button
            type="button"
            aria-label={zoomInLabel}
            title={zoomInLabel}
            disabled={zoomStep >= MAX_ZOOM_STEP}
            onClick={() => setZoomStep((current) => Math.min(MAX_ZOOM_STEP, current + 1))}
            className="flex h-9 w-9 items-center justify-center border-b border-[#c7d5da] text-2xl font-bold leading-none text-[#173646] transition-colors hover:bg-[#edf7f5] disabled:cursor-not-allowed disabled:text-[#a7b4b9] disabled:hover:bg-white focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-(--khvi-sun)"
          >
            <span aria-hidden="true">+</span>
          </button>
          <button
            type="button"
            aria-label={zoomOutLabel}
            title={zoomOutLabel}
            disabled={zoomStep <= MIN_ZOOM_STEP}
            onClick={() => setZoomStep((current) => Math.max(MIN_ZOOM_STEP, current - 1))}
            className="flex h-9 w-9 items-center justify-center text-2xl font-bold leading-none text-[#173646] transition-colors hover:bg-[#edf7f5] disabled:cursor-not-allowed disabled:text-[#a7b4b9] disabled:hover:bg-white focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-(--khvi-sun)"
          >
            <span aria-hidden="true">−</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#c7d5da] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#52676f]">
          {points.map((point) => (
            <li key={point.id} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${point.id === "requester" ? "bg-[#087f80]" : "bg-(--khvi-coral)"}`} />
              <span>{point.label}</span>
              <span className="text-[#8a9aa0]">{point.detail}</span>
            </li>
          ))}
        </ul>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] font-bold text-[#64777e] underline decoration-[#a9b9bf] underline-offset-2 hover:text-[#087f80]"
        >
          © OpenStreetMap contributors
        </a>
      </div>
    </div>
  );
}
