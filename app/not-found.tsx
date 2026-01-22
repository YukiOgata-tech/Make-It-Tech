import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <Section
      eyebrow="404"
      title="ページが見つかりません"
      description="URLが間違っているか、ページが移動した可能性があります。"
    >
      <Button asChild className="rounded-xl">
        <Link href="/">トップへ戻る</Link>
      </Button>
    </Section>
  );
}
