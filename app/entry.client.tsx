import React, { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";

import createEmotionCache, { defaultCache } from "./createEmotionCache";
import { ClientStyleContext } from "./context";

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(defaultCache);

  function reset() {
    setCache(createEmotionCache());
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

hydrateRoot(
  document,
  <ClientCacheProvider>
    <RemixBrowser />
  </ClientCacheProvider>
);
