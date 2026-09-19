import type { MenuIcon } from "@/lib/types";

const PATHS: Record<MenuIcon, string> = {
  location:
    "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  gift:
    "M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z M2.5 7.5h19v3.5h-19V7.5Z M12 7.5v13.5 M12 7.5S10.8 3.5 8.4 3.5a2.2 2.2 0 0 0 0 4H12Z M12 7.5s1.2-4 3.6-4a2.2 2.2 0 0 1 0 4H12Z",
  rsvp:
    "M3.5 6.5h17v12h-17v-12Z M3.5 6.5 12 13l8.5-6.5 M8 21l3-3 M16 21l-3-3",
  dresscode:
    "M9 3.5 12 6l3-2.5 M9 3.5 6 6.5l2 2-1.5 12h11L16 8.5l2-2-3-3 M12 6v3.5",
  guide:
    "M4 4.5h6a2.5 2.5 0 0 1 2 2.2 2.5 2.5 0 0 1 2-2.2h6v13h-6a2.5 2.5 0 0 0-2 2.2 2.5 2.5 0 0 0-2-2.2H4v-13Z M12 6.7v13",
  gallery:
    "M3.5 5.5h17v13h-17v-13Z M3.5 15l4.5-4.5 4 4 3-3 5 5",
  heart:
    "M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z",
};

export function MenuIconGlyph({ name }: { name: MenuIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].split(" M").map((segment, index) => (
        <path key={index} d={index === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
}
