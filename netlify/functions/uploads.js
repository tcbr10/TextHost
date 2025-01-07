const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      // Log request details
      console.log('POST Request received');
      console.log('Headers:', event.headers);
      console.log('Body:', event.body);

      // Check if the body contains a file
      if (!event.body || !event.isBase64Encoded) {
        console.error('No file in request body');
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No file provided or invalid request format' }),
        };
      }

      const data = Buffer.from(event.body, 'base64');
      const filename = event.headers['x-file-name'] || `file_${Date.now()}.txt`;
      const filePath = path.join(UPLOAD_DIR, filename);

      // Ensure upload directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      fs.writeFileSync(filePath, data);
      console.log(`File uploaded successfully: ${filename}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', filename }),
      };
    }

    if (event.httpMethod === 'GET') {
      // List files in the upload directory
      console.log('GET Request received');
      if (!fs.existsSync(UPLOAD_DIR)) {
        return { statusCode: 200, body: JSON.stringify([]) };
      }
      const files = fs.readdirSync(UPLOAD_DIR);
      return { statusCode: 200, body: JSON.stringify(files) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
