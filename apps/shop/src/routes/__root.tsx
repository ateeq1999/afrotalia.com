import { Toaster } from "@afrotalia/ui/components/sonner";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/header";
import { getShopHeaderContext } from "../functions/shop-context";

import appCss from "../index.css?url";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  loader: () => getShopHeaderContext(),
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Afrotalia Shop",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  const context = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white">
        <div className="grid min-h-svh grid-rows-[auto_1fr] bg-white">
          <Header context={context} />
          <Outlet />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
