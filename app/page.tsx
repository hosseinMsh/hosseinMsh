import { promises as fs } from "fs"
import path from "path"
import { ReadmePreview } from "@/components/readme-preview"

export default async function Page() {
  let markdown = ""
  try {
    markdown = await fs.readFile(path.join(process.cwd(), "README.md"), "utf-8")
  } catch {
    markdown = "*Profile README not found.*"
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            <span className="text-sm font-semibold">hosseinMsh / README.md</span>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Live preview — theme adapts to dark/light
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-6 md:p-10">
          <ReadmePreview markdown={markdown} />
        </div>

        <section className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">How to use this on your GitHub profile</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Create a repository named exactly the same as your GitHub username (e.g.{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">yourname/yourname</code>).
            </li>
            <li>
              Copy <code className="rounded bg-muted px-1.5 py-0.5">PROFILE_README.md</code> into it as{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">README.md</code>, plus the{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">.github/workflows</code> folder.
            </li>
            <li>
              Push to GitHub. The <strong className="text-foreground">Personalize &amp; Update README</strong> action
              auto-detects your username, rewrites every link and stat card for you, and refreshes your recent activity
              every 6 hours.
            </li>
            <li>
              Run the <strong className="text-foreground">Generate Contribution Snake</strong> workflow once from the
              Actions tab to create the animated snake.
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}
