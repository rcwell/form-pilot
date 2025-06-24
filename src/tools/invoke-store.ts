import { storeFlow } from "../flows/store";
import { ai, InputSchema, OutputSchema } from "../ai";
// import fs from "fs";
// import { z } from "genkit";

export const invokeStore = ai.defineTool(
  {
    name: "invokeStore",
    description: "Tool to start the Store flow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    // const raw = fs.readFileSync("./src/data/forms.jsonl", "utf-8");
    // const forms: z.infer<typeof InputSchema>[] = raw
    //   .split("\n")
    //   .filter((line) => line.trim())
    //   .map((line) => JSON.parse(line));

    // for (const [index, form] of forms.entries()) {
    //   try {
    //     await storeFlow(form);
    //     console.log(`Saved: ${index + 1 / forms.length}`);
    //   } catch (error) {
    //     console.log(`Failed: ${index + 1 / forms.length}`);
    //   }
    // }

    // return { success: true, suggestion: { fields: forms } };

    return await storeFlow(input);
  }
);
