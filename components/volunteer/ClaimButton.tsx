"use client";

import { useState } from "react";

interface ClaimButtonProps {
  missionId: string;
  onClaim: (missionId: string) => Promise<void> | void;
}

export function ClaimButton({ missionId, onClaim }: ClaimButtonProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClick = async () => {
    setIsClaiming(true);
    try {
      await onClaim(missionId);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isClaiming}
      className="inline-flex items-center gap-2 border border-[#087f80] bg-[#087f80] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#096f70] transition-colors disabled:opacity-50"
    >
      <span>{isClaiming ? "กำลังรับงาน..." : "รับงานล่าม (Claim Mission) →"}</span>
    </button>
  );
}
