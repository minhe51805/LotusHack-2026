import { cn } from "@/lib/utils";

type SourceHtmlProps = {
  html: string;
  className?: string;
};

export function SourceHtml({ html, className }: SourceHtmlProps) {
  if (!html) {
    return null;
  }

  return <div className={cn("source-html", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
