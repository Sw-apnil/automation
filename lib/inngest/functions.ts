import { cron } from "inngest";
import { inngest } from "@/lib/inngest/client";
import { runEvery15MinPipeline } from "@/lib/pipeline/engine";

export const runFootballAutomationEveryFiveMinutes = inngest.createFunction(
  {
    id: "run-football-automation-every-5-minutes",
    name: "Run football automation every 5 minutes",
    triggers: [cron("*/5 * * * *")]
  },
  async ({ step }) => {
    return step.run("Run due football pipeline", async () => runEvery15MinPipeline());
  }
);
