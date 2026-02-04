"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILES = 10;
const MAX_TOTAL_MB = 20;
const MAX_IMAGE_MB = 1.5;
const MAX_IMAGE_DIMENSION = 1800;

const requestTypeOptions = [
  {
    value: "web",
    label: "WEBサイト",
    desc: "企業サイト・サービスサイトなど",
  },
  {
    value: "lp",
    label: "LP",
    desc: "キャンペーン・広告用のLP",
  },
  {
    value: "ec",
    label: "EC",
    desc: "オンライン販売・Shop系など",
  },
  {
    value: "dx",
    label: "DX関連",
    desc: "業務改善・自動化・仕組み化",
  },
  {
    value: "other",
    label: "その他",
    desc: "要件を相談したい",
  },
] as const;

const requestTypeLabels = {
  web: "WEBサイト",
  lp: "LP",
  ec: "EC",
  dx: "DX関連",
  other: "その他",
} as const;

const UNSPECIFIED_VALUE = "指定なし（提案希望）";

const schema = z.object({
  requestType: z.enum(["web", "lp", "ec", "dx", "other"], {
    required_error: "依頼種別を選択してください",
  }),
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  company: z.string().min(1, "会社名・屋号を入力してください"),
  phone: z.string().optional(),
  industry: z.string().min(1, "業種を入力してください"),
  teamSize: z.string().min(1, "規模を入力してください"),
  currentProcess: z.string().max(4000).optional(),
  currentTools: z.string().max(200).optional(),
  volume: z.string().max(200).optional(),
  stakeholders: z.string().max(200).optional(),
  issues: z.string().max(6000).optional(),
  goals: z.string().max(4000).optional(),
  successMetrics: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  decisionMaker: z.string().optional(),
  constraints: z.string().optional(),
  notes: z.string().optional(),
  websitePurpose: z.string().max(2000).optional(),
  websitePages: z.string().max(2000).optional(),
  websiteCurrentUrl: z.string().max(500).optional(),
  websiteReference: z.string().max(2000).optional(),
  websiteAssets: z.string().max(1000).optional(),
  lpGoal: z.string().max(2000).optional(),
  lpOffer: z.string().max(2000).optional(),
  lpTarget: z.string().max(1000).optional(),
  lpReference: z.string().max(2000).optional(),
  lpAssets: z.string().max(1000).optional(),
  ecProducts: z.string().max(2000).optional(),
  ecPlatform: z.string().max(1000).optional(),
  ecPayments: z.string().max(2000).optional(),
  ecOperations: z.string().max(2000).optional(),
  ecReference: z.string().max(2000).optional(),
  otherRequest: z.string().max(4000).optional(),
  otherGoal: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;
type RequestType = FormValues["requestType"];

type Attachment = {
  file: File;
  originalSize: number;
  compressed: boolean;
};

const typeSpecificFields = {
  web: [
    "websitePurpose",
    "websitePages",
    "websiteCurrentUrl",
    "websiteReference",
    "websiteAssets",
  ],
  lp: ["lpGoal", "lpOffer", "lpTarget", "lpReference", "lpAssets"],
  ec: ["ecProducts", "ecPlatform", "ecPayments", "ecOperations", "ecReference"],
  dx: ["currentProcess", "currentTools", "volume", "stakeholders"],
  other: ["otherRequest", "otherGoal"],
} as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function UnspecifiedButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-medium text-primary/80 underline underline-offset-2 transition hover:text-primary"
    >
      指定なし
    </button>
  );
}

