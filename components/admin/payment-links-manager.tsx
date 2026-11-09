"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { orderTotal, type PaymentOrder } from "@/lib/payment-links/domain";

const yen = (amount: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
    amount,
  );
const stateLabels = {
  draft: "下書き",
  issuing: "発行処理中・再試行可",
  issued: "発行済み",
  deleting: "停止処理中・再試行可",
  deleted: "削除済み",
};
const paymentLabels = {
  unpaid: "未入金",
  processing: "決済確認中",
  failed: "決済失敗",
  paid: "入金済み",
};
type Props = {
  orders: PaymentOrder[];
  origin: string;
  configured: boolean;
  liveMode: boolean;
};

export function PaymentLinksManager({
  orders,
  origin,
  configured,
  liveMode,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PaymentOrder>();
  const [showDeleted, setShowDeleted] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState<{
    order: PaymentOrder;
    action: "issue" | "delete";
  }>();
  const [dialogError, setDialogError] = useState("");
  async function act(order: PaymentOrder, action: "issue" | "delete" | "sync") {
    setBusy(order.id);
    setMessage("");
    setDialogError("");
    try {
      const response = await fetch(`/api/admin/payment-links/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          confirmLive: action === "issue" && liveMode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setConfirm(undefined);
      setMessage(
        action === "issue"
          ? "決済リンクを発行しました。顧客用URLをコピーしてご案内ください。"
          : action === "delete"
            ? "リンクを停止し、一覧から削除しました。"
            : "Stripeの状態を照合しました。",
      );
      router.refresh();
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "処理に失敗しました。";
      setMessage(text);
      setDialogError(text);
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary">
            顧客対応 / NFC受注
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-2xl font-semibold sm:text-3xl">
            <CreditCard className="size-7" />
            受注・決済リンク
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            承認した注文の決済リンクを発行し、入金状況を確認します。
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowForm(!showForm);
          }}
        >
          <Plus className="size-4" />
          注文を登録
        </Button>
      </header>
      <div className="rounded-2xl border bg-card p-4 text-sm leading-6">
        <p className="font-medium">
          {configured
            ? liveMode
              ? "本番環境：発行したリンクから実際の決済が可能です"
              : "テスト環境：テスト用の商品を使用してください"
            : "Stripe未設定：注文の下書き保存を利用できます"}
        </p>
        <p className="mt-1 text-muted-foreground">
          既存のStripe商品を再利用し、注文ごとに1回限りのリンクを発行します。税込総額に送料・制作費を含め、追加の税・送料は加算しません。入金状況はWebhookで更新します。
        </p>
      </div>
      {message ? (
        <p role="status" className="rounded-xl border bg-muted/40 p-4 text-sm">
          {message}
        </p>
      ) : null}
      {showForm ? (
        <OrderForm
          key={editing?.id || "new"}
          order={editing}
          configured={configured}
          onSaved={() => {
            setShowForm(false);
            setEditing(undefined);
            setMessage(
              "下書きを保存しました。内容を確認してリンクを発行してください。",
            );
            router.refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : null}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          注文一覧{" "}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {orders.filter((order) => order.state !== "deleted").length}件
          </span>
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(event) => setShowDeleted(event.target.checked)}
          />
          削除済みも表示
        </label>
      </div>
      <div className="space-y-4">
        {orders
          .filter((order) => showDeleted || order.state !== "deleted")
          .map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-3 py-1">
                      {stateLabels[order.state]}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 ${order.paymentState === "paid" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted"}`}
                    >
                      {paymentLabels[order.paymentState]}
                    </span>
                    {order.linkId ? (
                      <span className="rounded-full border px-3 py-1">
                        {order.liveMode ? "本番" : "テスト"}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{order.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.orderId} · {order.customerName || "顧客名未登録"}
                    {order.salesperson ? ` · 営業：${order.salesperson}` : ""}
                  </p>
                </div>
                <p className="text-2xl font-semibold">
                  {yen(orderTotal(order))}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    税込
                  </span>
                </p>
              </div>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  注文内容・確認記録
                </summary>
                <div className="mt-3 space-y-3 rounded-xl bg-muted/40 p-4">
                  <p className="whitespace-pre-wrap">
                    {order.publicDescription}
                  </p>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <p>
                        {item.title} · {item.quantity}点 · 単価
                        {yen(item.unitAmount)}
                      </p>
                      <p className="text-xs leading-6 text-muted-foreground">
                        {item.specification}
                        <br />
                        Stripe: {item.productId} / Shopify:{" "}
                        {item.shopifyProductId} / variant: {item.variantId} /
                        SKU: {item.sku || "—"}
                        <br />
                        見積時EC単価: {yen(item.baselineUnitAmount)}（
                        {order.quotedAt}）
                      </p>
                      <a
                        className="text-primary underline"
                        href={item.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        見積時の価格証跡
                      </a>
                    </div>
                  ))}
                  {order.internalMemo ? (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      管理メモ：{order.internalMemo}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {order.linkId || "未発行"}
                    {order.paidAt
                      ? ` / 入金確認: ${new Date(order.paidAt).toLocaleString("ja-JP")}`
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stripeで表示する商品名・画像は、選択した既存商品の登録内容を使用します。
                  </p>
                </div>
              </details>
              {order.paymentState === "paid" ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {order.liveMode === false
                    ? "テスト決済のため売上には転記しません。"
                    : order.saleId
                      ? "売上下書きを作成しました。計上日・税額を確認して売上を確定してください。入金証跡はこの注文と売上メモに保存しています。"
                      : order.salesSyncError
                        ? "入金確認済みですが、売上への転記に失敗しました。入金照合から再試行できます。"
                        : "売上への転記を処理中です。"}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {order.saleId ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/sub/admin-console/sales/${order.saleId}`}>
                      売上記録を開く
                    </Link>
                  </Button>
                ) : null}
                {order.state !== "issued" &&
                order.linkId &&
                order.paymentState === "paid" &&
                order.liveMode &&
                !order.saleId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!configured || Boolean(busy)}
                    onClick={() => act(order, "sync")}
                  >
                    入金照合・売上転記を再試行
                  </Button>
                ) : null}
                {order.state === "draft" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      setEditing(order);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    編集
                  </Button>
                ) : null}
                {["draft", "issuing"].includes(order.state) ? (
                  <Button
                    size="sm"
                    disabled={!configured || Boolean(busy)}
                    onClick={() => {
                      setDialogError("");
                      setConfirm({ order, action: "issue" });
                    }}
                  >
                    リンクを発行{order.state === "issuing" ? "・再試行" : ""}
                  </Button>
                ) : null}
                {order.state === "issuing" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!configured || Boolean(busy)}
                    onClick={() => act(order, "sync")}
                  >
                    Stripe上の発行結果を照合
                  </Button>
                ) : null}
                {order.state === "issued" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${origin}/pay/${order.publicToken}`,
                          );
                          setMessage("顧客用URLをコピーしました。");
                        } catch {
                          setMessage(
                            "コピーできませんでした。顧客用ページを開いてURLをコピーしてください。",
                          );
                        }
                      }}
                    >
                      <Copy className="size-4" />
                      顧客用URLをコピー
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`${origin}/pay/${order.publicToken}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        顧客用ページ
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!configured || Boolean(busy)}
                      onClick={() => act(order, "sync")}
                    >
                      <RefreshCw className="size-4" />
                      入金照合
                    </Button>
                  </>
                ) : null}
                {!["deleted", "issuing"].includes(order.state) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      setDialogError("");
                      setConfirm({ order, action: "delete" });
                    }}
                  >
                    <Trash2 className="size-4" />
                    {order.state === "deleting" ? "停止・削除を再試行" : "削除"}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        {!orders.some((order) => showDeleted || order.state !== "deleted") ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            注文はまだありません。「注文を登録」から下書きを作成できます。
          </div>
        ) : null}
      </div>
      <AdminConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) setConfirm(undefined);
        }}
        title={
          confirm?.action === "issue"
            ? liveMode
              ? "本番の決済リンクを発行しますか？"
              : "テスト決済リンクを発行しますか？"
            : "決済リンクを停止・削除しますか？"
        }
        description={
          confirm?.action === "issue"
            ? `${confirm.order.orderId} / ${yen(orderTotal(confirm.order))}（税込）。承認済みの内容で発行します。発行後の金額変更はできません。${liveMode ? "顧客が支払うと実際に請求されます。" : "テスト環境で発行します。"}`
            : "顧客用ページとStripeリンクを停止し、開いている決済セッションも終了します。削除後も入金・注文の記録は保存されます。支払い済みの取引は返金されません。"
        }
        confirmLabel={
          busy
            ? "処理中…"
            : confirm?.action === "issue"
              ? "確認して発行"
              : "停止して削除"
        }
        busy={Boolean(busy)}
        error={dialogError}
        tone={confirm?.action === "issue" ? "caution" : "danger"}
        onConfirm={() => {
          if (confirm) void act(confirm.order, confirm.action);
        }}
      />
    </div>
  );
}

function OrderForm({
  order,
  configured,
  onSaved,
  onCancel,
}: {
  order?: PaymentOrder;
  configured: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [rows, setRows] = useState(
    () => order?.items.map((_, index) => index) || [0],
  );
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [total, setTotal] = useState(order ? orderTotal(order) : 0);
  function calculate(form: HTMLFormElement) {
    const data = new FormData(form);
    setTotal(
      rows.reduce(
        (sum, row) =>
          sum +
          Number(data.get(`amount-${row}`) || 0) *
            Number(data.get(`quantity-${row}`) || 0),
        0,
      ),
    );
  }
  async function loadProducts() {
    setLoadingProducts(true);
    setError("");
    try {
      const response = await fetch("/api/admin/payment-links/products");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProducts(data.products);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "商品を取得できません。",
      );
    } finally {
      setLoadingProducts(false);
    }
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const str = (name: string) => String(data.get(name) || "");
    const body = {
      orderId: str("orderId"),
      title: str("title"),
      customerName: str("customerName"),
      salesperson: str("salesperson"),
      quotedAt: str("quotedAt"),
      internalMemo: str("internalMemo"),
      publicDescription: str("publicDescription"),
      collectShipping: data.has("collectShipping"),
      approved: data.has("approved"),
      items: rows.map((row) => ({
        title: str(`title-${row}`),
        productId: str(`product-${row}`),
        shopifyProductId: str(`shopify-${row}`),
        variantId: str(`variant-${row}`),
        sku: str(`sku-${row}`),
        specification: str(`spec-${row}`),
        evidenceUrl: str(`evidence-${row}`),
        baselineUnitAmount: Number(str(`baseline-${row}`)),
        unitAmount: Number(str(`amount-${row}`)),
        quantity: Number(str(`quantity-${row}`)),
      })),
    };
    try {
      const response = await fetch(
        order
          ? `/api/admin/payment-links/${order.id}`
          : "/api/admin/payment-links",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order ? { action: "save", input: body } : body),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onSaved();
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存できません。");
    } finally {
      setBusy(false);
    }
  }
  const field = (
    label: string,
    name: string,
    value = "",
    required = true,
    type = "text",
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        required={required}
        type={type}
        readOnly={name === "orderId" && Boolean(order)}
        maxLength={name === "orderId" ? 80 : undefined}
      />
    </div>
  );
  return (
    <form
      onSubmit={save}
      onChange={(event) => calculate(event.currentTarget)}
      className="space-y-6 rounded-2xl border bg-card p-5 sm:p-7"
    >
      <div>
        <h2 className="text-lg font-semibold">
          {order ? "注文の下書きを編集" : "注文の下書きを作成"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Shopifyの商品・見積時点の価格を確認し、承認済みの請求内容を登録してください。営業担当・顧客名・管理メモは顧客用ページに表示しません。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("MIT注文ID", "orderId", order?.orderId)}
        {field("顧客向けの注文タイトル", "title", order?.title)}
        {field("顧客名（管理用）", "customerName", order?.customerName, false)}
        {field(
          "営業担当者（管理用）",
          "salesperson",
          order?.salesperson,
          false,
        )}
        {field("見積日", "quotedAt", order?.quotedAt, true, "date")}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">商品明細</h3>
        <Button
          variant="outline"
          type="button"
          disabled={!configured || loadingProducts}
          onClick={loadProducts}
        >
          {loadingProducts ? "取得中…" : "Stripeの既存商品を取得"}
        </Button>
      </div>
      {rows.map((row, index) => {
        const item = order?.items[row];
        return (
          <fieldset key={row} className="rounded-xl border p-4">
            <legend className="px-2 text-sm font-medium">
              明細 {index + 1}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("顧客向けの商品名", `title-${row}`, item?.title)}
              <div className="grid gap-2">
                <Label htmlFor={`product-${row}`}>既存Stripe Product ID</Label>
                <Input
                  id={`product-${row}`}
                  name={`product-${row}`}
                  defaultValue={item?.productId}
                  placeholder="prod_…"
                  list="stripe-products"
                  required
                />
                <datalist id={index === 0 ? "stripe-products" : undefined}>
                  {index === 0
                    ? products.map((product) => (
                        <option value={product.id} key={product.id}>
                          {product.name}
                        </option>
                      ))
                    : null}
                </datalist>
              </div>
              {field("Shopify商品ID", `shopify-${row}`, item?.shopifyProductId)}
              {field("Shopify variant ID", `variant-${row}`, item?.variantId)}
              {field("SKU（任意）", `sku-${row}`, item?.sku, false)}
              {field(
                "型・色・デザイン・NFC設定などの仕様",
                `spec-${row}`,
                item?.specification,
              )}
              {field(
                "見積時のEC価格証跡URL（保存済み資料など）",
                `evidence-${row}`,
                item?.evidenceUrl,
                true,
                "url",
              )}
              <div className="grid gap-2">
                <Label htmlFor={`baseline-${row}`}>
                  見積時EC単価（税込・円）
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="9999999"
                  step="1"
                  id={`baseline-${row}`}
                  name={`baseline-${row}`}
                  defaultValue={item?.baselineUnitAmount}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`amount-${row}`}>
                  承認した請求単価（税込・円）
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="9999999"
                  step="1"
                  id={`amount-${row}`}
                  name={`amount-${row}`}
                  defaultValue={item?.unitAmount}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`quantity-${row}`}>数量</Label>
                <Input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  id={`quantity-${row}`}
                  name={`quantity-${row}`}
                  defaultValue={item?.quantity || 1}
                  required
                />
              </div>
            </div>
            {rows.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={(event) => {
                  const next = rows.filter((value) => value !== row);
                  const form = event.currentTarget.form;
                  if (form) {
                    const data = new FormData(form);
                    setTotal(
                      next.reduce(
                        (sum, key) =>
                          sum +
                          Number(data.get(`amount-${key}`) || 0) *
                            Number(data.get(`quantity-${key}`) || 0),
                        0,
                      ),
                    );
                  }
                  setRows(next);
                }}
              >
                この明細を削除
              </Button>
            ) : null}
          </fieldset>
        );
      })}
      <Button
        type="button"
        variant="outline"
        disabled={rows.length >= 20}
        onClick={() => setRows([...rows, Math.max(...rows) + 1])}
      >
        <Plus className="size-4" />
        明細を追加
      </Button>
      <div className="grid gap-2">
        <Label htmlFor="publicDescription">顧客に表示する説明・取引条件</Label>
        <textarea
          className="admin-field min-h-32 w-full rounded-xl border bg-background p-3 text-sm"
          id="publicDescription"
          name="publicDescription"
          maxLength={2000}
          defaultValue={order?.publicDescription}
          required
          placeholder="ご注文の商品・仕様、納期、送料、キャンセル・返品条件など、ご案内済みの条件を記載してください。"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="internalMemo">
          管理メモ・価格承認の記録（顧客には非表示）
        </Label>
        <textarea
          className="admin-field min-h-24 w-full rounded-xl border bg-background p-3 text-sm"
          id="internalMemo"
          name="internalMemo"
          maxLength={3000}
          defaultValue={order?.internalMemo}
        />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="collectShipping"
          defaultChecked={order?.collectShipping ?? true}
          className="mt-1"
        />
        決済画面で日本国内の配送先を収集する
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="approved" required className="mt-1" />
        商品ID・variant・見積時EC価格・請求額・数量・送料や制作費の二重加算がないこと・取引条件を確認し、この注文を承認しました。
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
        <p className="text-sm">
          請求総額（税込）{" "}
          <strong className="ml-3 text-xl">{yen(total)}</strong>
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            閉じる
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "保存中…" : "下書きを保存"}
          </Button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
