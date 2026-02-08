"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineButton } from "@/components/ui/line-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MobileDisclosure } from "@/components/mobile-disclosure";
import { cn } from "@/lib/utils";
import type { GlossaryGroup } from "@/content/pages/glossary";
import { ArrowRight, BookOpen, CheckCircle2, FileSearch, Search, X } from "lucide-react";

type GlossaryExplorerProps = {
  groups: GlossaryGroup[];
  diagnosisSteps: readonly string[];
  diagnosisDeliverables: readonly string[];
  lineUrl: string;
};

function normalize(value: string) {
  return value.toLowerCase();
}

export function GlossaryExplorer({
  groups,
  diagnosisSteps,
  diagnosisDeliverables,
  lineUrl,
}: GlossaryExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    groups.forEach((group) => {
      group.terms.forEach((term) => {
        term.tags?.forEach((tag) => tagSet.add(tag));
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ja"));
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const keyword = normalize(query.trim());
    const hasKeyword = keyword.length > 0;

    return groups
      .map((group) => {
        const filteredTerms = group.terms.filter((term) => {
          const matchesTag =
            activeTags.length === 0 ||
            (term.tags ?? []).some((tag) => activeTags.includes(tag));
          if (!matchesTag) return false;
          if (!hasKeyword) return true;
          const haystack = [
            term.term,
            term.reading ?? "",
            term.desc,
            ...(term.details ?? []),
            ...(term.tags ?? []),
          ]
            .map(normalize)
            .join(" ");
          return haystack.includes(keyword);
        });
        return {
          ...group,
          terms: filteredTerms,
        };
      })
      .filter((group) => group.terms.length > 0);
  }, [activeTags, groups, query]);

  const totalTerms = filteredGroups.reduce((sum, group) => sum + group.terms.length, 0);
  const hasFilters = query.trim().length > 0 || activeTags.length > 0;

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const tocItems = filteredGroups.map((group) => ({
    id: group.id,
    title: group.title,
    terms: group.terms,
  }));

  return (
    <div className="mt-4 sm:mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Navigation */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
        <Card className="rounded-3xl gap-1">
          <CardHeader>
            <CardTitle className="text-base">目次</CardTitle>
            {/* <p className="text-sm text-muted-foreground">
              目的の言葉にすぐ移動できます。
            </p> */}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="hidden md:grid md:gap-4">
              <Link href="#business-diagnosis" className="hover:underline">
                業務診断とは
              </Link>
              {tocItems.map((group) => (
                <div key={group.id} className="grid sm:gap-2">
                  <Link href={`#${group.id}`} className="font-medium hover:underline">
                    {group.title}
                  </Link>
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    {group.terms.map((term) => (
                      <Link key={term.id} href={`#${term.id}`} className="hover:underline">
                        {term.term}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <MobileDisclosure summary="目次を開く">
                <div className="grid gap-4">
                  <Link href="#business-diagnosis" className="hover:underline">
                    業務診断とは
                  </Link>
                  {tocItems.map((group) => (
                    <div key={group.id} className="grid gap-2">
                      <Link href={`#${group.id}`} className="font-medium hover:underline">
                        {group.title}
                      </Link>
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        {group.terms.map((term) => (
                          <Link key={term.id} href={`#${term.id}`} className="hover:underline">
                            {term.term}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </MobileDisclosure>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl hidden md:flex flex-col">
          <CardContent className="px-4 sm:p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <p className="text-sm font-medium">業務診断もこちら</p>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              現状把握から推奨IT・見積まで行う診断型の支援です。
            </p>
            <div className="mt-1 sm:mt-4 grid gap-3">
              <LineButton href={lineUrl} size="sm" target="_blank" rel="noreferrer">
                LINEで相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
              </LineButton>
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link href="/contact">お問い合わせ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Content */}
      <main className="space-y-10">
        <div className="rounded-3xl border border-border/60 bg-background/70 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
              <Search className="h-4 w-4 text-muted-foreground" />
              用語検索
              <span className="text-xs font-normal text-muted-foreground">
                {totalTerms}語ヒット
              </span>
            </div>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                <X className="h-3 w-3" />
                クリア
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1 sm:gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例: KPI / RPA / SEO"
              className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 sm:max-w-xs"
            />
          </div>
          <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
            {allTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] transition",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="mt-1 sm:mt-3 sm:hidden">
            <MobileDisclosure summary="タグ候補を表示" className="border-x-0 rounded-none">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] transition",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </MobileDisclosure>
          </div>
        </div>

        <section id="business-diagnosis" className="scroll-mt-24 space-y-6 hidden md:block">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-xl">
                業務診断
              </Badge>
              <Badge variant="outline" className="rounded-xl">
                条件により無料
              </Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              お問い合わせとは違う“診断”の位置づけ
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              業務診断は、現状の詳細把握・推奨ITの提案・概算見積まで行うものです。
              相談やヒアリングだけで終わらず、改善に向けた具体案を整理します。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">お問い合わせ/無料相談</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {["困りごとの共有", "目的や制約の整理", "進め方の提案"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">業務診断</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {[
                    "現状の詳細把握（フロー/担当/ツール）",
                    "課題の構造化と優先順位",
                    "推奨ITと概算見積の提示",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">診断で行うこと</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {diagnosisSteps.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <FileSearch className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">成果物（例）</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="grid gap-2">
                  {diagnosisDeliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  ※ 無料になる条件は案件規模・支援前提・実施形式により異なります。
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-secondary/40 p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <p className="text-sm font-medium">相談はLINEが最速</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  現状の困りごとを共有いただければ、診断の進め方をご案内します。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <LineButton href={lineUrl} target="_blank" rel="noreferrer">
                  LINEで相談 <ArrowRight className="sm:ml-2 h-4 w-4" />
                </LineButton>
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/contact">お問い合わせ</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {filteredGroups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-background/60 px-6 py-2 text-sm text-muted-foreground">
            該当する用語が見つかりませんでした。検索キーワードやタグを変更してください。
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24 space-y-6">
              <div className="py-0">
                <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">- {group.title}</h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{group.desc}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.terms.map((term) => (
                  <Card key={term.id} id={term.id} className="rounded-2xl scroll-mt-24">
                    <CardHeader className="space-y-1 px-4 pt-1 pb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-md">{term.term}</CardTitle>
                        {term.reading ? (
                          <span className="text-[11px] text-muted-foreground">{term.reading}</span>
                        ) : null}
                      </div>
                      {term.tags?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {term.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="rounded-lg px-2 py-0 text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </CardHeader>
                    <CardContent className="px-4 pt-0 text-xs text-muted-foreground">
                      <p className="leading-relaxed">{term.desc}</p>
                      {term.details?.length ? (
                        <ul className="mt-2 grid gap-1.5">
                          {term.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
