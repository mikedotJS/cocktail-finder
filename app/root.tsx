import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import { theme } from "@chakra-ui/pro-theme";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { MetaFunction, LinksFunction } from "@remix-run/node";

import { ServerStyleContext, ClientStyleContext } from "./context";

interface ExtendedSheet extends CSSStyleSheet {
  _insertTag(tag: HTMLElement): void;
}

export const meta: MetaFunction = (): {
  charset: string;
  title: string;
  viewport: string;
}[] => [
  {
    charset: "utf-8",
    title: "New Remix App",
    viewport: "width=device-width,initial-scale=1",
  },
];

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as unknown as ExtendedSheet)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }
);

const _theme = extendTheme(theme);
const extension = {
  colors: { ..._theme.colors, brand: _theme.colors.teal },
};
const extendedTheme = extendTheme(extension, theme);

export default function App() {
  return (
    <Document>
      <ChakraProvider theme={extendedTheme}>
        <Outlet />
      </ChakraProvider>
    </Document>
  );
}
