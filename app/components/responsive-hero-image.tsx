import { getImageProps } from "next/image";

export function ResponsiveHeroImage({ desktopSrc, mobileSrc, alt, sizes, className = "object-center" }: {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const { props: { srcSet: desktopSrcSet } } = getImageProps({
    src: desktopSrc,
    alt,
    width: 1536,
    height: 1024,
    sizes,
  });
  const { props: { srcSet: mobileSrcSet, ...mobileProps } } = getImageProps({
    src: mobileSrc,
    alt,
    width: 1024,
    height: 1536,
    sizes,
  });

  return (
    <picture className="absolute inset-0">
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
      <img
        {...mobileProps}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        className={`h-full w-full object-cover ${className}`}
      />
    </picture>
  );
}
