import { useState, useEffect } from "react";
import "./Home.css";

export default function Home({ onAnalyze, isLoading = false }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      return "Please upload a valid image file.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Image size must be under 5MB.";
    }
    return "";
  };

  const handleImageSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!image || isLoading) return;

    const formData = new FormData();
    formData.append("image", image);
    onAnalyze(formData);
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setError("");
  };

  return (
    <>
      {/* 🔥 LOADING OVERLAY */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <h2>Analyzing Image</h2>
            <p>Please wait,image is being analyzed</p>
          </div>
        </div>
      )}

      <h1>Colonoscopy AI Diagnosis</h1>
      <p className="subtitle center">
        Upload a colonoscopy image to detect polyps and assess cancer risk
      </p>

      <div
        className="upload-card"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <form onSubmit={handleSubmit}>
          {/* IMAGE PREVIEW */}
          {preview ? (
            <div className="preview-wrapper">
              <img
                src={preview}
                alt="Uploaded colonoscopy preview"
                className="preview-image"
              />
              <button
                type="button"
                className="remove-btn"
                onClick={clearImage}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="drop-zone">
              <p>Drag & drop image here</p>
              <span>or</span>
            </div>
          )}

          {/* FILE INPUT */}
          <label className="file-label">
            Select Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>

          {/* ERROR MESSAGE */}
          {error && <p className="error-text">{error}</p>}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!image || isLoading}
            className="analyze-btn"
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </form>
      </div>
    </>
  );
}
