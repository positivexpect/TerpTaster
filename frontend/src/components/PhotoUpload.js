import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import LoadingSpinner from "./LoadingSpinner";

const PhotoUpload = ({ onPhotosUploaded, existingPhotos = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState(existingPhotos);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append("photos", file);
        });

        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          const newPhotos = [
            ...uploadedPhotos,
            ...result.files.map((file) => file.url),
          ];
          setUploadedPhotos(newPhotos);
          onPhotosUploaded(newPhotos);
        } else {
          alert("Upload failed: " + result.error);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [uploadedPhotos, onPhotosUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removePhoto = (indexToRemove) => {
    const newPhotos = uploadedPhotos.filter(
      (_, index) => index !== indexToRemove,
    );
    setUploadedPhotos(newPhotos);
    onPhotosUploaded(newPhotos);
  };

  return (
    <div className="photo-upload-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Photos (Optional)
      </label>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <LoadingSpinner size="lg" message="Uploading photos..." />
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the photos here...</p>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 mb-1">
              <span className="font-medium text-blue-600">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP up to 5MB (max 5 photos)
            </p>
          </div>
        )}
      </div>

      {/* Preview uploaded photos */}
      {uploadedPhotos.length > 0 && (
        <div className="photo-preview-grid mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Photos:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={`http://localhost:3001${photo}`}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
