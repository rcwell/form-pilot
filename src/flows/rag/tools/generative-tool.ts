import googleAI from "@genkit-ai/googleai";
import { ai, PromptPartSchema, OutputSchema } from "../../../ai";

export const generativeTool = ai.defineTool(
  {
    name: "generativeTool",
    description: `Generates a structured form suggestion from a pre-formatted prompt.`,
    inputSchema: PromptPartSchema,
    outputSchema: OutputSchema,
  },
  async ({ text: prompt }) => {
    try {
      const response = await ai.generate({
        prompt,
        model:googleAI.model('gemini-1.5-flash'),
        output: { format: "json" },
        config: { temperature: 0.1 },
      });

      return {
        success: true,
        suggestion: response.output,
      };
    } catch (error) {
      return {
        success: false,
        message: JSON.stringify(error),
      };
    }
  }
);
