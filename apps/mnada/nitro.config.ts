import { defineConfig } from "nitro";

// Scheduled jobs for the Mnada auction lifecycle (see server/tasks/mnada/).
// On Vercel, `scheduledTasks` becomes a native Vercel Cron Job at build
// time — no vercel.json cron config needed. Secure it by setting
// CRON_SECRET. Locally (dev/node_server presets) the same schedule runs
// via croner.
//
// Left disabled for now: Vercel's Hobby plan only allows daily cron
// schedules, and these tasks need to run far more often than once a day to
// be useful (settling auctions promptly, catching non-payment quickly).
// Until this project is on a paid plan, run them manually — the task files
// still work standalone: `nitro task run mnada:settle-auctions` (or via
// `runTask()` from an authenticated endpoint). Re-enable by uncommenting
// `scheduledTasks` below once upgraded, picking a cadence the plan allows.
export default defineConfig({
  serverDir: "./server",
  experimental: { tasks: true },
  // scheduledTasks: {
  //   "* * * * *": ["mnada:settle-auctions", "mnada:cancel-unpaid-wins"],
  // },
});
