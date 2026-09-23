"use client";

import { StarIcon } from "@heroicons/react/24/outline";
import { AdminUserRecord } from "../types";

interface InterpretersTableProps {
  interpreters: AdminUserRecord[];
  onSelectUser: (user: AdminUserRecord) => void;
}

export function InterpretersTable({
  interpreters,
  onSelectUser,
}: InterpretersTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#092f45]">Interpreter Quality & Ratings</h3>
            <p className="text-xs text-slate-500">
              Calculated from user reviews, SOS response velocity, and completed emergency missions.
            </p>
          </div>
          <div className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
            Sorted by Rating (Descending)
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Rank & Interpreter</th>
                <th className="px-3 py-3.5">Specialty Domains</th>
                <th className="px-3 py-3.5 text-center">Completed Missions</th>
                <th className="px-3 py-3.5 text-center">Avg SOS Dispatch</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interpreters.map((interp, idx) => (
                <tr
                  key={interp.id}
                  onClick={() => onSelectUser(interp)}
                  className="cursor-pointer transition-colors hover:bg-teal-50/40"
                >
                  {/* Rank & Name */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#087f80]/10 text-xs font-extrabold text-[#087f80]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-[#092f45]">{interp.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {interp.primaryLanguage} Specialist • {interp.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Specialty Domains */}
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1">
                      {interp.interpreterStats?.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Completed Missions */}
                  <td className="px-3 py-4 text-center font-semibold text-slate-800">
                    {interp.interpreterStats?.completedMissions} trips
                  </td>

                  {/* Avg SOS Dispatch */}
                  <td className="px-3 py-4 text-center font-mono text-[11px] text-slate-600">
                    {interp.interpreterStats?.responseTimeAvg}
                  </td>

                  {/* Avg Rating */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                      <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{interp.interpreterStats?.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
