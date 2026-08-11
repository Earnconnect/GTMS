import Link from "next/link";

/**
 * GTMS brand lockup: the emblem (from /public/gtms-logo.png, framed on its
 * native black background) + the wordmark.
 *
 * The background-size / position values crop the wide source image down to just
 * the emblem on the left. If the emblem looks off-centre, tweak `EMBLEM` below.
 */
const EMBLEM: React.CSSProperties = {
  backgroundImage: "url('/gtms-logo.png')",
  backgroundColor: "#0d9488", // graceful fallback (teal) until the file is added
  backgroundRepeat: "no-repeat",
  backgroundSize: "154px 102px", // source (1536x1024) scaled to ~0.1
  backgroundPosition: "-13px -30px", // shift to the emblem on the left
};

export function BrandLogo({
  light = false,
  showText = true,
  href = "/",
}: {
  light?: boolean;
  showText?: boolean;
  href?: string | null;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <span
        style={EMBLEM}
        aria-label="GTMS"
        className="block h-9 w-9 shrink-0 rounded-lg shadow-sm ring-1 ring-white/10"
      />
      {showText && (
        <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
          GTMS
        </span>
      )}
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
