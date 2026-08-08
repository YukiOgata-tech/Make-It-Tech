import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { drinkManagementApp } from "@/content/apps/drink-management";

const navItems = [
  { label: "プライバシーポリシー", href: "/apps/drink-management/privacy" },
  { label: "利用規約", href: "/apps/drink-management/terms" },
  { label: "サポート", href: "/apps/drink-management/support" },
];

export default function DrinkManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-muted-foreground">APP LEGAL</p>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{drinkManagementApp.name}</p>
            <p className="text-xs text-muted-foreground">{drinkManagementApp.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] transition hover:border-primary/50 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="my-6 sm:my-8" />
        {children}
      </div>
    </div>
  );
}
