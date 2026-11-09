import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { publicPaymentOrder, orderTotal } from "@/lib/payment-links/server";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "ご注文のお支払い",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
const yen = (amount: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(
    amount,
  );
export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { token } = await params;
  const order = await publicPaymentOrder(token);
  const paid = order?.paymentState === "paid";
  const submitted = (await searchParams).submitted === "1";
  const available =
    !submitted && order?.active && order.paymentState === "unpaid";
  return (
    <main className="min-h-dvh bg-[#f6f4f0] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center gap-3">
          <Image src={site.logo} alt="Make It Tech" width={48} height={48} />
          <div>
            <p className="text-lg font-semibold">Make It Tech</p>
            <p className="text-xs tracking-[0.15em] text-slate-500">
              ORDER & PAYMENT
            </p>
          </div>
        </header>
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-semibold tracking-widest text-orange-700">
            ご注文のお支払い
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            {paid
              ? "お支払いを確認しました"
              : order
                ? order.title
                : "このリンクは受付を終了しました"}
          </h1>
          {order ? (
            <>
              {order.liveMode === false ? (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  テスト環境の決済ページです。実際の請求は発生しません。
                </p>
              ) : null}
              <p className="mt-3 text-sm text-slate-500">
                注文番号：{order.orderId}
              </p>
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {order.publicDescription}
              </p>
              <div className="mt-8 divide-y border-y">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {yen(item.unitAmount)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium">
                      {yen(item.unitAmount * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-end justify-between">
                <p className="text-sm text-slate-500">お支払い総額（税込）</p>
                <p className="text-3xl font-semibold">
                  {yen(orderTotal(order))}
                </p>
              </div>
              <p className="mt-2 text-right text-xs text-slate-500">
                ご案内済みの送料・追加費用を含みます
              </p>
              {available && order.stripeUrl ? (
                <a
                  href={order.stripeUrl}
                  rel="noreferrer"
                  className="mt-8 flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  お支払いへ進む
                </a>
              ) : (
                <p
                  role="status"
                  className="mt-8 rounded-xl bg-slate-50 p-4 text-sm leading-6"
                >
                  {paid
                    ? "ありがとうございます。製作・配送については担当者からのご案内をお待ちください。"
                    : submitted || order.paymentState === "processing"
                      ? "お支払いの結果を確認中です。重ねて決済せず、確認のご案内をお待ちください。"
                      : "現在このリンクではお支払いいただけません。担当者へお問い合わせください。"}
                </p>
              )}
              <p className="mt-4 text-xs leading-6 text-slate-500">
                決済はStripeの安全な画面で行います。決済後の入金確認には時間がかかる場合があります。注文番号を添えて担当者までお問い合わせください。
              </p>
            </>
          ) : (
            <p className="mt-5 text-sm leading-7 text-slate-600">
              URLをご確認のうえ、Make It Techの担当者へお問い合わせください。
            </p>
          )}
        </section>
        <footer className="mt-7 flex flex-wrap gap-5 text-xs text-slate-500">
          <span>販売者：Make It Tech</span>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/contact">お問い合わせ</Link>
        </footer>
      </div>
    </main>
  );
}
