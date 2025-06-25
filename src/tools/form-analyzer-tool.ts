import googleAI from "@genkit-ai/googleai";
import { ai, InputSchema, OutputSchema } from "../ai";

export const formAnalyzerTool = ai.defineTool(
  {
    name: "formAnalyzerTool",
    description: "Analyzes form if its complete or incomplete",
    inputSchema: InputSchema,
    outputSchema: InputSchema,
  },
  async (input) => {
    const formStr = JSON.stringify(input.form, null, 2);
    const prompt = `
# 🧩 Prompt Canvas: Form Analysis & Schema Generator

## 🎯 Goal

Analyze a JSON form input.  
- If **all fields have values**, consider it *complete* and return it without \`schema\`.
- If **any fields are incomplete**, generate a minimal JSON Schema (Draft-07) reflecting the structure.

---

## 🧾 Inputs

- \`formStr\`: the JSON string representing the form to analyze.
- \`input.domain\`: the domain or context for the form.

---

## 📥 Instructions to the Model

1. **Parse the JSON form** from the input.
2. **Check if the form is complete**:
   - A field is **incomplete** if its value is one of the following:
     - \`null\`
     - \`""\` (empty string)
     - \`undefined\` (if applicable)
     - not present
3. **Branch logic**:
   ### ✅ If the form is complete:
   Return the following:
   \`\`\`json
   {
     "domain": "${input.domain}",
     "form": ${formStr}
   }
   \`\`\`

❌ If the form is incomplete:
- Generate a schema according to these rules:
- Follow JSON Schema Draft-07 format.
- Under "properties", include only "type" for each field.
- For null, empty, or missing values, default the type to "string".
- Recursively process nested objects.
- Arrays and complex types can be skipped unless clearly structured.

Return the following:
\`\`\`json
{
  "domain": "${input.domain}",
  "form": ${formStr},
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      // generated keys with only "type"
    }
  }
}
\`\`\`

⚠️ Constraints
- Use only "type" under each property.
- Do not include "required", "description", or other metadata fields.
- Fallback to "string" for invalid or incomplete values.
`;

    const response = await ai.generate({
      prompt: prompt,
      model: googleAI.model("gemini-1.5-flash"),
      output: { format: "json" },
      config: { temperature: 0.2 },
    });
    return response.output;
  }
);