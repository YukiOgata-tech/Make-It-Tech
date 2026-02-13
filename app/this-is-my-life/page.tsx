import type { Metadata } from "next";
import { fetchMyLifeConfig } from "@/lib/my-life-data";
import { MyLifeMessage } from "@/components/sections/my-life-message";

export const metadata: Metadata = {
  title: "This Is My Life",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export const runtime = "nodejs";

export default async function ThisIsMyLifePage() {
  const config = await fetchMyLifeConfig();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.18]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-4xl items-center px-4 py-10 sm:px-6">
        <article className="grid w-full gap-6 rounded-3xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur sm:p-8">
          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Private Page
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              This Is My Life
            </h1>
          </div>

          {config.imageUrl ? (
            <img
              src={config.imageUrl}
              alt="my life cover"
              className="h-56 w-full rounded-2xl object-cover sm:h-72"
            />
          ) : null}

          <MyLifeMessage text={config.message ?? ""} />
        </article>
      </div>
    </div>
  );
}
