const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = '/tmp/uploads'; // Use /tmp for writing files in serverless functions

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') {
      console.log('POST Request received');
      console.log('Headers:', event.headers);

      if (!event.body || !event.isBase64Encoded) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No file provided or invalid request format' }),
        };
      }

      const data = Buffer.from(event.body, 'base64');
      const filename = event.headers['x-file-name'] || `file_${Date.now()}.txt`;
      const filePath = path.join(UPLOAD_DIR, filename);

      // Ensure the temporary upload directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      // Write the file to the temporary directory
      fs.writeFileSync(filePath, data);

      console.log(`File uploaded successfully: ${filename}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', filename }),
      };
    }

    if (event.httpMethod === 'GET') {
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
