import { cancelUnpaidWins } from "@afrotalia/core/mnada/cancel-unpaid-wins";
import { defineTask } from "nitro/task";

import { getDb } from "../../../src/services";

export default defineTask({
  meta: {
    name: "mnada:cancel-unpaid-wins",
    description: "Cancel AUCTION_WIN orders past their payment window; record a non-payment strike.",
  },
  async run() {
    const result = await cancelUnpaidWins(getDb());
    if (result.cancelled.length) {
      console.log(
        `[mnada:cancel-unpaid-wins] cancelled=${result.cancelled.length} blocked=${result.blocked.length}`,
      );
    }
    return { result };
  },
});
