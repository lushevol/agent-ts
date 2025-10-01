import { PropsWithChildren } from 'react';
import { Github, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Rocket className="h-5 w-5" />
            <span>agent-ts</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://github.com/your-org/agent-ts"
              rel="noreferrer"
              target="_blank"
            >
              <Github className="mr-2 h-4 w-4" />
              Repository
            </a>
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-sm text-muted-foreground">
          <span>Built with Vite, TanStack Router, Tailwind CSS, shadcn/ui, and CopilotKit.</span>
          <span>&copy; {new Date().getFullYear()} Agent TS</span>
        </div>
      </footer>
    </div>
  );
}
