import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotTextarea } from '@copilotkit/react-textarea';
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
    <CopilotKit runtimeUrl={import.meta.env.VITE_COPILOTKIT_RUNTIME_URL ?? '/api/copilot'}>
      <RouterProvider router={router} />
    </CopilotKit>
  </StrictMode>
);
