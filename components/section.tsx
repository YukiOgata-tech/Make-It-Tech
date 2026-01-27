import { cn } from "@/lib/utils";
import { Container } from "@/components/container";

export function Section({
  title,
  eyebrow,
  description,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-14 sm:py-18", className)}>
      <Container>
        {(eyebrow || title || description) && (
          <div className="mb-10">
            {eyebrow && (
              <p className="text-sm font-medium text-primary/80">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
