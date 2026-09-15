import type { ShopHeaderContext } from "@/functions/shop-context";

import ShopHeader from "./shop/ShopHeader";

export default function Header({ context }: { context: ShopHeaderContext }) {
  return <ShopHeader context={context} />;
}
