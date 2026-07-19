"use client";

import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";

export function QrCode({
  value,
  logoSrc,
  size = 140,
}: {
  value: string;
  logoSrc?: string;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("qr-code-styling").then(({ default: QRCodeStylingCtor }) => {
      if (cancelled || !containerRef.current) return;

      qrRef.current = new QRCodeStylingCtor({
        width: size,
        height: size,
        type: "svg",
        data: value,
        image: logoSrc,
        margin: 4,
        dotsOptions: { color: "#ffffff", type: "rounded" },
        backgroundOptions: { color: "transparent" },
        cornersSquareOptions: { color: "#ffffff", type: "extra-rounded" },
        cornersDotOptions: { color: "#ffffff" },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: 0.35,
          margin: 4,
          hideBackgroundDots: true,
        },
      });

      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, logoSrc, size]);

  return <div ref={containerRef} className="inline-flex" />;
}
