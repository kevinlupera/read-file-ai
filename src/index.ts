import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { logger } from "hono/logger";
import { randomUUID } from "node:crypto";
import csvtojson from "csvtojson";
type Bindings = {
  GOOGLE_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"] as File | undefined;
  console.log(file);
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }
  // Validate file type
  if (file.type !== "application/pdf") {
    return c.json({ error: "File must be a PDF" }, 400);
  }

  if (!(file instanceof File)) {
    return c.json({ error: "File must be a File" }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileManager = new GoogleAIFileManager(c.env.GOOGLE_API_KEY);
  const fileUri = await fileManager.uploadFile(buffer, {
    name: randomUUID(),
    mimeType: file.type,
  });
  console.log(fileUri);
  const ai = new GoogleGenAI({
    apiKey: c.env.GOOGLE_API_KEY,
  });

  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    temperature: 0.2,
    systemInstruction: [
      {
        text: `You are an expert in parsing bank statements. Your task is to extract specific information from a bank statement page and structure it into a semicolon (;) delimited CSV format.

**Instructions:**

1.  **Output Format:** If the information can be extracted and formatted correctly, the output must begin with the header: date;description;amount;type. Each subsequent line will represent a transaction in the following format: YYYY-MM-DD;DESCRIPTION;VALUE;TYPE.

2.  **Header:** Include the header date;description;amount;type only if valid data is found in the statement.

3.  **Date Format:** Convert all dates to the YYYY-MM-DD format. If the year is not explicitly stated in the statement, assume it is the current year (2024). If the date is invalid or cannot be determined, omit that transaction.

4.  **Description:** Extract the transaction description. Limit the description length to a maximum of 30 characters. If the description exceeds 30 characters, truncate the description.

5.  **Amount:** Extract the numerical value of the transaction. ALWAYS represent the value as a positive number.

6.  **Type:** Determine the transaction type:
    *   in: If the transaction represents a credit, deposit, or income (increases the balance).
    *   out: If the transaction represents a debit, charge, payment, or withdrawal (decreases the balance).
    *   Determine the type based on the description and/or the sign of the original value (if available). If the original value is negative, the type is out.

7.  **Error Handling:** If valid information cannot be extracted from the statement, or if the information is incomplete or inconsistent, return EXACTLY the following string: ERROR. Do not include any other information in the output if there is an error.

8.  **Balance:** Do not extract the balance. Only transactions.

**Examples:**

*   **Input:**
    Date: 05/31/2025
    Detail: DEPOSIT
    Amount: 3516843.19

    **Output:**
    date;description;amount;type
    2025-05-31;DEPOSIT;3516843.19;in

*   **Input:**
    Date: 06/10
    Detail: QR PAYMENT ISAURA MARIA
    Amount: -32000.00

    **Output:**
    date;description;amount;type
    2024-06-10;QR PAYMENT ISAURA MARIA;32000.00;out

*   **Input:**
    Date: 03/15/2024
    Detail: TRANSFER RECEIVED FROM BANK XYZ - REFERENCE: 1234567890 (VERY LONG)
    Amount: 1500.50

    **Output:**
    date;description;amount;type
    2024-03-15;TRANSFER RECEIVED FROM BANK XYZ - REFERENC;1500.50;in

*   **Input:**
    Date: Invalid
    Detail: Information not available
    Amount: Cannot be determined

    **Output:**
    ERROR

**Now, analyze the following bank statement:**`,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          fileData: {
            mimeType: file.type,
            fileUri: fileUri.file.uri,
          },
        },
        { text: "Consider this file" },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  let fileContent = "";
  for await (const chunk of response) {
    fileContent += chunk.text;
    fileIndex += 1;
    if (typeof chunk.text === "string") {
      if (chunk.text.includes("ERROR")) {
        return c.json({ error: "Invalid data" }, 400);
      }
    }
  }
  if (!fileContent.includes("ERROR")) {
    console.log(fileContent);
    const jsonData = await csvtojson({
      delimiter: ";",
    }).fromString(fileContent);
    return c.json({ movements: jsonData });
  }
  return c.json({ fileContent });
});

export default app;
