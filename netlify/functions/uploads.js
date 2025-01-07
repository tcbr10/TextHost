const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/tmp/uploads'; // Temporary storage for uploaded files

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      // Handle file upload
      const data = Buffer.from(event.body, 'base64');
      const filename = event.headers['x-file-name'] || `file_${Date.now()}.txt`;
      const filePath = path.join(UPLOAD_DIR, filename);

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      fs.writeFileSync(filePath, data);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', filename }),
      };
    }

    if (event.httpMethod === 'GET') {
      const fileQuery = event.queryStringParameters?.file;

      if (fileQuery) {
        // Serve a specific file
        const filePath = path.join(UPLOAD_DIR, fileQuery);
        if (!fs.existsSync(filePath)) {
          return { statusCode: 404, body: 'File not found' };
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return {
          statusCode: 200,
          body: fileContent,
        };
      } else {
        // List all files
        if (!fs.existsSync(UPLOAD_DIR)) {
          return { statusCode: 200, body: JSON.stringify([]) };
        }

        const files = fs.readdirSync(UPLOAD_DIR);
        return { statusCode: 200, body: JSON.stringify(files) };
      }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
