"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  url: string;
};

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleCopy}>
      {copied ? "コピーしました" : "URLをコピー"}
    </Button>
  );
}
