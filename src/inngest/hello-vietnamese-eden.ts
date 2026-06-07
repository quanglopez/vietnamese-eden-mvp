import { inngest } from "@/inngest/client";

export const helloVietnameseEden = inngest.createFunction(
  {
    id: "hello-vietnamese-eden",
    name: "Hello Vietnamese Eden",
  },
  { event: "test/hello" },
  async ({ event, step }) => {
    const greeting = await step.run("build-greeting", async () => {
      const source = event.data.source ?? "inngest-dev";
      return {
        message: "Xin chào from Vietnamese Eden!",
        source,
        eventName: event.name,
      };
    });

    await step.run("log-greeting", async () => {
      console.info("[helloVietnameseEden]", greeting.message, greeting);
    });

    return greeting;
  },
);