export function DiagnosisForm() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [formError, setFormError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      industry: "",
      teamSize: "",
      currentProcess: "",
      currentTools: "",
      volume: "",
      stakeholders: "",
      issues: "",
      goals: "",
      successMetrics: "",
      budget: "",
      deadline: "",
      decisionMaker: "",
      constraints: "",
      notes: "",
      websitePurpose: "",
      websitePages: "",
      websiteCurrentUrl: "",
      websiteReference: "",
      websiteAssets: "",
      lpGoal: "",
      lpOffer: "",
      lpTarget: "",
      lpReference: "",
      lpAssets: "",
      ecProducts: "",
      ecPlatform: "",
      ecPayments: "",
      ecOperations: "",
      ecReference: "",
      otherRequest: "",
      otherGoal: "",
    },
    mode: "onTouched",
  });

  const requestType = form.watch("requestType") as RequestType | undefined;
  const stepMeta = useMemo(() => {
    const label = requestType ? requestTypeLabels[requestType] : "依頼内容";
    return [
      {
        id: "basic",
        title: "基本情報",
        desc: "連絡先と依頼種別を入力してください。",
      },
      {
        id: "current",
        title: "要件ヒアリング",
        desc: requestType
          ? `${label}の希望や条件を入力してください。`
          : "依頼種別を選ぶと質問が切り替わります。",
      },
      {
        id: "issues",
        title: requestType === "dx" ? "課題と理想" : "目的・ゴール",
        desc:
          requestType === "dx"
            ? "困っている点と、実現したい状態を整理します。"
            : "目的やゴールが未定の場合は空欄でもOKです。",
      },
      {
        id: "constraints",
        title: "制約・補足",
        desc: "制約条件や補足情報、添付ファイルを入力します。",
      },
    ] as const;
  }, [requestType]);

  const step = stepMeta[stepIndex];
  const issueLabel = requestType === "dx" ? "困っていること" : "背景・課題";
  const goalLabel = requestType === "dx" ? "理想の状態" : "目的・ゴール";
  const successLabel =
    requestType === "dx" ? "成功と判断する指標（任意）" : "成功指標（任意）";
  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / stepMeta.length) * 100),
    [stepIndex, stepMeta.length]
  );

  const totalAttachmentSizeMb = useMemo(() => {
    const total = attachments.reduce((sum, item) => sum + item.file.size, 0);
    return total / (1024 * 1024);
  }, [attachments]);

  const allTypeFields = useMemo(
    () => Object.values(typeSpecificFields).flat() as (keyof FormValues)[],
    []
  );

  useEffect(() => {
    if (!requestType) return;
    const allowedFields = new Set(typeSpecificFields[requestType] ?? []);
    allTypeFields.forEach((field) => {
      if (!allowedFields.has(field)) {
        form.setValue(field, "", { shouldDirty: true, shouldValidate: false });
      }
    });
  }, [allTypeFields, form, requestType]);

  const setUnspecified = (field: keyof FormValues) => {
    form.setValue(field, UNSPECIFIED_VALUE, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setFormError("");

    const incoming = Array.from(files);
    if (attachments.length + incoming.length > MAX_FILES) {
      setFormError(`添付は最大${MAX_FILES}件までです。`);
      return;
    }

    setCompressing(true);
    try {
      const processed = await Promise.all(
        incoming.map(async (file) => {
          if (!IMAGE_TYPES.includes(file.type)) {
            return { file, originalSize: file.size, compressed: false };
          }

          const compressedFile = await imageCompression(file, {
            maxSizeMB: MAX_IMAGE_MB,
            maxWidthOrHeight: MAX_IMAGE_DIMENSION,
            useWebWorker: true,
          });

          return {
            file: compressedFile,
            originalSize: file.size,
            compressed: true,
          };
        })
      );

      const nextTotal =
        attachments.reduce((sum, item) => sum + item.file.size, 0) +
        processed.reduce((sum, item) => sum + item.file.size, 0);

      if (nextTotal / (1024 * 1024) > MAX_TOTAL_MB) {
        setFormError(`添付の合計は${MAX_TOTAL_MB}MB以内にしてください。`);
        return;
      }

      setAttachments((prev) => [...prev, ...processed]);
    } catch {
      setFormError("ファイルの処理に失敗しました。");
    } finally {
      setCompressing(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getStepFields = (stepId: string): (keyof FormValues)[] => {
    switch (stepId) {
      case "basic":
        return [
          "name",
          "email",
          "company",
          "phone",
          "industry",
          "teamSize",
          "requestType",
        ];
      case "current":
        return requestType
          ? ([...(typeSpecificFields[requestType] ?? [])] as (keyof FormValues)[])
          : [];
      case "issues":
        return ["issues", "goals", "successMetrics"];
      case "constraints":
        return ["budget", "deadline", "decisionMaker", "constraints", "notes"];
      default:
        return [];
    }
  };

  const goNext = async () => {
    const fields = getStepFields(step.id);
    const isValid = await form.trigger(fields);
    if (!isValid) return;
    setStepIndex((prev) => Math.min(prev + 1, stepMeta.length - 1));
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: FormValues) => {
    setFormError("");

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });
      attachments.forEach((item) => {
        formData.append("files", item.file, item.file.name);
      });

      const response = await fetch("/api/intake", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "送信に失敗しました。");
      }

      const payload = await response.json();
      const id = payload?.id as string | undefined;
      router.push(`/intake/complete${id ? `?id=${encodeURIComponent(id)}` : ""}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "送信に失敗しました。");
    }
  };

  const { formState } = form;

  return (
    <>
      {formState.isSubmitting ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-6 py-5 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium">送信中...</p>
            <p className="text-xs text-muted-foreground">しばらくお待ちください</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border/60 bg-background/70 p-3 shadow-sm surface-card sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-primary/80">相談フォーム</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-2xl">
              {step.title}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{step.desc}</p>
          </div>
        </div>

        <div className="sticky top-3 z-20 -mx-3 mt-3 rounded-2xl border border-border/60 bg-background/95 px-3 py-3 shadow-sm backdrop-blur sm:static sm:mx-0 sm:mt-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">
              ステップ {stepIndex + 1}/{stepMeta.length}
            </p>
            <p className="hidden md:block text-xs font-semibold text-primary/90">{progress}%</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {stepMeta.map((s, index) => (
            <Badge
              key={s.id}
              variant={index === stepIndex ? "default" : "secondary"}
              className={cn("rounded-xl text-[11px] sm:text-xs", index === stepIndex && "bg-primary text-primary-foreground")}
            >
              {index + 1}. {s.title}
            </Badge>
          ))}
        </div>

        <Separator className="my-4 sm:my-6" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:gap-6 [&_[data-slot=label]]:text-xs sm:[&_[data-slot=label]]:text-sm"
        >
          {step.id === "basic" ? (
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">お名前</Label>
                <Input id="name" {...form.register("name")} />
                <FieldError message={formState.errors.name?.message} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" {...form.register("email")} />
                <FieldError message={formState.errors.email?.message} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="company">会社名・屋号</Label>
                <Input id="company" {...form.register("company")} />
                <FieldError message={formState.errors.company?.message} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">電話番号（任意）</Label>
                <Input id="phone" type="tel" {...form.register("phone")} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="industry">業種</Label>
                <Input id="industry" {...form.register("industry")} />
                <FieldError message={formState.errors.industry?.message} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="teamSize">従業員規模</Label>
                <Input id="teamSize" placeholder="例: 1〜5名 / 6〜20名" {...form.register("teamSize")} />
                <FieldError message={formState.errors.teamSize?.message} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>依頼種別</Label>
                <input type="hidden" {...form.register("requestType")} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {requestTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        form.setValue("requestType", option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "rounded-2xl border border-border/60 bg-background/60 p-3 text-left text-xs transition hover:border-primary/40",
                        requestType === option.value &&
                          "border-primary/50 bg-primary/5 text-primary"
                      )}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>
                <FieldError message={formState.errors.requestType?.message} />
              </div>
            </div>
          ) : null}

          {step.id === "current" ? (
            <div className="grid gap-3 sm:gap-4">
              {!requestType ? (
                <p className="text-xs text-muted-foreground">
                  依頼種別を選択すると質問が表示されます。
                </p>
              ) : null}

              {requestType === "dx" ? (
                <>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="currentProcess">対象業務の内容</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("currentProcess")} />
                    </div>
                    <Textarea id="currentProcess" rows={3} {...form.register("currentProcess")} />
                    <FieldError message={formState.errors.currentProcess?.message} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="currentTools">現在使っているツール</Label>
                        <UnspecifiedButton onClick={() => setUnspecified("currentTools")} />
                      </div>
                      <Input id="currentTools" placeholder="例: LINE / Googleスプレッドシート" {...form.register("currentTools")} />
                      <FieldError message={formState.errors.currentTools?.message} />
                    </div>
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="volume">件数・頻度</Label>
                        <UnspecifiedButton onClick={() => setUnspecified("volume")} />
                      </div>
                      <Input id="volume" placeholder="例: 1日30件 / 週100件" {...form.register("volume")} />
                      <FieldError message={formState.errors.volume?.message} />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stakeholders">関わる人数・担当</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("stakeholders")} />
                    </div>
                    <Input id="stakeholders" placeholder="例: 店長1名 + スタッフ2名" {...form.register("stakeholders")} />
                    <FieldError message={formState.errors.stakeholders?.message} />
                  </div>
                </>
              ) : null}

              {requestType === "web" ? (
                <>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websitePurpose">目的・背景</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("websitePurpose")} />
                    </div>
                    <Textarea id="websitePurpose" rows={3} placeholder="例: 問い合わせを増やしたい" {...form.register("websitePurpose")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websitePages">必要ページ・構成</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("websitePages")} />
                    </div>
                    <Textarea id="websitePages" rows={3} placeholder="例: トップ/サービス/実績/お問い合わせ" {...form.register("websitePages")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websiteCurrentUrl">現サイトURL（任意）</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("websiteCurrentUrl")} />
                    </div>
                    <Input id="websiteCurrentUrl" placeholder="https://..." {...form.register("websiteCurrentUrl")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websiteReference">参考サイト（URL可）</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("websiteReference")} />
                    </div>
                    <Textarea id="websiteReference" rows={3} {...form.register("websiteReference")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="websiteAssets">原稿・写真・ロゴの有無</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("websiteAssets")} />
                    </div>
                    <Input id="websiteAssets" placeholder="例: 原稿あり/写真これから" {...form.register("websiteAssets")} />
                  </div>
                </>
              ) : null}

              {requestType === "lp" ? (
                <>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lpGoal">目的・コンバージョン</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("lpGoal")} />
                    </div>
                    <Textarea id="lpGoal" rows={3} placeholder="例: 問い合わせ/資料請求を増やしたい" {...form.register("lpGoal")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lpOffer">商材・サービス内容</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("lpOffer")} />
                    </div>
                    <Textarea id="lpOffer" rows={3} {...form.register("lpOffer")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lpTarget">ターゲット</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("lpTarget")} />
                    </div>
                    <Input id="lpTarget" placeholder="例: 20-30代/法人担当者" {...form.register("lpTarget")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lpReference">参考LP（URL可）</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("lpReference")} />
                    </div>
                    <Textarea id="lpReference" rows={3} {...form.register("lpReference")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lpAssets">原稿・素材の有無</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("lpAssets")} />
                    </div>
                    <Input id="lpAssets" placeholder="例: 原稿あり/画像はこれから" {...form.register("lpAssets")} />
                  </div>
                </>
              ) : null}

              {requestType === "ec" ? (
                <>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ecProducts">商材・商品点数</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("ecProducts")} />
                    </div>
                    <Textarea id="ecProducts" rows={3} placeholder="例: 10商品ほど/定期便あり" {...form.register("ecProducts")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ecPlatform">希望プラットフォーム</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("ecPlatform")} />
                    </div>
                    <Input id="ecPlatform" placeholder="例: Shopify/EC-CUBE/指定なし" {...form.register("ecPlatform")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ecPayments">決済・配送</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("ecPayments")} />
                    </div>
                    <Textarea id="ecPayments" rows={3} placeholder="例: クレカ/代引き/ヤマト配送" {...form.register("ecPayments")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ecOperations">在庫・運用</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("ecOperations")} />
                    </div>
                    <Textarea id="ecOperations" rows={3} placeholder="例: 在庫はスプレッドシート管理" {...form.register("ecOperations")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ecReference">参考サイト（URL可）</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("ecReference")} />
                    </div>
                    <Textarea id="ecReference" rows={3} {...form.register("ecReference")} />
                  </div>
                </>
              ) : null}

              {requestType === "other" ? (
                <>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otherRequest">相談したい内容</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("otherRequest")} />
                    </div>
                    <Textarea id="otherRequest" rows={4} {...form.register("otherRequest")} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otherGoal">目指したい状態</Label>
                      <UnspecifiedButton onClick={() => setUnspecified("otherGoal")} />
                    </div>
                    <Textarea id="otherGoal" rows={3} {...form.register("otherGoal")} />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {step.id === "issues" ? (
            <div className="grid gap-3 sm:gap-4">
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="issues">{issueLabel}</Label>
                  <UnspecifiedButton onClick={() => setUnspecified("issues")} />
                </div>
                <Textarea id="issues" rows={4} {...form.register("issues")} />
                <FieldError message={formState.errors.issues?.message} />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="goals">{goalLabel}</Label>
                  <UnspecifiedButton onClick={() => setUnspecified("goals")} />
                </div>
                <Textarea id="goals" rows={3} {...form.register("goals")} />
                <FieldError message={formState.errors.goals?.message} />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="successMetrics">{successLabel}</Label>
                  <UnspecifiedButton onClick={() => setUnspecified("successMetrics")} />
                </div>
                <Input id="successMetrics" placeholder="例: 対応時間を30%削減" {...form.register("successMetrics")} />
              </div>
            </div>
          ) : null}

          {step.id === "constraints" ? (
            <div className="grid gap-3 sm:gap-4">
              <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="budget">予算感（任意）</Label>
                    <UnspecifiedButton onClick={() => setUnspecified("budget")} />
                  </div>
                  <Input id="budget" placeholder="例: 30万円〜" {...form.register("budget")} />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deadline">希望納期（任意）</Label>
                    <UnspecifiedButton onClick={() => setUnspecified("deadline")} />
                  </div>
                  <Input id="deadline" placeholder="例: 3ヶ月以内" {...form.register("deadline")} />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="decisionMaker">決裁者（任意）</Label>
                    <UnspecifiedButton onClick={() => setUnspecified("decisionMaker")} />
                  </div>
                  <Input id="decisionMaker" placeholder="例: 代表 / 店長" {...form.register("decisionMaker")} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="constraints">制約・注意点（任意）</Label>
                  <UnspecifiedButton onClick={() => setUnspecified("constraints")} />
                </div>
                <Textarea id="constraints" rows={3} {...form.register("constraints")} />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">補足事項（任意）</Label>
                  <UnspecifiedButton onClick={() => setUnspecified("notes")} />
                </div>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="attachments">資料・画像添付（任意）</Label>
                <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
                  <p>画像は自動で軽量化されます。添付条件は後で調整可能です。</p>
                  <p className="mt-1 text-xs">最大 {MAX_FILES} 件 / 合計 {MAX_TOTAL_MB}MB（暫定）</p>
                </div>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="block w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 sm:text-sm sm:file:text-sm"
                />
                {compressing ? (
                  <p className="text-xs text-muted-foreground">画像を軽量化しています...</p>
                ) : null}
              </div>

              {attachments.length > 0 ? (
                <div className="grid gap-2 rounded-2xl border border-border/60 bg-background/70 p-2 sm:p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>添付ファイル {attachments.length} 件</span>
                    <span>合計 {totalAttachmentSizeMb.toFixed(1)}MB</span>
                  </div>
                  <ul className="grid gap-2">
                    {attachments.map((item, index) => (
                      <li
                        key={`${item.file.name}-${index}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.file.name}</p>
                          <p className="text-muted-foreground">
                            {Math.round(item.file.size / 1024)} KB
                            {item.compressed ? " (圧縮済み)" : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => removeAttachment(index)}
                        >
                          削除
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>所要時間目安: 15分以内</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stepIndex > 0 ? (
                <Button type="button" variant="outline" className="rounded-xl" onClick={goBack}>
                  戻る
                </Button>
              ) : null}
              {stepIndex < stepMeta.length - 1 ? (
                <Button type="button" className="rounded-xl" onClick={goNext}>
                  次へ
                </Button>
              ) : (
                <Button type="submit" className="rounded-xl" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? "送信中..." : "送信する"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
