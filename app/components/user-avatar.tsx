import type { UserProfile } from "@/app/lib/auth-types";
import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg" | "xl" | "xxl";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
  xxl: "h-32 w-32 text-5xl",
};

function getInitials(name: string) {
  const parts = name.replace(/\s+\([^)]*\)$/, "").trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase() || "KH";
}

export function UserAvatar({ user, size = "md", className = "" }: { user: UserProfile; size?: AvatarSize; className?: string }) {
  const classes = `${sizeClasses[size]} ${className}`;

  if (user.avatarUrl) {
    return <Image src={user.avatarUrl} alt={`${user.name} profile`} width={80} height={80} unoptimized className={`${classes} rounded-full object-cover`} />;
  }

  return (
    <span className={`${classes} flex shrink-0 items-center justify-center rounded-full bg-(--khvi-navy) font-black text-white`} aria-label={`${user.name} profile`}>
      {getInitials(user.name)}
    </span>
  );
}
