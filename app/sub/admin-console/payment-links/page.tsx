import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PaymentLinksManager } from "@/components/admin/payment-links-manager";
import { isStripeLiveMode } from "@/lib/payment-links/config";
import {
  listPaymentOrders,
  paymentSiteOrigin,
  stripeConfigured,
} from "@/lib/payment-links/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "受注・決済リンク",
  robots: { index: false, follow: false },
};
export default async function PaymentLinksPage() {
  const session = await requireAdmin();
  const orders = await listPaymentOrders(session);
  return (
    <AdminPage>
      <PaymentLinksManager
        orders={orders}
        origin={paymentSiteOrigin()}
        configured={stripeConfigured()}
        liveMode={isStripeLiveMode()}
      />
    </AdminPage>
  );
}
