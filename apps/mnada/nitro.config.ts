import { defineConfig } from "nitro";

// Scheduled jobs for the Mnada auction lifecycle (see server/tasks/mnada/).
// On Vercel this becomes a native Vercel Cron Job at build time — no
// vercel.json cron config needed. Secure it by setting CRON_SECRET.
// Locally (dev/node_server presets) the same schedule runs via croner.
export default defineConfig({
  serverDir: "./server",
  experimental: { tasks: true },
  scheduledTasks: {
    "* * * * *": ["mnada:settle-auctions", "mnada:cancel-unpaid-wins"],
  },
});
