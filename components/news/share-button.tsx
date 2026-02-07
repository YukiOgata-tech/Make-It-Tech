"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  url: string;
  title?: string;
};

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!canShare) return;
    try {
      await navigator.share({ title, url });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      setShared(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShare ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          {shared ? "共有しました" : "共有する"}
        </Button>
      ) : null}
      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleCopy}>
        {copied ? "コピーしました" : "URLをコピー"}
      </Button>
    </div>
  );
}
