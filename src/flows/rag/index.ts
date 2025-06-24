import { ai, InputSchema, OutputSchema } from "../../ai";
import { augmentationTool } from "./tools/augmentation-tool";
import { generativeTool } from "./tools/generative-tool";
import { retrievalTool } from "./tools/retrieval-tool";

export const ragFlow = ai.defineFlow(
  {
    name: "ragFlow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { schema, ...currentForm } = input;

    if (!schema) {
      return {
        success: false,
        message: "Requires missing `JSON Schema`",
      };
    }

    const relevantForms = await retrievalTool(currentForm);

    const prompt = await augmentationTool({
      relevantForms,
      currentForm,
      schema,
    });
    
    return await generativeTool(prompt);
  }
);
