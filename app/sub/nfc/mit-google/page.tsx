import type { Metadata } from "next";
import { MitGoogleExperience } from "../_components/mit-google-experience";

export const metadata: Metadata = {
  title: "Googleレビュー・ショップクーポン",
  description:
    "NFCタップの回数に応じてGoogleレビュー案内とショップクーポンを表示するMake It Techのデモです。",
  alternates: { canonical: "/mit-google" },
  robots: { index: false, follow: false },
};

export default function MitGooglePage() {
  return <MitGoogleExperience />;
}
