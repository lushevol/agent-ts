import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { AgentChat } from '../components/AgentChat';
import { ReviewAgentDemo } from '../components/ReviewAgentDemo';

function IndexPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Agent TS</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Full-stack agent workspace</h1>
        <p className="text-muted-foreground">
          Experiment with the Mastra-powered backend through a CopilotKit chat surface styled with shadcn/ui.
        </p>
      </header>
      <AgentChat />
      <ReviewAgentDemo />
    </section>
  );
}

export const Route = createRoute({
  path: '/',
  getParentRoute: () => RootRoute,
  component: IndexPage
});
