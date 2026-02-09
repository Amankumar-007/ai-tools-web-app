"use client";
import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setResult(data.analysis);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Resume Analyzer</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Analyze</button>
      </form>

      {loading && <p>Analyzing resume...</p>}

      {result && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
