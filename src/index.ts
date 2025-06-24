import dotenv from "dotenv";
import { startFlowServer } from "@genkit-ai/express";
import { ai, InputSchema, OutputSchema } from "./ai";
import { pilotAgent } from "./agent.ts";

dotenv.config();

export const pilotFlow = ai.defineFlow(
  {
    name: "pilotFlow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema.nullable(),
  },
  async (input) => {
    const response = await pilotAgent(input);
    return response.output;
  }
);

startFlowServer({
  flows: [pilotFlow],
});
