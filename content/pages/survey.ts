import {
  Clock3,
  ImageIcon,
  MessageCircleMore,
} from "lucide-react";

export const surveyHighlights = [
  {
    title: "まとまっていなくてOK",
    desc: "「これって相談できる？」のひとことから始められます。",
    icon: MessageCircleMore,
  },
  {
    title: "画像や資料もそのまま",
    desc: "画面のスクショや参考資料を、LINEでそのまま送れます。",
    icon: ImageIcon,
  },
  {
    title: "いつでも送信OK",
    desc: "営業時間外でも送信できます。確認後、順番に返信します。",
    icon: Clock3,
  },
] as const;

export const surveyExamples = [
  "ホームページの文章だけ直せますか？",
  "このExcel作業、もっと楽にできますか？",
  "LINE公式の設定を少し見てほしい",
  "予約や顧客管理をまとめたい",
  "アプリのアイデアを相談したい",
  "何を頼めばいいか分からない",
] as const;

export const surveySteps = [
  {
    title: "友だち追加",
    desc: "ボタンからMake It Techの公式LINEを追加します。",
  },
  {
    title: "ひとこと送信",
    desc: "困っていることを短く送ってください。文章がまとまっていなくても大丈夫です。",
  },
  {
    title: "内容を見て返信",
    desc: "状況を確認し、必要な質問や次にできることをご案内します。",
  },
] as const;

export const surveyFaqs = [
  {
    question: "まだ依頼するか決めていなくても相談できますか？",
    answer:
      "はい。検討段階や「そもそも何が必要か分からない」という状態でも大丈夫です。",
  },
  {
    question: "ちょっとした修正や設定だけでも大丈夫ですか？",
    answer:
      "大丈夫です。Webサイトの一部分、ツールの設定、日々の小さな困りごとなどもご相談ください。",
  },
  {
    question: "すぐに返信されますか？",
    answer:
      "メッセージはいつでも送信できます。返信は平日10:00〜19:00を目安に、確認でき次第お送りします。",
  },
] as const;
