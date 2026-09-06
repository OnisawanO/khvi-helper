import Image from "next/image";
import Link from "next/link";

export function BrandMark({ light = false, subtitle = "Community interpreter map" }: { light?: boolean; subtitle?: string }) {
  return (
    <Link className="flex items-center gap-3" href="/#top" aria-label="K-HVI home">
      <span className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border ${light ? "border-white/20 bg-white/10" : "border-[#d8e1e6] bg-white"}`}>
        <Image
          src="/khvi-logo.jpg"
          alt="K-HVI logo"
          fill
          sizes="44px"
          className="scale-[2.15] object-cover object-[50%_54%]"
          priority
        />
      </span>
      <span className="min-w-0">
        <span className={`block text-[21px] font-extrabold tracking-normal ${light ? "text-white" : "text-[#10283a]"}`}>K-HVI</span>
        <span className={`block max-w-[10rem] truncate text-[10px] font-semibold tracking-normal ${light ? "text-white/70" : "text-[#778084]"}`}>{subtitle}</span>
      </span>
    </Link>
  );
}
