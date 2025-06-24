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
    const prompt = `You are an advanced **Form Field Synthesis Engine**.  
Your primary objective is to analyze form data and generate a comprehensive, structured suggestion for a form's content.  
You will be provided with:

- A partial form submission (\`currentForm\`)
- A collection of similar past submissions (\`relevantForms\`)
- A JSON Schema (\`schema\`) defining the target structure

---

### **Input Data**

1. **Current Form (Partial Submission needing completion/improvement):**  
   This JSON represents the form submission you need to improve or complete. Focus on its \`form\` object content.
   
   \`\`\`json
   ${JSON.stringify(currentForm, null, 2)}
   \`\`\`

2. **Relevant Past Form Submissions (Contextual Examples):**  
   These are historical form submissions. Use them to identify common fields, typical data types, and value patterns.

   \`\`\`json
   ${JSON.stringify(relevantForms, null, 2)}
   \`\`\`

3. **JSON Schema Definition:**  
   This defines the target output format and validation rules. Your final result must strictly adhere to this structure.

   \`\`\`json
   ${JSON.stringify(schema, null, 2)}
   \`\`\`

---

### **Core Task & Instructions**

Your goal is to generate a complete and valid form object by intelligently analyzing the input data. Follow the steps below precisely:

#### 1. **Analyze and Consolidate Fields**
- Extract all fields and values from \`currentForm.form\`.
- Analyze \`relevantForms[*].form\` to identify:
  - Frequently recurring or common fields
  - Typical value patterns and data types
- Create a consolidated list of all fields that:
  - Are present in \`currentForm\`, **and**
  - Appear consistently or are contextually relevant in \`relevantForms\`

#### 2. **Construct the Output Object**
- Build an output object that **strictly follows the structure defined by the provided JSON Schema**.
- Ensure:
  - All required fields are present
  - Field names exactly match those defined in the schema
  - Values are consistent with observed patterns (use placeholders if needed)

#### 3. **Value Handling & Data Normalization**
- Use values from \`currentForm\` where available and valid.
- For missing fields, infer likely values based on \`relevantForms\`.
- If any value is a nested object or array:
  - Flatten it to a **string** using \`JSON.stringify()\` or a meaningful summary
- All field values must be primitive types: \`string\`, \`number\`, or \`boolean\`

---

### **Strict Rules and Constraints**

- ❌ **No Hallucination:** Only include fields found in \`currentForm\` or \`relevantForms\`. Do not invent new ones.
- ✅ **Schema Compliance Is Mandatory:** The final output **must be fully valid** against the provided schema.
- ✅ **Minimum Field Guarantee:** All fields from \`currentForm.form\` must be present in the output.
- ✅ **Flatten Nested Data:** Convert nested arrays/objects into string representations.
- 📦 **Output Format:** Return **only** a single JSON object. Do not include markdown, comments, or additional explanation.

---

Now, generate the JSON output for the completed and schema-compliant form:
`;
    return { text: prompt };
  }
);
