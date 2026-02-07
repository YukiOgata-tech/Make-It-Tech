import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children?: ReactNode;
};

const articleHeadingPattern = /^第.+条/;

function extractPlainText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement(child)) {
        return extractPlainText(child.props.children as ReactNode);
      }
      return "";
    })
    .join("")
    .trim();
}

export function AppDocsH2({ children, ...props }: HeadingProps) {
  const text = extractPlainText(children);
  if (text && articleHeadingPattern.test(text)) {
    return <h2 {...props}>{`--${text}--`}</h2>;
  }
  return <h2 {...props}>{children}</h2>;
}
