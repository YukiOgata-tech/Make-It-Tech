import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";

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
    <section className={cn("py-3 sm:py-16", className)}>
      <Container>
        {(eyebrow || title || description) && (
          <div className="mb-3 sm:mb-10">
            {eyebrow && (
              <p className="text-sm font-medium text-primary/80">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 sm:mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
