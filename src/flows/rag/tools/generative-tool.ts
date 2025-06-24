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
        output: { format: "json" },
        config: { temperature: 0.2 },
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
