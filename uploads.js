const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    // Handle file upload
    const data = Buffer.from(event.body, 'base64');
    const filename = event.headers['x-file-name'] || `file_${Date.now()}.txt`;
    const filePath = path.join(UPLOAD_DIR, filename);

    try {
      fs.writeFileSync(filePath, data);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully', filename }),
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save file' }) };
    }
  }

  if (event.httpMethod === 'GET') {
    // Return list of uploaded files
    try {
      const files = fs.readdirSync(UPLOAD_DIR);
      return { statusCode: 200, body: JSON.stringify(files) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to read files' }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
