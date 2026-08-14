import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [, files] = await form.parse(req);
    const file = files.file?.[0] || files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const filename = file.originalFilename || 'upload.png';
    const blob = await put(filename, fileBuffer, { access: 'public' });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
