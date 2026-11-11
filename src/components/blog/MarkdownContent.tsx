import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import { sitePath } from '../../sitePath';
export function MarkdownContent({ content }: { content: string }) {
  return <div className="markdown-content"><ReactMarkdown skipHtml urlTransform={url => sitePath(defaultUrlTransform(url))}>{content}</ReactMarkdown></div>;
}
