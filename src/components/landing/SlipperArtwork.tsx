import {useTranslations} from "next-intl";

export function SlipperArtwork() {
  const t = useTranslations("Artwork");
  return (
    <svg
      viewBox="0 0 620 620"
      role="img"
      aria-labelledby="slipper-title slipper-description"
      className="h-auto w-full"
      fill="none"
    >
      <title id="slipper-title">{t("title")}</title>
      <desc id="slipper-description">{t("description")}</desc>
      <defs>
        <pattern id="knit" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M2 0c8 5 8 13 0 18M16 0c-8 5-8 13 0 18" stroke="#fffdf8" strokeOpacity=".18" strokeWidth="2" />
        </pattern>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#513b32" floodOpacity=".18" />
        </filter>
      </defs>

      <circle cx="310" cy="304" r="255" fill="#f8f1e4" stroke="#c59a50" strokeWidth="2" strokeDasharray="5 11" />
      <circle cx="310" cy="304" r="232" stroke="#922e3a" strokeOpacity=".18" />

      <g opacity=".85">
        <path d="M105 176c27 2 45-8 54-31 9 21 26 32 52 33-23 10-36 27-38 50-13-20-31-30-54-29 16-9 25-17 29-25-15 5-29 6-43 2Z" fill="#254936" />
        <circle cx="166" cy="184" r="11" fill="#922e3a" />
        <circle cx="182" cy="194" r="9" fill="#922e3a" />
        <circle cx="165" cy="202" r="8" fill="#922e3a" />
      </g>

      <g filter="url(#shadow)" transform="rotate(-12 310 310)">
        <path d="M169 209c22-38 81-44 108-9 13 16 13 37 8 58l-27 120c-8 40-32 74-67 94-32 19-72 11-90-19-15-25-7-57 17-74l57-40c18-13 27-36 23-58l-8-42c-2-11-1-21 5-30Z" fill="#922e3a" />
        <path d="M169 209c22-38 81-44 108-9 13 16 13 37 8 58l-27 120c-8 40-32 74-67 94-32 19-72 11-90-19-15-25-7-57 17-74l57-40c18-13 27-36 23-58l-8-42c-2-11-1-21 5-30Z" fill="url(#knit)" />
        <path d="M168 215c23-42 91-47 119-3l-4 48c-31-18-58-19-89-3l-26-42Z" fill="#fffdf8" />
        <path d="M179 223c29 12 63 11 97-3M185 239c28 11 58 10 91-3" stroke="#c59a50" strokeWidth="5" strokeDasharray="2 9" strokeLinecap="round" />
        <path d="M119 411c42 28 88 20 125-18" stroke="#fffdf8" strokeOpacity=".62" strokeWidth="5" strokeDasharray="5 10" strokeLinecap="round" />
        <path d="m212 294 8 13 16-2-10 12 6 15-15-6-12 10 1-16-14-8 16-4 4-14Z" fill="#c59a50" />
      </g>

      <g filter="url(#shadow)" transform="rotate(15 385 345)">
        <path d="M348 210c24-35 82-35 106 1 11 17 9 38 3 58l-39 116c-13 39-40 70-77 87-34 15-73 3-87-29-12-27 0-57 26-71l61-34c20-11 31-32 29-55l-4-43c-1-11 1-21 7-30Z" fill="#254936" />
        <path d="M348 210c24-35 82-35 106 1 11 17 9 38 3 58l-39 116c-13 39-40 70-77 87-34 15-73 3-87-29-12-27 0-57 26-71l61-34c20-11 31-32 29-55l-4-43c-1-11 1-21 7-30Z" fill="url(#knit)" />
        <path d="M347 216c27-39 94-38 118 9l-9 47c-29-21-56-25-89-12l-20-44Z" fill="#fffdf8" />
        <path d="M357 225c28 15 62 17 97-1M361 242c27 14 58 15 91-1" stroke="#c59a50" strokeWidth="5" strokeDasharray="2 9" strokeLinecap="round" />
        <path d="M273 408c39 33 85 30 126-4" stroke="#fffdf8" strokeOpacity=".62" strokeWidth="5" strokeDasharray="5 10" strokeLinecap="round" />
        <path d="M382 296c9 0 16 7 16 16 0 13-16 23-16 23s-16-10-16-23c0-9 7-16 16-16Z" fill="#922e3a" />
      </g>

      <path d="M281 171c24 23 44 52 58 85" stroke="#c59a50" strokeWidth="7" strokeLinecap="round" />
      <path d="M339 256c-2-28 7-56 28-84 11 31 2 56-28 84Z" fill="#c59a50" />
      <path d="M338 257c-31-6-52-22-64-49 32-2 54 14 64 49Z" fill="#d8b36e" />
      <circle cx="339" cy="256" r="10" fill="#922e3a" stroke="#fffdf8" strokeWidth="4" />

      <g fill="#c59a50">
        <path d="m490 133 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" />
        <path d="m115 322 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
        <path d="m492 426 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" />
      </g>
    </svg>
  );
}
