import { MainLayout } from "@/components/layout/main-layout";
import { CookieConsent } from "@/components/layout/cookie-consent";

/**
 * 本体サイト（make-it-tech.com）のページに共通ヘッダー・フッター・
 * Cookieバナーを付ける。
 *
 * このグループ（main）はURLに影響しない。ルートレイアウトで全ページに
 * 被せると、`app/sub/` 配下のサブドメインにもヘッダーが出てしまうため、
 * 本体ページだけをここにまとめている。
 *
 * 以前はルートレイアウトで MainLayout を適用し、パス名で除外していたが、
 * サブドメインは proxy でリライトされるためブラウザ上のパスが `/sub/...`
 * にならず、動的レンダリングのページで除外が効かなかった。
 */
export default function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
      <CookieConsent />
    </MainLayout>
  );
}
