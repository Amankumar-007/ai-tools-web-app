"use client";
import React, { useState } from "react";

export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (data.secure_url) {
      onUpload(data.secure_url);
    } else {
      alert("Upload failed!");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full max-w-md bg-white text-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="mb-3 block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer"
      />
      {loading && <p className="text-blue-500">Uploading...</p>}
    </div>
  );
}
