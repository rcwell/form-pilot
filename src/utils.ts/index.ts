const parse = (input: object) => {
  const maybe = input as { name?: string; data?: { root?: object } };
  return maybe?.name === "codeblock" && isObj(maybe?.data?.root)
    ? maybe.data.root
    : input;
};
const isObj = (d: unknown): d is object => !!d && typeof d === "object";
const stringify = (data: object) => JSON.stringify(data, null, 2);
const schema = <T>(schema: T) => ({ schema });
const toCodeBlock = (data: object) => `\`\`\`json
${stringify(data)}
\`\`\``;

const convertJsonToDescriptiveText = (
  jsonObject: any,
  indent = 0,
  parentKey = ""
): string => {
  if (jsonObject === null || jsonObject === undefined) {
    return "";
  }

  const lines: string[] = [];
  const prefix = "  ".repeat(indent); // For indentation, making it readable

  if (Array.isArray(jsonObject)) {
    lines.push(`${prefix}${parentKey ? parentKey + ": " : ""}List of items:`);
    jsonObject.forEach((item, index) => {
      lines.push(`${prefix}  Item ${index + 1}:`);
      lines.push(convertJsonToDescriptiveText(item, indent + 1));
    });
  } else if (typeof jsonObject === "object") {
    if (parentKey) {
      lines.push(`${prefix}${parentKey}:`); // If it's a nested object, describe its key
    }
    for (const key in jsonObject) {
      if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
        const value = jsonObject[key];
        if (typeof value === "object" && value !== null) {
          lines.push(convertJsonToDescriptiveText(value, indent + 1, key)); // Recurse for nested objects/arrays
        } else {
          lines.push(`${prefix}  ${key}: ${String(value)}`); // Directly describe key-value pairs
        }
      }
    }
  } else {
    // Primitive value, should ideally not be a top-level call unless stringifying
    lines.push(
      `${prefix}${parentKey ? parentKey + ": " : ""}${String(jsonObject)}`
    );
  }

  return lines.filter((line) => line.trim() !== "").join("\n"); // Filter out empty lines
}

export { schema, parse, stringify, toCodeBlock, convertJsonToDescriptiveText };
