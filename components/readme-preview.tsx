import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

export function ReadmePreview({ markdown }: { markdown: string }) {
  return (
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
