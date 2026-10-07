export function AirbnbLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 312" fill="#FF385C" aria-label="airbnb">
      <path d="M155.7 0C92.3 0 48.7 34.8 48.7 85.6c0 25.6 11.5 47.3 32.3 61.9-24.4 11.2-39 32.3-39 57.9 0 41.2 35.6 70 86.5 70 15.4 0 30.2-3.2 43.1-9 12.9 5.8 27.7 9 43.1 9 50.9 0 86.5-28.8 86.5-70 0-25.6-14.6-46.7-39-57.9 20.8-14.6 32.3-36.3 32.3-61.9C294.5 34.8 250.9 0 187.5 0h-31.8z" opacity="0" />
      <path d="M260.2 233.8c-4.1-9.3-8.6-18.9-13.4-28.1-15.5-30.6-32.2-61.3-49.7-91.5l-1.8-3.1c-6.5-11.4-13.2-23.2-24.3-30.2-5.7-3.6-12.2-5.5-18.9-5.5s-13.2 1.9-18.9 5.5c-11.1 7-17.8 18.8-24.3 30.2l-1.8 3.1c-17.5 30.2-34.2 60.9-49.7 91.5-4.8 9.2-9.3 18.8-13.4 28.1-5.5 12.5-9.9 23.8-9.9 35.6 0 24.3 19.8 44.1 44.1 44.1 13.7 0 27.4-5.9 41.4-17.9 8.2-7 16.6-16.1 25.9-28.1l6.6-8.4 6.6 8.4c9.3 12 17.7 21.1 25.9 28.1 14 12 27.7 17.9 41.4 17.9 24.3 0 44.1-19.8 44.1-44.1 0-11.8-4.4-23.1-9.9-35.6zm-108.1-16.5c-8.2-10.7-14.1-20.2-18.3-29.3-4.2-9.2-6.2-17-6.2-24.1 0-13.5 11-24.5 24.5-24.5s24.5 11 24.5 24.5c0 7.1-2 14.9-6.2 24.1-4.2 9.1-10.1 18.6-18.3 29.3z" />
      <text x="330" y="235" fontSize="215" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" fill="#FF385C">
        airbnb
      </text>
    </svg>
  );
}

export const SearchIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={4}>
    <circle cx="13" cy="13" r="9" />
    <path d="m27 27-7.5-7.5" strokeLinecap="round" />
  </svg>
);

export const MenuIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M2 8h28M2 16h28M2 24h28" strokeLinecap="round" />
  </svg>
);

export const UserIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 2a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 20.5a11.4 11.4 0 0 1-8.2-3.4c.6-2.6 4.2-4.6 8.2-4.6s7.6 2 8.2 4.6a11.4 11.4 0 0 1-8.2 3.4z" />
  </svg>
);

export const GlobeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="16" cy="16" r="14" />
    <path d="M2 16h28M16 2c4 4.5 6 9.5 6 14s-2 9.5-6 14c-4-4.5-6-9.5-6-14s2-9.5 6-14z" />
  </svg>
);

export const HeartIcon = ({
  className = "h-6 w-6",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill={filled ? "#FF385C" : "rgba(0,0,0,0.5)"}
    stroke="white"
    strokeWidth={2}
  >
    <path d="M16 28c7-4.7 14-10.6 14-17.1C30 6.8 27.1 4 23.5 4c-3 0-5.3 1.8-7.5 4.5C13.8 5.8 11.5 4 8.5 4 4.9 4 2 6.8 2 10.9 2 17.4 9 23.3 16 28z" />
  </svg>
);

export const StarIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16 1.8 20.7 11l10.2 1.5-7.4 7.2 1.8 10.2L16 25.1 6.7 29.9 8.5 19.7 1.1 12.5 11.3 11z" />
  </svg>
);

export const ShareIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path d="M27 18v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9M16 3v20M16 3l-7 7M16 3l7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronLeft = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={4}>
    <path d="M20 28 8 16 20 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={4}>
    <path d="m12 4 12 12-12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="m6 6 20 20M26 6 6 26" strokeLinecap="round" />
  </svg>
);

export const FilterIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M5 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM6.5 5H14M1 5h1.5M11 12.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12.5 11H14M1 11h8.5" strokeLinecap="round" />
  </svg>
);

export const MedalIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2 9.1 7.9 2.6 8.8l4.7 4.5-1.1 6.4L12 16.7l5.8 3-1.1-6.4 4.7-4.5-6.5-.9z" />
  </svg>
);
