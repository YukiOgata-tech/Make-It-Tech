export type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

function stripMarkdownInline(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[`~!@#$%^&*()=+[{\]}\\|;:'",.<>/?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "section";
}

function createSlugger() {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count > 0 ? `${base}-${count}` : base;
  };
}

export function buildHeadingSequence(markdown: string): HeadingItem[] {
  if (!markdown) return [];
  const slugger = createSlugger();
  const headings: HeadingItem[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
      } else if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (inFence) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!headingMatch) continue;
    const level = headingMatch[1].length;
    const rawText = headingMatch[2];
    const text = stripMarkdownInline(rawText);
    if (!text) continue;
    headings.push({
      id: slugger(text),
      text,
      level,
    });
  }

  return headings;
}
