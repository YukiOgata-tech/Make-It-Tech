import { site } from "@/lib/site";

export function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-4 text-[11px] text-muted-foreground sm:px-6 sm:py-6 sm:text-xs lg:px-8">
        <p>© {year} {site.name} Admin Console</p>
        <p>管理画面のURLは共有しないでください</p>
      </div>
    </footer>
  );
}
