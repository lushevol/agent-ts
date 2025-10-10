import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTrpcClient, trpc } from '@agent-ts/web';
import { routeTree } from './router';
import './index.css';

const router = createRouter({
  routeTree,
  context: {
    copilot: {
      component: CopilotTextarea
    }
  }
});

const queryClient = new QueryClient();
const trpcClient = createTrpcClient({
  url: import.meta.env.VITE_TRPC_URL ?? '/api/trpc'
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CopilotKit runtimeUrl={import.meta.env.VITE_COPILOTKIT_RUNTIME_URL ?? '/api/copilot'}>
          <RouterProvider router={router} />
        </CopilotKit>
      </QueryClientProvider>
    </trpc.Provider>
  </StrictMode>
);
