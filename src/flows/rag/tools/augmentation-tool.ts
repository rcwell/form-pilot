import { z } from "zod";
import { ai, InputSchema, PromptPartSchema, FormJsonSchema } from "../../../ai";

export const augmentationTool = ai.defineTool(
  {
    name: "augmentationTool",
    description: "Formats retrieved data into a prompt.",
    outputSchema: PromptPartSchema,
    inputSchema: z.object({
      currentForm: InputSchema,
      relevantForms: z.array(InputSchema),
      schema: FormJsonSchema,
    }),
  },
  async ({ currentForm, relevantForms, schema }) => {
    const prompt = `
You are a Form Field Completion Engine.
Your task is to complete and improve a partial form (currentForm) using insights from similar past submissions (relevantForms), while strictly following the structure defined by a JSON Schema (schema).

Inputs:
- A partial form submission ("currentForm")
    \`\`\`json
    ${JSON.stringify(currentForm)}
    \`\`\`
- A collection of similar past submissions ("relevantForms")
    \`\`\`json
    ${JSON.stringify(relevantForms)}
    \`\`\`
- A JSON Schema ("schema") defining the target structure
    \`\`\`json
    ${JSON.stringify(schema)}
    \`\`\`

Goal:
- Generate a single, completed form object that:
- Includes all fields from currentForm.form
- Uses consistent and context-aware values based on relevantForms
- Is fully valid according to the schema

Instructions:

1. Analyze Input:
- Extract values from currentForm.form
- Study relevantForms[*].form to find typical field names, value types, and content patterns

2. Complete the Form:
- Use existing values from currentForm
- Fill missing fields using patterns from relevantForms
- Ensure all fields match exactly those defined in the schema
- For any field whose value is identified as an HTML string (e.g., rich text content containing tags like \`<p>\`, \`<strong>\`, \`<em>\`), preserve the html content exactly as found. Do NOT attempt to flatten, summarize, or strip HTML tags from these values.
- If a field from \`relevantForms\` or \`currentForm\` clearly contains HTML, maintain its string representation including all tags.

3. Output Requirements:
- Only include fields found in the schema (no extra fields)
- HTML strings (e.g., rich text like \'<p>\' or \'<strong>\') are allowed
`;
    return { text: prompt };
  }
);
