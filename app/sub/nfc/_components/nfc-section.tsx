import { cn } from "@/lib/utils";

/**
 * セクション共通レイアウト。
 * 面ではなく罫線で区切り、見出しは計器のラベルのように小さく置く。
 */
export function NfcSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  divide = true,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  divide?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-16 px-5 py-16 sm:px-8 sm:py-24", divide && "nfc-divide", className)}
    >
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || description) && (
          <div className="mb-10 sm:mb-14">
            {eyebrow && <p className="nfc-label">{eyebrow}</p>}
            {title && (
              <h2 className="nfc-display mt-3 text-2xl leading-[1.2] sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p
                className="mt-4 max-w-2xl text-sm leading-relaxed"
                style={{ color: "var(--nfc-dim)" }}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
