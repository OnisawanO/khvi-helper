"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { type MapCopy, type MapJob } from "@/app/map/map-view";

type LeafletMapProps = {
  jobs: readonly MapJob[];
  selectedId: string | null;
  labels: MapCopy;
  onSelect: (id: string) => void;
};

const DEFAULT_CENTER: [number, number] = [8.54, 99.92];

function PinIcon({ urgent, selected }: { urgent: boolean; selected: boolean }) {
  return L.divIcon({
    className: "khvi-leaflet-marker",
    html: `<span class="khvi-leaflet-marker-shape ${urgent ? "khvi-leaflet-marker-urgent" : "khvi-leaflet-marker-scheduled"} ${selected ? "khvi-leaflet-marker-selected" : ""}"><span>${urgent ? "!" : "◷"}</span></span>`,
    iconSize: [48, 58],
    iconAnchor: [24, 52],
    popupAnchor: [0, -48],
  });
}

function ViewportController({ jobs, selectedJob }: { jobs: readonly MapJob[]; selectedJob: MapJob | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedJob) {
      map.flyTo([selectedJob.latitude, selectedJob.longitude], Math.max(map.getZoom(), 12), { duration: 0.35 });
      return;
    }

    if (jobs.length > 1) {
      map.fitBounds(jobs.map((job) => [job.latitude, job.longitude] as [number, number]), { padding: [42, 42], maxZoom: 12, animate: false });
    }
  }, [jobs, map, selectedJob]);

  return null;
}

export function LeafletMap({ jobs, selectedId, labels, onSelect }: LeafletMapProps) {
  const selectedJob = jobs.find((job) => job.requestId === selectedId) ?? null;
  const icons = useMemo(() => new Map(jobs.map((job) => [job.requestId, PinIcon({ urgent: job.urgency === "Immediate", selected: job.requestId === selectedId })])), [jobs, selectedId]);

  return (
    <section className="order-1 relative min-h-[450px] overflow-hidden border border-[#d8e1e6] bg-[#dfe9e5] lg:order-2 lg:min-h-[680px]" aria-label="SOS map">
      <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom className="z-0 h-[450px] w-full lg:h-[680px]" zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportController jobs={jobs} selectedJob={selectedJob} />
        {jobs.map((job) => {
          const urgent = job.urgency === "Immediate";

          return (
            <span key={job.requestId}>
              <Circle center={[job.latitude, job.longitude]} radius={urgent ? 850 : 650} pathOptions={{ color: urgent ? "#f04f3e" : "#092f45", fillColor: urgent ? "#f04f3e" : "#092f45", fillOpacity: 0.09, weight: 1 }} />
              <Marker
                position={[job.latitude, job.longitude]}
                icon={icons.get(job.requestId)}
                eventHandlers={{ click: () => onSelect(job.requestId) }}
                keyboard
                title={`${job.urgency === "Immediate" ? labels.urgent : labels.appointment}: ${job.areaName}`}
              />
            </span>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-[400] flex items-center gap-2 rounded-lg border border-[#d8e1e6] bg-white/95 px-3 py-2 text-xs font-semibold text-[#52676f] shadow-[0_10px_24px_rgba(20,55,72,0.12)]">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf7f5] text-[#087f80]">⌖</span>
        <span>{labels.roughLocation}</span>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex items-center gap-3 rounded-lg border border-[#d8e1e6] bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#52676f] shadow-[0_10px_24px_rgba(20,55,72,0.12)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f04f3e]" />{labels.urgent}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#092f45]" />{labels.appointment}</span>
      </div>
    </section>
  );
}
