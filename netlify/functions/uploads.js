const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    const fileName = event.headers["x-file-name"]; // Get the file name from headers
    const tmpDir = "/tmp"; // Use the /tmp directory
    const filePath = path.join(tmpDir, fileName); // Full file path in /tmp

    try {
      // Save the file in /tmp
      fs.writeFileSync(filePath, event.body, "utf8");

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `File "${fileName}" uploaded successfully.` }),
      };
    } catch (error) {
      console.error("Error writing file:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save file." }),
      };
    }
  }

  if (event.httpMethod === "GET") {
    const tmpDir = "/tmp"; // Use the /tmp directory

    try {
      // List files in /tmp
      const files = fs.readdirSync(tmpDir);

      return {
        statusCode: 200,
        body: JSON.stringify(files),
      };
    } catch (error) {
      console.error("Error reading files:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to list files." }),
      };
    }
  }

  // Handle unsupported methods
  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
