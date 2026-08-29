"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveNfcLink } from "@/app/sub/admin-console/nfc-links/actions";
import type { NfcLinkFormState } from "@/app/sub/admin-console/nfc-links/actions";

const initialNfcLinkFormState: NfcLinkFormState = {
  status: "idle",
  message: "",
};

type NfcLinkFormProps = {
  slug: string;
  publicUrl: string;
  initialLabel: string;
  initialDestinationUrl: string;
  initialEnabled: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="rounded-xl" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          保存中...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" aria-hidden />
          遷移先を保存
        </>
      )}
    </Button>
  );
}

export function NfcLinkForm({
  slug,
  publicUrl,
  initialLabel,
  initialDestinationUrl,
  initialEnabled,
}: NfcLinkFormProps) {
  const [state, formAction] = useActionState(
    saveNfcLink,
    initialNfcLinkFormState
  );

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="slug" value={slug} />

      <div className="grid gap-2">
        <Label htmlFor="publicUrl">NFCタグに登録する固定URL</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="publicUrl" value={publicUrl} readOnly className="font-mono" />
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              動作確認
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          このURLは固定です。遷移先を変更してもNFCタグの再設定は不要です。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="label">遷移中に表示する名前</Label>
        <Input
          id="label"
          name="label"
          defaultValue={initialLabel}
          placeholder="Googleレビューを開いています"
          maxLength={80}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="destinationUrl">遷移先URL</Label>
        <Input
          id="destinationUrl"
          name="destinationUrl"
          type="url"
          inputMode="url"
          defaultValue={initialDestinationUrl}
          placeholder="https://search.google.com/local/writereview?..."
          maxLength={2048}
          required
        />
        <p className="text-xs text-muted-foreground">
          Googleレビュー、LINE、予約、メニューなど、https:// で始まるURLを登録できます。
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 p-4">
        <input
          name="enabled"
          type="checkbox"
          defaultChecked={initialEnabled}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          <span className="block text-sm font-medium">公開URLを有効にする</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            無効にすると、遷移せず停止中の案内を表示します。
          </span>
        </span>
      </label>

      {state.message ? (
        <p
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
