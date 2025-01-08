const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const tmpDir = "/tmp";

  if (event.httpMethod === "POST") {
    const fileName = event.headers["x-file-name"]; // Get file name from headers
    const filePath = path.join(tmpDir, fileName);
    const metadataPath = path.join(tmpDir, `${fileName}.meta`); // Metadata file for timestamp

    try {
      // Save the uploaded file
      fs.writeFileSync(filePath, event.body, "utf8");

      // Save metadata (timestamp)
      const metadata = { uploadedAt: new Date().toISOString() };
      fs.writeFileSync(metadataPath, JSON.stringify(metadata), "utf8");

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
    const queryParams = event.queryStringParameters;

    // Check if a specific file is requested
    if (queryParams && queryParams.file) {
      const fileName = queryParams.file;
      const filePath = path.join(tmpDir, fileName);

      try {
        // Read the requested file
        const fileContent = fs.readFileSync(filePath, "utf8");

        return {
          statusCode: 200,
          body: fileContent,
          headers: {
            "Content-Type": "text/plain",
          },
        };
      } catch (error) {
        console.error("Error reading file:", error);
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "File not found." }),
        };
      }
    }

    // List all files if no specific file is requested
    try {
      const files = fs.readdirSync(tmpDir).filter((file) => !file.endsWith(".meta")); // Ignore metadata files
      const filesWithMetadata = files.map((file) => {
        const metadataPath = path.join(tmpDir, `${file}.meta`);
        let uploadedAt = null;

        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
          uploadedAt = metadata.uploadedAt;
        }

        return { name: file, uploadedAt };
      });

      return {
        statusCode: 200,
        body: JSON.stringify(filesWithMetadata),
      };
    } catch (error) {
      console.error("Error listing files:", error);
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
