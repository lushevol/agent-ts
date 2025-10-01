import { Outlet, createRootRoute } from '@tanstack/react-router';
import { RouterDevtools } from '@tanstack/router-devtools';
import { Layout } from '../ui/layout';

function RootComponent() {
  return (
    <Layout>
      <Outlet />
      <RouterDevtools position="bottom-right" />
    </Layout>
  );
}

export const Route = createRootRoute({
  component: RootComponent
});
