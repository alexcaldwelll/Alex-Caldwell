import ReactMarkdown from 'react-markdown';
export function MarkdownContent({ content }: { content: string }) {
  return <div className="markdown-content"><ReactMarkdown skipHtml>{content}</ReactMarkdown></div>;
}
