import Image from "next/image";
import { cn } from "@/components/lib/utils";
import { initialsFrom } from "./initials";

type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size: "sm" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "size-10 text-sm",
  lg: "size-24 text-3xl md:size-28",
} as const;

// Píxeles reales que pide next/image: el doble del tamaño visible, para pantallas de alta densidad.
const IMAGE_PX = { sm: 80, lg: 224 } as const;

/** Foto del usuario si la tiene (Google) o sus iniciales sobre el color de marca suave. */
export function UserAvatar({ name, avatarUrl, size, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-extrabold tracking-tight text-brand-ink",
        SIZE_CLASS[size],
        className,
      )}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" width={IMAGE_PX[size]} height={IMAGE_PX[size]} className="size-full object-cover" />
      ) : (
        <span aria-hidden="true">{initialsFrom(name)}</span>
      )}
    </span>
  );
}
