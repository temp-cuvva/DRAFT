"use client";

import React, { useMemo, useState } from "react";

type Props = {
  make?: string | null;
  model?: string | null;
  size?: number;       // px
  className?: string;
  alt?: string | null;
};

// Map common make variations to filenames in public/makes
const ALIASES: Record<string, string> = {
  "mercedes": "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "vw": "volkswagen",
  "volkswagen": "volkswagen",
  "land rover": "land-rover",
  "landrover": "land-rover",
  "mini": "mini",
  "seat": "seat",
  "audi": "audi",
  "bmw": "bmw",
  "lamborghini": "lamborghini",
  "toyota": "toyota",
  "ford": "ford",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MakeLogo({ make, model, size = 44, className = "", alt }: Props) {
  const [svgFailed, setSvgFailed] = useState(false);

  const slug = useMemo(() => {
    if (!make) return null;
    const key = make.trim().toLowerCase();
    if (ALIASES[key]) return ALIASES[key];
    const s = slugify(key);
    return s || null;
  }, [make]);

  const imgSrc = slug ? `/makes/${slug}.svg` : null;

  const initials = useMemo(() => {
    const source = (make || model || "").trim();
    if (!source) return "?";
    return source
      .split(/\s+/)
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [make, model]);

  const ariaLabel = alt ?? (make ? `${make} logo` : "vehicle logo");

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="img"
      aria-label={ariaLabel}
    >
      {imgSrc && !svgFailed ? (
        <img
          src={imgSrc}
          alt={ariaLabel}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          onError={() => setSvgFailed(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7b61ff",
            fontWeight: 800,
            fontSize: Math.max(12, Math.floor(size / 2.6)),
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
