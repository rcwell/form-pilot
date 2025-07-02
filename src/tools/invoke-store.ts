import { storeFlow } from "../flows/store";
import { ai, InputSchema, OutputSchema } from "../ai";

export const invokeStore = ai.defineTool(
  {
    name: "invokeStore",
    description: "Tool to start the Store flow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    return await storeFlow(input);
  }
);
