import React, { useState } from "react";
import API_BASE_URL from "../config";
import StrainSearchInput from "./StrainSearchInput";
import PhotoUpload from "./PhotoUpload";

console.log("API_BASE_URL:", API_BASE_URL);

// Reuse the styled components from MasterReview
const TextInput = React.memo(
  ({ label, name, value, onChange, required, placeholder }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <label className="block text-lg font-semibold mb-3 text-gray-700">
        {label}
      </label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
      />
    </div>
  ),
);

const SliderInput = ({ label, value, name, onChange, onAdjust }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <label className="block text-lg font-semibold mb-3 text-gray-700">
      {label}: <span className="text-purple-600 font-bold">{value}</span>
    </label>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onAdjust(-0.1)}
        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
      >
        -
      </button>

      <div className="flex-1 relative">
        <input
          name={name}
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-purple-600
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:hover:bg-purple-700
            [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:bg-purple-600
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:hover:bg-purple-700
            [&::-moz-range-thumb]:transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={() => onAdjust(0.1)}
        className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
      >
        +
      </button>

      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={value}
        onChange={onChange}
        className="w-20 p-2 text-center rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
      />
    </div>
  </div>
);

const SelectInput = ({ label, name, value, onChange, required, options }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <label className="block text-lg font-semibold mb-3 text-gray-700">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const STRAIN_TYPES = [
  "Indica",
  "Sativa",
  "Hybrid",
  "Hybrid - Indica Dominant",
  "Hybrid - Sativa Dominant",
];

// Update required fields to remove smoking_device
const requiredFormFields = [
  "strain",
  "type",
  "grower",
  "location",
  "review_date",
  "overall_score",
  "reviewed_by",
];

// Helper function to map strain types
const mapStrainType = (type) => {
  // Convert to lowercase for comparison
  const lowerType = type?.toLowerCase();

  // Map common variations to our valid types
  if (lowerType?.includes("indica")) return "Indica";
  if (lowerType?.includes("sativa")) return "Sativa";
  if (lowerType?.includes("hybrid")) return "Hybrid";

  // Default to Hybrid if unknown
  return "Hybrid";
};

const BasicReview = () => {
  const [formData, setFormData] = useState({
    strain: "",
    location: "",
    overall_score: 7,
    notes: "",
    reviewed_by: "",
    photos: [],
    review_date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const adjustSlider = (amount) => {
    setFormData((prev) => ({
      ...prev,
      overall_score: Math.min(
        10,
        Math.max(0, Number(prev.overall_score) + amount),
      ),
    }));
  };

  const handleStrainChange = (e) => {
    // If e is an object with a target (regular input)
    if (e.target) {
      setFormData((prev) => ({
        ...prev,
        strain: e.target.value,
      }));
    }
    // If e is a strain object from the suggestion list
    else if (e["Strain Name"]) {
      setFormData((prev) => ({
        ...prev,
        strain: e["Strain Name"],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create review object matching server's /basic-reviews endpoint requirements
    const reviewData = {
      strain: formData.strain.trim(),
      location: formData.location.trim(),
      overall_score: formData.overall_score.toString(),
      notes: formData.notes?.trim() || "",
      reviewed_by: formData.reviewed_by.trim(),
      photos: formData.photos || [],
    };

    // Validate required fields exactly as server expects
    if (
      !reviewData.strain ||
      !reviewData.location ||
      !reviewData.reviewed_by ||
      !reviewData.overall_score
    ) {
      setError(
        "Please fill in all required fields: Strain Name, Location, Overall Score, and Reviewer Name",
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/basic-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit review");
      }

      // Reset form on success
      setFormData({
        strain: "",
        location: "",
        overall_score: 7,
        notes: "",
        reviewed_by: "",
        photos: [],
        review_date: new Date().toISOString().split("T")[0],
      });
      setError(null);
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6 flex justify-center items-center">
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 w-full max-w-xl">
        <h1 className="text-4xl font-extrabold text-green-900 mb-6 flex items-center gap-2">
          <span>🌿</span>
          Quick Review
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <StrainSearchInput
            value={formData.strain}
            onChange={handleStrainChange}
            onSelect={(strain) => {
              setFormData((prev) => ({
                ...prev,
                strain: strain["Strain Name"],
              }));
            }}
            required
          />

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Where did you get it?"
          />

          <SliderInput
            label="Overall Rating"
            name="overall_score"
            value={formData.overall_score}
            onChange={handleChange}
            onAdjust={adjustSlider}
          />

          <TextInput
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any thoughts about this strain?"
          />

          <PhotoUpload
            onPhotosUploaded={(photos) =>
              setFormData((prev) => ({ ...prev, photos }))
            }
            existingPhotos={formData.photos}
          />

          <TextInput
            label="Reviewed By"
            name="reviewed_by"
            value={formData.reviewed_by}
            onChange={handleChange}
            required
            placeholder="Your Name"
          />

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-full bg-purple-600 text-white font-semibold 
                     hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 
                     shadow-md hover:shadow-lg"
          >
            Submit Quick Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default BasicReview;
