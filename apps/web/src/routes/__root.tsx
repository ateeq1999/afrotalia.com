import { Toaster } from "@afrotalia/ui/components/sonner";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "../components/header";
import WebFooter from "../components/web/WebFooter";
import { getCmsBlocks } from "../functions/cms";
import { getUser } from "../functions/get-user";

import appCss from "../index.css?url";

export interface RouterAppContext {}

const META_SLUGS = ["meta.title", "meta.description", "footer.tagline"];

const DEFAULT_TITLE = "Afrotalia International Ltd";
const DEFAULT_DESCRIPTION = "A Tanzanian trading company.";

export const Route = createRootRouteWithContext<RouterAppContext>()({
  loader: async () => {
    const [session, cms] = await Promise.all([getUser(), getCmsBlocks({ data: { slugs: META_SLUGS } })]);
    return {
      signedIn: Boolean(session),
      title: cms["meta.title"]?.body ?? DEFAULT_TITLE,
      description: cms["meta.description"]?.body ?? DEFAULT_DESCRIPTION,
      footerTagline: cms["footer.tagline"]?.body ?? null,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.title ?? DEFAULT_TITLE },
      { name: "description", content: loaderData?.description ?? DEFAULT_DESCRIPTION },
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
  const { signedIn, footerTagline } = Route.useLoaderData();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-white">
        <div className="grid min-h-svh grid-rows-[auto_1fr_auto] bg-white">
          <Header signedIn={signedIn} />
          <Outlet />
          <WebFooter tagline={footerTagline} />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
