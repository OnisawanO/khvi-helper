import Image from "next/image";
import Link from "next/link";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link className="flex items-center gap-3" href="/#top" aria-label="KHVI Helper home">
      <span className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border ${light ? "border-white/20 bg-white/10" : "border-[#d8e1e6] bg-white"}`}>
        <Image
          src="/khvi-logo.jpg"
          alt="KHVI Helper logo"
          fill
          sizes="44px"
          className="scale-[2.15] object-cover object-[50%_54%]"
          priority
        />
      </span>
      <span className="min-w-0">
        <span className={`block text-[21px] font-extrabold tracking-[-0.02em] ${light ? "text-white" : "text-[#10283a]"}`}>KHVI Helper</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${light ? "text-white/70" : "text-[#778084]"}`}>Trusted language support</span>
      </span>
    </Link>
  );
}
