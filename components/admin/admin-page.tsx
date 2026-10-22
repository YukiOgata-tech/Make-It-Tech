import { cn } from "@/lib/utils";

type AdminPageProps = React.ComponentProps<"div">;

export function AdminPage({ className, ...props }: AdminPageProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}
      {...props}
    />
  );
}
