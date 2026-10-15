"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export function ArchifyDiagram() {
  const t = useTranslations("about");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [diagramTheme, setDiagramTheme] = useState<"light" | "dark">("dark");
  const diagramLocale = locale === "zh-TW" || locale === "ja" ? locale : "en";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activeTheme: "light" | "dark" =
        resolvedTheme === "light" ||
        (!resolvedTheme && document.documentElement.classList.contains("light"))
          ? "light"
          : "dark";

      setDiagramTheme(activeTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [resolvedTheme]);

  const diagramPath = `/architecture/kitsunet-homelab.${diagramLocale}.html`;
  const diagramSrc = `${diagramPath}?embed=1&theme=${diagramTheme}`;
  const fullDiagramHref = `${diagramPath}?theme=${diagramTheme}`;

  return (
    <figure aria-labelledby="homelab-architecture-title">
      <figcaption className="mb-4 flex items-center justify-between border-b border-border/70 pb-4">
        <h3
          id="homelab-architecture-title"
          className="text-2xl font-semibold text-foreground"
        >
          {t("architecture_caption")}
        </h3>

        <a
          href={fullDiagramHref}
          target="_blank"
          rel="noreferrer"
          aria-label={t("architecture.open")}
          title={t("architecture.open")}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          >
            <path d="M14 5h5v5" />
            <path d="m19 5-9 9" />
            <path d="M15 3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1" />
          </svg>
          <span className="sr-only">{t("architecture.open")}</span>
        </a>
      </figcaption>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/85 shadow-sm">
        <div className="relative w-full pt-[calc(100%*750/1390+1rem)]">
          <iframe
            title={t("architecture.title")}
            src={diagramSrc}
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0 outline-none focus:outline-none"
          />
        </div>
      </div>
    </figure>
  );
}
