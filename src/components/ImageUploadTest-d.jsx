import { useState } from 'react';

export default function ImageUploadTest() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUrl(data.url);
        setError('');
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0] || null)}
      />
      <br />
      <button type="submit">Submit</button>
      <br />
      {error && <p>{error}</p>}
      {url && (
        <div>
          <p>{url}</p>
          <img src={url} alt="Uploaded" />
        </div>
      )}
    </form>
  );
}
