import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center px-3 py-10 sm:min-h-[60vh] sm:px-4 sm:py-12">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>回答詳細を読み込み中...</span>
      </div>
    </div>
  );
}
