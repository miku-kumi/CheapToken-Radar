import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconDownload = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3.5v10.2" />
    <path d="M7.6 9.6l4.4 4.4 4.4-4.4" />
    <path d="M4.5 15.5v2.6a2.4 2.4 0 0 0 2.4 2.4h10.2a2.4 2.4 0 0 0 2.4-2.4v-2.6" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.2" />
    <path d="M15.2 15.2l5 5" />
  </svg>
);

export const IconCalc = (p: P) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
    <path d="M8 7.6h8" />
    <path d="M8.2 12.2h.01M12 12.2h.01M15.8 12.2h.01M8.2 15.8h.01M12 15.8h.01M15.8 15.8h3.7" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h15" />
    <path d="M13.5 6.5L19 12l-5.5 5.5" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4.5 12.6l4.8 4.9L19.5 6.8" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 4L2.8 19.5h18.4L12 4z" />
    <path d="M12 10v4.2" />
    <path d="M12 17.2h.01" />
  </svg>
);

export const IconLedger = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 3.5h11.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a1.5 1.5 0 0 1 0-3h13.5" />
    <path d="M8.5 8h6M8.5 11.5h4" />
  </svg>
);

export const IconSort = ({ dir, ...p }: P & { dir: "asc" | "desc" | null }) => (
  <svg {...base} {...p}>
    <path d="M8 9.5l4-4 4 4" opacity={dir === "asc" ? 1 : dir === null ? 0.35 : 0.18} />
    <path d="M8 14.5l4 4 4-4" opacity={dir === "desc" ? 1 : dir === null ? 0.35 : 0.18} />
  </svg>
);

export const IconRadar = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" opacity="0.45" />
    <circle cx="12" cy="12" r="4.6" opacity="0.7" />
    <path d="M12 12l6.2-6.2" />
    <path d="M18.2 5.8A8.5 8.5 0 0 1 20.5 12" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4.8 9.2a8 8 0 0 1 13.7-2.5l1.9 2" />
    <path d="M20.4 4.6v4.1h-4.1" />
    <path d="M19.2 14.8a8 8 0 0 1-13.7 2.5l-1.9-2" />
    <path d="M3.6 19.4v-4.1h4.1" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9.2 6.5v11M14.8 6.5v11" strokeWidth="2.4" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8.5 5.8l10 6.2-10 6.2V5.8z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20 12H5" />
    <path d="M10.5 6.5L5 12l5.5 5.5" />
  </svg>
);

export const IconFilter = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.6 2.3 3.9 5.1 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.1-3.9-8.5s1.3-6.2 3.9-8.5z" />
  </svg>
);

export const IconExternal = (p: P) => (
  <svg {...base} {...p}>
    <path d="M13.5 5.5H18a1.5 1.5 0 0 1 1.5 1.5v4.5" />
    <path d="M19 6l-7.5 7.5" />
    <path d="M19 13.8v3.7a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.7" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M6.9 6.9L5.5 5.5" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M20.2 14.2A8.3 8.3 0 0 1 9.8 3.8a8.3 8.3 0 1 0 10.4 10.4z" />
  </svg>
);

export const IconGitHub = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.05.78 2.14v3.17c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

export const IconCurve = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 4.5v15h16" />
    <path d="M6.5 16.5c3.5-.6 4.2-9.6 7.6-10.6 2.6-.8 4.6 1.4 6.4 3.4" />
    <circle cx="10.4" cy="12.6" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="16.9" cy="8" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

/** 獎牌：金／銀／銅／代碼／免費 */
export const Medal = ({ kind, className = "" }: { kind: "gold" | "silver" | "bronze" | "code" | "free"; className?: string }) => {
  const c =
    kind === "gold"
      ? { body: "#eeb02f", rim: "#ffd98a", txt: "#0a1114" }
      : kind === "silver"
        ? { body: "#9ab0ba", rim: "#d3e0e4", txt: "#0a1114" }
        : kind === "bronze"
          ? { body: "#c98a5b", rim: "#e8b48a", txt: "#0a1114" }
          : kind === "code"
            ? { body: "#62c4e4", rim: "#a8e0f2", txt: "#0a1114" }
            : { body: "#4fd598", rim: "#9aebc4", txt: "#0a1114" };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M8.2 2.5h3.1L9 8.6H5.6L8.2 2.5z" fill={c.rim} opacity="0.55" />
      <path d="M15.8 2.5h-3.1L15 8.6h3.4l-2.6-6.1z" fill={c.rim} opacity="0.55" />
      <circle cx="12" cy="14.4" r="7" fill={c.body} />
      <circle cx="12" cy="14.4" r="7" fill="none" stroke={c.rim} strokeWidth="1.4" />
      {kind === "code" ? (
        <path d="M9.6 12.4l-2 2 2 2M14.4 12.4l2 2-2 2" fill="none" stroke={c.txt} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : kind === "free" ? (
        <text x="12" y="17.4" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={c.txt} fontFamily="JetBrains Mono, monospace">
          0
        </text>
      ) : (
        <text x="12" y="17.6" textAnchor="middle" fontSize="9" fontWeight="800" fill={c.txt} fontFamily="JetBrains Mono, monospace">
          {kind === "gold" ? "1" : kind === "silver" ? "2" : "3"}
        </text>
      )}
    </svg>
  );
};
