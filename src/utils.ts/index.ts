import * as cheerio from "cheerio";

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
const removeNoValueProperties = (data: any) => {
  if (!isObj(data)) return data; // 0/''/undefined/null

  const formWithValues = {};

  Object.entries(data).forEach(([key, value]) => {
    const cleaned = removeNoValueProperties(value);
    if (Boolean(cleaned)) {
      formWithValues[key] = cleaned;
    }
  });

  return formWithValues;
};

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
};

function extractPlainTextFromHtml(htmlString: string): string {
  try {
    const $ = cheerio.load(htmlString);
    $("script, style").remove(); // Remove script and style elements
    return $("body").text().trim(); // Get text from body and trim whitespace
  } catch (error) {
    console.warn(
      "Error parsing HTML with cheerio, returning original string:",
      error
    );
    return htmlString; // Fallback to original if cheerio fails (e.g., not valid HTML)
  }
}

function valueToText(value: any): string {
  if (typeof value === "string") {
    // Check if it looks like HTML (simple check, not foolproof)
    if (/<[a-z][\s\S]*>/i.test(value)) {
      return extractPlainTextFromHtml(value);
    }
    return value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  } else if (Array.isArray(value)) {
    // Recursively convert array elements
    return value.map((v) => valueToText(v)).join(", ");
  } else if (typeof value === "object" && value !== null) {
    // Recursively convert nested objects
    return objectToText(value);
  }
  return ""; // Return empty string for null, undefined, or unsupported types
}

function objectToText(obj: { [key: string]: any }): string {
  let textParts: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    const parsedValue = valueToText(value);
    if (parsedValue) {
      // Only add if the parsed value is not empty
      textParts.push(`${key}: ${parsedValue}`);
    }
  });
  return textParts.join("\n"); // Join parts with newlines for readability by the model
}

export {
  schema,
  parse,
  stringify,
  toCodeBlock,
  convertJsonToDescriptiveText,
  removeNoValueProperties,
  objectToText,
};
