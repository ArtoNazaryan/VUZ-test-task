import { Masthead } from '@/widgets/masthead/index.ts';
import type { ReactElement } from 'react';
import { Outlet } from 'react-router';

export function AppLayout(): ReactElement {
  return (
    <>
      <Masthead />
      <main>
        <Outlet />
      </main>
    </>
  );
}
