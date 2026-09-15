import { settleExpiredAuctions } from "@afrotalia/core/mnada/settle-auctions";
import { defineTask } from "nitro/task";

import { getDb } from "../../../src/services";

export default defineTask({
  meta: {
    name: "mnada:settle-auctions",
    description: "Close LIVE Mnada auctions past endsAt: settle if reserve met, else release and close.",
  },
  async run() {
    const result = await settleExpiredAuctions(getDb());
    if (result.settled.length || result.closed.length) {
      console.log(
        `[mnada:settle-auctions] settled=${result.settled.length} closed=${result.closed.length}`,
      );
    }
    return { result };
  },
});
