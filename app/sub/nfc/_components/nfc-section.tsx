import { cn } from "@/lib/utils";

/**
 * NFCサブドメイン内のセクション共通レイアウト。
 * 見出しの階層と余白をここに集約し、各セクションは中身だけを持つ。
 */
export function NfcSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "base",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** surface は一段明るい面。セクションの区切りを色で示したいときに使う。 */
  tone?: "base" | "surface";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20",
        tone === "surface" && "bg-[#16262b]",
        className
      )}
    >
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || description) && (
          <div className="mb-8 sm:mb-12">
            {eyebrow && (
              <p className="text-xs font-semibold tracking-wide text-[#f2c56b] sm:text-sm">
                -{eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-2 font-heading text-xl font-bold leading-snug tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b0c0c6]">
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
