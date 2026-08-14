import Link from "next/link";
import type { IconType } from "react-icons";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { cn } from "@/lib/utils";
import type { StoreLinks } from "@/content/works";

type StoreButton = {
  key: string;
  label: string;
  Icon: IconType;
  href?: string;
};

/**
 * Store badges for a work that ships as an app. Renders nothing when the work
 * has no store presence, so callers can drop it in unconditionally.
 *
 * These are deliberately solid (inverted) buttons: on a card that also links to
 * a website, the store is the primary action and needs to out-weigh the outline
 * buttons around it. The official Apple/Google badge artwork has strict size and
 * clear-space rules, so we use the site's own button shape with the platform
 * mark instead of the supplied badges.
 */
export function StoreButtons({
  links,
  className,
}: {
  links?: StoreLinks;
  className?: string;
}) {
  if (!links) return null;

  const buttons: StoreButton[] = [];
  if (links.ios) {
    buttons.push({ key: "ios", label: "App Store", Icon: SiApple, href: links.ios });
  }
  if (links.android) {
    buttons.push({ key: "android", label: "Google Play", Icon: SiGoogleplay, href: links.android });
  } else if (links.androidComingSoon) {
    buttons.push({ key: "android", label: "Google Play", Icon: SiGoogleplay });
  }

  if (buttons.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {buttons.map(({ key, label, Icon, href }) =>
        href ? (
          <Link
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-foreground px-2.5 text-[10px] font-semibold text-background transition hover:opacity-85 sm:h-10 sm:px-3 sm:text-sm"
          >
            <Icon className="size-3.5 sm:size-4" aria-hidden />
            {label}
          </Link>
        ) : (
          <span
            key={key}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-dashed border-border/70 bg-muted/40 px-2.5 text-[10px] font-semibold text-muted-foreground sm:h-10 sm:px-3 sm:text-sm"
          >
            <Icon className="size-3.5 sm:size-4" aria-hidden />
            {label}
            <span className="rounded-full bg-background/80 px-1.5 py-px text-[9px] font-semibold sm:text-[11px]">
              準備中
            </span>
          </span>
        )
      )}
    </div>
  );
}
