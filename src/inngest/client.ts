import { EventSchemas, Inngest } from "inngest";

export type InngestEvents = {
  "test/hello": {
    data: {
      source?: string;
    };
  };
};

export const inngest = new Inngest({
  id: "vietnamese-eden",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
