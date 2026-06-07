import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "vietnamese-eden",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
