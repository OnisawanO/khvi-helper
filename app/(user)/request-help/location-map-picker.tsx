"use client";

import * as L from "leaflet";
import { CheckIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};

type LocationMapPickerProps = {
  initialCoordinates: LocationCoordinates | null;
  mapLabel: string;
  hint: string;
  selectedLabel: string;
  useCenterLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (coordinates: LocationCoordinates) => void;
  onCancel: () => void;
};

const DEFAULT_CENTER: L.LatLngExpression = [13.0389, 101.49];
const DEFAULT_ZOOM = 6;

function selectionIcon() {
  return L.divIcon({
    className: "khvi-location-picker-marker",
    html: '<span aria-hidden="true" style="display:grid;width:42px;height:42px;place-items:center;border:4px solid white;border-radius:9999px;background:#ef5b47;color:white;box-shadow:0 8px 18px rgba(9,47,69,.28);font-size:22px;line-height:1">●</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function LocationMapPicker({
  initialCoordinates,
  mapLabel,
  hint,
  selectedLabel,
  useCenterLabel,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selected, setSelected] = useState<LocationCoordinates | null>(initialCoordinates);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: L.LatLngExpression = initialCoordinates
      ? [initialCoordinates.latitude, initialCoordinates.longitude]
      : DEFAULT_CENTER;
    const map = L.map(mapContainerRef.current, {
      attributionControl: true,
      keyboard: true,
      zoomControl: false,
    }).setView(initialCenter, initialCoordinates ? 15 : DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
      minZoom: 3,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const setPoint = (coordinates: LocationCoordinates) => {
      setSelected(coordinates);

      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.latitude, coordinates.longitude]);
      } else {
        markerRef.current = L.marker([coordinates.latitude, coordinates.longitude], {
          draggable: true,
          icon: selectionIcon(),
          title: selectedLabel,
        }).addTo(map);
        markerRef.current.on("dragend", () => {
          const point = markerRef.current?.getLatLng();
          if (point) setSelected({ latitude: point.lat, longitude: point.lng });
        });
      }
    };

    if (initialCoordinates) setPoint(initialCoordinates);
    map.on("click", (event: L.LeafletMouseEvent) => {
      setPoint({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });

    mapRef.current = map;
    const resizeFrame = requestAnimationFrame(() => map.invalidateSize());

    return () => {
      cancelAnimationFrame(resizeFrame);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialCoordinates, selectedLabel]);

  function selectMapCenter() {
    const center = mapRef.current?.getCenter();
    if (!center) return;

    const coordinates = { latitude: center.lat, longitude: center.lng };
    setSelected(coordinates);

    if (markerRef.current) {
      markerRef.current.setLatLng(center);
    } else {
      markerRef.current = L.marker(center, {
        draggable: true,
        icon: selectionIcon(),
        title: selectedLabel,
      }).addTo(mapRef.current!);
      markerRef.current.on("dragend", () => {
        const point = markerRef.current?.getLatLng();
        if (point) setSelected({ latitude: point.lat, longitude: point.lng });
      });
    }
  }

  return (
    <section id="help-location-map" className="mt-4 overflow-hidden rounded-xl border border-[#b9d9d6] bg-[#f7fbfa]" aria-label={mapLabel}>
      <div className="flex items-start justify-between gap-4 border-b border-[#d6e4e4] px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#173646]">
            <MapPinIcon aria-hidden="true" className="h-5 w-5 text-[#087f80]" />
            {mapLabel}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#64777e]">{hint}</p>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[#52676f] transition-colors hover:bg-[#e5f2f0] hover:text-[#087f80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
          aria-label={cancelLabel}
          onClick={onCancel}
        >
          <XMarkIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="relative h-[320px] min-h-[320px] w-full sm:h-[380px] sm:min-h-[380px]">
        <div ref={mapContainerRef} className="h-full w-full" aria-label={mapLabel} />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-[450] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#087f80] shadow" />
      </div>

      <div className="border-t border-[#d6e4e4] bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-xs font-bold tabular-nums text-[#52676f]">
            {selected
              ? `${selectedLabel}: ${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`
              : hint}
          </p>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-[#087f80] px-3 py-2 text-xs font-extrabold text-[#087f80] transition-colors hover:bg-[#edf7f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80]"
            onClick={selectMapCenter}
          >
            {useCenterLabel}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-12 rounded-lg border border-[#cbd7dc] px-4 py-3 text-sm font-extrabold text-[#52676f] transition-colors hover:bg-[#f1f5f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#52676f]"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={!selected}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#087f80] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#066f70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f80] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => selected && onConfirm(selected)}
          >
            <CheckIcon aria-hidden="true" className="h-5 w-5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
