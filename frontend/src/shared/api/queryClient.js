import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // errores 4xx (404, 403, 422...) no se reintentan: no se arreglan solos
      retry: (intentos, error) =>
        !(error?.status >= 400 && error?.status < 500) && intentos < 2,
    },
  },
});
