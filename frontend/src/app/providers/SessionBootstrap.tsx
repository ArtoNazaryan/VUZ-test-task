import { accessTokenRefreshed, refreshAccessToken, sessionExpired } from '@/shared/api/index.ts';
import { type PropsWithChildren, type ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function SessionBootstrap({ children }: PropsWithChildren): ReactElement {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      const session = await refreshAccessToken();

      dispatch(session ? accessTokenRefreshed(session) : sessionExpired());
    };

    void restoreSession();
  }, [dispatch]);

  return <>{children}</>;
}
