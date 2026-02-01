import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { SiLine } from "react-icons/si";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LineButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  children?: ReactNode;
};

export function LineButton({
  href,
  className,
  size = "default",
  children = "LINEで相談",
  ...linkProps
}: LineButtonProps) {
  return (
    <Button
      asChild
      variant="line"
      size={size}
      className={cn("rounded-xl", className)}
    >
      <Link href={href} {...linkProps}>
        <SiLine aria-hidden="true" />
        {children}
      </Link>
    </Button>
  );
}
