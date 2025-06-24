import { ragFlow } from "../flows/rag";
import { ai, InputSchema, OutputSchema } from "../ai";

export const invokeRag = ai.defineTool(
  {
    name: "invokeRag",
    description: "Tool to start the RAG flow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => await ragFlow(input)
);
