import { Toaster } from "@afrotalia/ui/components/sonner";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/header";
import WebFooter from "../components/web/WebFooter";
import { getUser } from "../functions/get-user";

import appCss from "../index.css?url";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  loader: async () => {
    const session = await getUser();
    return { signedIn: Boolean(session) };
  },
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
        title: "Afrotalia — Your reliable partner in Tanzania",
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
  const { signedIn } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white">
        <div className="grid min-h-svh grid-rows-[auto_1fr_auto] bg-white">
          <Header signedIn={signedIn} />
          <Outlet />
          <WebFooter />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
