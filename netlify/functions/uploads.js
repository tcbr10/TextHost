const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    const fileName = event.headers["x-file-name"];
    const uploadsDir = path.join(__dirname, "../../uploads");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save the file
    const filePath = path.join(uploadsDir, fileName);
    const fileData = event.body;

    fs.writeFileSync(filePath, fileData, "utf8"); // Save as plain text

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `File ${fileName} uploaded successfully.` }),
    };
  }

  if (event.httpMethod === "GET") {
    // List uploaded files
    const uploadsDir = path.join(__dirname, "../../uploads");
    const files = fs.readdirSync(uploadsDir);
    return {
      statusCode: 200,
      body: JSON.stringify(files),
    };
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
