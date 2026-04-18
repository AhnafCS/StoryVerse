const StoryVerseLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Book + Coffee icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-3 opacity-80"
      >
        {/* Coffee steam */}
        <path
          d="M28 8C28 8 30 4 32 8C34 12 36 8 36 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-lavender"
        />
        <path
          d="M24 12C24 12 26 8 28 12C30 16 32 12 32 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-lavender"
          opacity="0.6"
        />
        {/* Cup */}
        <path
          d="M22 18H42V30C42 34.4183 38.4183 38 34 38H30C25.5817 38 22 34.4183 22 30V18Z"
          fill="currentColor"
          className="text-lavender"
          opacity="0.3"
        />
        <path
          d="M42 22H46C48.2091 22 50 23.7909 50 26V26C50 28.2091 48.2091 30 46 30H42"
          stroke="currentColor"
          strokeWidth="2"
          className="text-lavender"
        />
        {/* Saucer */}
        <ellipse cx="32" cy="40" rx="16" ry="3" fill="currentColor" className="text-lavender" opacity="0.4" />
        {/* Books */}
        <rect x="14" y="44" width="36" height="6" rx="1" fill="currentColor" className="text-cream" opacity="0.5" />
        <rect x="16" y="50" width="32" height="5" rx="1" fill="currentColor" className="text-lavender" opacity="0.4" />
        <rect x="12" y="55" width="40" height="5" rx="1" fill="currentColor" className="text-cream" opacity="0.3" />
      </svg>

      {/* Title */}
      <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight text-cream">
        <span className="italic">Story</span>
        <br />
        <span className="italic">Verse</span>
      </h1>

      {/* Tagline */}
      <p className="mt-3 text-xs md:text-sm tracking-[0.25em] uppercase text-lavender font-body">
        ai-driven narrative & character
        <br />
        intelligence platform
      </p>
    </div>
  );
};

export default StoryVerseLogo;
