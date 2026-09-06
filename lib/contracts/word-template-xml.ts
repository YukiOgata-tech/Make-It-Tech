function escapeXmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeXmlText(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function getTextNodes(xml: string) {
  const nodes: Array<{ contentStart: number; contentEnd: number; text: string }> = [];
  const pattern = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml))) {
    const contentStart = match.index + match[0].indexOf(">") + 1;
    nodes.push({
      contentStart,
      contentEnd: contentStart + match[1].length,
      text: decodeXmlText(match[1]),
    });
  }
  return nodes;
}

export function replaceWordTextOnce(
  xml: string,
  source: string,
  replacement: string,
  label: string,
  templateName: string
) {
  const nodes = getTextNodes(xml);
  const joined = nodes.map((node) => node.text).join("");
  const firstIndex = joined.indexOf(source);
  if (firstIndex < 0 || joined.indexOf(source, firstIndex + source.length) >= 0) {
    throw new Error(`${templateName}テンプレートの${label}を一意に特定できません。`);
  }

  const sourceEnd = firstIndex + source.length;
  let textOffset = 0;
  const affected: Array<{
    node: (typeof nodes)[number];
    startInNode: number;
    endInNode: number;
  }> = [];
  for (const node of nodes) {
    const nodeStart = textOffset;
    const nodeEnd = nodeStart + node.text.length;
    if (nodeEnd > firstIndex && nodeStart < sourceEnd) {
      affected.push({
        node,
        startInNode: Math.max(0, firstIndex - nodeStart),
        endInNode: Math.min(node.text.length, sourceEnd - nodeStart),
      });
    }
    textOffset = nodeEnd;
  }

  const first = affected[0];
  const last = affected[affected.length - 1];
  if (!first || !last) {
    throw new Error(`${templateName}テンプレートの${label}を置換できません。`);
  }

  const firstReplacement =
    first.node.text.slice(0, first.startInNode) +
    replacement +
    last.node.text.slice(last.endInNode);
  const edits = affected.map(({ node }, index) => ({
    start: node.contentStart,
    end: node.contentEnd,
    value: index === 0 ? escapeXmlText(firstReplacement) : "",
  }));

  let result = xml;
  for (const edit of edits.reverse()) {
    result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
  }
  return result;
}

export function getWordText(xml: string) {
  return getTextNodes(xml).map((node) => node.text).join("");
}

export function formatJapaneseContractDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

export function sanitizeWordFileNamePart(value: string) {
  return value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "契約先";
}
