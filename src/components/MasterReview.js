import { useState, useEffect } from "react";

import API_BASE_URL from "../config";
import StrainSearchInput from "./StrainSearchInput";
import PhotoUpload from "./PhotoUpload";
import terpeneData from "../data/terpenes.json";

// Move these constants outside
const WEED_TYPES = [
  "Indica",
  "Sativa",
  "Hybrid 50/50",
  "Indica Leaning Hybrid",
  "Sativa Leaning Hybrid",
];

const SMOKING_DEVICES = [
  "Pipe",
  "Bong",
  "Joint",
  "Blunt",
  "Vaporizer",
  "Bubbler",
  "Dab Rig",
  "One-Hitter",
];

// Added "Unknown" to GROW_STYLES
const GROW_STYLES = [
  "Indoor",
  "Outdoor",
  "Greenhouse",
  "Hydroponic",
  "Aeroponic",
  "Sea of Green (SOG)",
  "Screen of Green (SCROG)",
  "Low-Stress Training (LST)",
  "High-Stress Training (HST)",
  "Organic",
  "Living Soil",
  "Coco Coir",
  "Deep Water Culture (DWC)",
  "Vertical Farming",
  "Unknown",
];

// Get terpenes and flavors from our JSON data
const TERPENES = terpeneData.terpenes.map((t) => t.name).sort();
const FLAVORS = [
  ...new Set(terpeneData.terpenes.flatMap((t) => t.possibleFlavors)),
].sort();

// Create flavor to terpenes mapping
const flavorToTerpenes = {};
terpeneData.terpenes.forEach((terpene) => {
  terpene.possibleFlavors.forEach((flavor) => {
    if (!flavorToTerpenes[flavor]) {
      flavorToTerpenes[flavor] = [];
    }
    flavorToTerpenes[flavor].push(terpene.name);
  });
});

const FLOWER_COLORS = [
  "Light Green",
  "Medium Green",
  "Dark Green",
  "Lime Green",
  "Forest Green",
  "Olive Green",
  "Emerald Green",
  "Purple",
  "Deep Purple",
  "Lavender",
  "Blue",
  "Teal",
  "Orange",
  "Burnt Orange",
  "Pink",
  "Hot Pink",
  "Red",
  "Crimson",
  "Yellow",
  "Golden Yellow",
  "White",
  "Frosty White",
  "Black",
  "Charcoal Black",
  "Brown",
  "Tan",
  "Variegated (Mixed Colors)",
  "Crystaly (Heavy Trichomes)",
  "Milky (Opaque Trichomes)",
  "Calxy (Dense Calyxes)",
  "Hairy (Abundant Pistils)",
  "Frosted (Light Trichome Coverage)",
  "Icy (Extreme Trichome Coverage)",
  "Speckled (Mixed Colors and Trichomes)",
];

const BREAK_STYLES = [
  "Dry and Crumbly",
  "Sticky and Dense",
  "Fluffy and Airy",
  "Moist and Chunky",
  "Resinous and Tacky",
  "Powdery and Fine",
  "Hard and Compact",
  "Spongy and Springy",
  "Leafy and Loose",
  "Crystalline and Brittle",
  "Sticky Icy (Heavy Trichomes)",
  "Moist and Resinous",
  "Dry and Sandy",
  "Fluffy and Sticky",
  "Dense and Chunky",
  "Crackly and Dry",
  "Soft and Pliable",
  "Sticky and Gooey",
  "Dry and Flaky",
  "Moist and Sticky",
];

const TASTED_FLAVORS = FLAVORS;

// Define initialScoreCard before using it
const initialScoreCard = {
  palateScore: 0,
  palateGrade: "",
  terpsIdentified: 0,
  totalPossibleTerps: 0,
  matchedTerps: [],
  unmatchedTerps: [],
};

function calculatePalateScore(formData) {
  const { terpenes, tastedTerpsInhale, tastedTerpsExhale } = formData;
  const selectedFlavors = new Set([...tastedTerpsInhale, ...tastedTerpsExhale]);

  if (selectedFlavors.size === 0) {
    return {
      percentage: 0,
      letter: "F",
      correctCount: 0,
      totalPossibleTerpenes: terpenes.length,
    };
  }

  let correctCount = 0;
  selectedFlavors.forEach((flavor) => {
    const associatedTerps = flavorToTerpenes[flavor] || [];
    const hasMatch = associatedTerps.some((t) => terpenes.includes(t));
    if (hasMatch) {
      correctCount++;
    }
  });

  const total = selectedFlavors.size;
  const percentage = (correctCount / total) * 100;
  const rounded = Math.round(percentage);

  let letter = "F";
  if (rounded >= 90) {
    letter = "A";
  } else if (rounded >= 80) {
    letter = "B";
  } else if (rounded >= 70) {
    letter = "C";
  } else if (rounded >= 60) {
    letter = "D";
  } else {
    letter = "F";
  }

  return {
    percentage: rounded,
    letter,
    correctCount,
    totalPossibleTerpenes: terpenes.length,
  };
}

const initialFormData = {
  // Numeric fields
  previous_rating: 0,
  taste_rating: 0,
  smell_rating: 0,
  bag_appeal_rating: 0,
  thc: 0,
  terps_percent: 0,
  high_rating: 0,
  overall_score: 7,
  terpene_percent: 0,
  looks: 0,
  taste: 0,

  // Boolean fields
  second_time_consistency: false,
  grand_champ: false,
  chest_punch: false,
  throat_hitter: false,
  head_feel: false,
  body_feel: false,

  // Date field
  review_date: new Date().toISOString().split("T")[0],

  // Array fields (initialize as arrays, will convert to text when sending to DB)
  exhale_terps: [],
  inhale_terps: [],
  known_terps: [],
  flower_color: [],
  grow_style: [],
  break_style: [],
  terpenes: [],

  // Text fields
  high: "",
  smell: "",
  bag_appeal: "",
  notes: "",
  type: "",
  grower: "",
  location: "",
  strain: "",
  smoking_instrument: "",
  reviewed_by: "",
  weed_type: "",
  smoking_device: "",
};

const MasterReview = () => {
  const TextInput = ({
    label,
    name,
    value,
    onChange,
    required,
    placeholder,
  }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <label className="block text-lg font-semibold mb-3 text-gray-700">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
      />
    </div>
  );

  // Move these component definitions inside MasterReview
  const SliderInput = ({
    label,
    value,
    name,
    onChange,
    onAdjust,
    max = 10,
    step = 0.1,
  }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <label className="block text-lg font-semibold mb-3 text-gray-700">
        {label}: <span className="text-purple-600 font-bold">{value}</span>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onAdjust(-step)}
          className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
        >
          -
        </button>

        <div className="flex-1 relative">
          <input
            name={name}
            type="range"
            min="0"
            max={max}
            step={step}
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
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => onAdjust(step)}
          className="w-8 h-8 flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
        >
          +
        </button>

        <input
          type="number"
          min="0"
          max={max}
          step={step}
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
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  // State declarations
  const [formData, setFormData] = useState({
    strain: "",
    type: "",
    grower: "",
    location: "",
    smoking_device: "",
    grow_style: [],
    known_terps: [],
    inhale_terps: [],
    exhale_terps: [],
    tasted_terps_inhale: [],
    tasted_terps_exhale: [],
    flower_color: [],
    break_style: [],
    overall_score: 7,
    terp_score: 0,
    terp_grade: "",
    notes: "",
    reviewed_by: "",
    date: new Date().toISOString().split("T")[0],
    previous_rating: 0,
    throat_hitter: false,
    chest_punch: false,
    head_feel: false,
    body_feel: false,
    grand_champ: false,
    weedType: "",
    photos: [],
  });

  const [scoreCard, setScoreCard] = useState(initialScoreCard);
  const [submitStatus, setSubmitStatus] = useState({
    show: false,
    success: false,
    message: "",
  });

  useEffect(() => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const offsetEST = 5 * 60 * 60000;
    const estTime = new Date(utcTime - offsetEST);

    const yyyy = estTime.getFullYear();
    const mm = String(estTime.getMonth() + 1).padStart(2, "0");
    const dd = String(estTime.getDate()).padStart(2, "0");
    const estDateString = `${yyyy}-${mm}-${dd}`;

    setFormData((prev) => ({ ...prev, date: estDateString }));
  }, []);

  const updateOverallIfNeeded = (newState, changedField) => {
    if (["looks", "smell", "taste"].includes(changedField)) {
      const { looks, smell, taste } = newState;
      const avg = (Number(looks) + Number(smell) + Number(taste)) / 3;
      return {
        ...newState,
        overall: parseFloat(avg.toFixed(1)),
      };
    }
    return newState;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxGroupChange = (fieldName, optionValue) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      let newValues;
      if (currentValues.includes(optionValue)) {
        newValues = currentValues.filter((v) => v !== optionValue);
      } else {
        newValues = [...currentValues, optionValue];
      }
      return { ...prev, [fieldName]: newValues };
    });
  };

  const adjustSlider = (fieldName, delta, minVal, maxVal, step = 0.5) => {
    setFormData((prev) => {
      let newVal = Number(prev[fieldName]) + delta;
      if (newVal < minVal) newVal = minVal;
      if (newVal > maxVal) newVal = maxVal;
      newVal = parseFloat(newVal.toFixed(step === 0.1 ? 1 : 1));
      let newState = { ...prev, [fieldName]: newVal };
      newState = updateOverallIfNeeded(newState, fieldName);
      return newState;
    });
  };

  const handleSliderChange = (e, fieldName, step = 0.5) => {
    const newValue = parseFloat(e.target.value);
    setFormData((prev) => {
      let newState = { ...prev, [fieldName]: newValue };
      newState = updateOverallIfNeeded(newState, fieldName);
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create review object matching exact database column names
    const reviewData = {
      // Required fields matching DB columns exactly
      strain: formData.strain,
      type: formData.weedType,
      grower: formData.grower,
      location: formData.location,
      smoking_instrument: formData.smokingDevice, // Changed from smoking_device to smoking_instrument
      review_date: formData.date,
      reviewed_by: formData.reviewed_by,

      // Optional fields matching DB columns exactly
      grow_style: formData.grow_style?.join(", "),
      known_terps: formData.known_terps?.join(", "),
      inhale_terps: formData.inhale_terps?.join(", "),
      exhale_terps: formData.exhale_terps?.join(", "),
      flower_color: formData.flower_color?.join(", "),
      break_style: formData.break_style?.join(", "),
      overall_score: formData.overall || formData.overall_score || 0,
      notes: formData.notes || "",
      previous_rating: formData.previous_rating || 0,
      throat_hitter: Boolean(formData.throat_hitter),
      chest_punch: Boolean(formData.chest_punch),
      head_feel: Boolean(formData.head_feel),
      body_feel: Boolean(formData.body_feel),
      grand_champ: Boolean(formData.grand_champ),
      thc: formData.thc || 0,
      terps_percent: formData.terps_percent || 0,
      looks: formData.looks || 0,
      taste_rating: formData.taste || 0, // Changed from taste to taste_rating
      weed_type: formData.weedType,
      second_time_consistency: false, // Added missing field from DB
      high: "", // Added missing field from DB
      high_rating: 0, // Added missing field from DB
      smell: "", // Added missing field from DB
      smell_rating: 0, // Added missing field from DB
      bag_appeal: "", // Added missing field from DB
      bag_appeal_rating: 0, // Added missing field from DB
      terpenes: formData.known_terps?.join(", "), // Added missing field from DB
      terpene_percent: formData.terps_percent || 0, // Added missing field from DB
    };

    // Required fields based on exact DB column names
    const requiredFields = [
      "strain",
      "type",
      "grower",
      "location",
      "review_date",
      "reviewed_by",
      "smoking_instrument", // Updated to match DB column name
    ];

    const missingFields = requiredFields.filter((field) => !reviewData[field]);

    if (missingFields.length > 0) {
      setSubmitStatus({
        show: true,
        success: false,
        message: `❌ Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Convert arrays to strings for text fields
    Object.keys(reviewData).forEach((key) => {
      if (Array.isArray(reviewData[key])) {
        reviewData[key] = reviewData[key].join(", ");
      }
    });

    console.log("Submitting review data:", reviewData);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log("Response data:", responseData);
      } catch (e) {
        console.log("Could not parse response as JSON");
      }

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}. ${responseData?.error || ""}`,
        );
      }

      setSubmitStatus({
        show: true,
        success: true,
        message: "✅ Review submitted successfully!",
      });

      setTimeout(() => {
        setFormData(initialFormData);
        setSubmitStatus({ show: false, success: false, message: "" });
      }, 5000);
    } catch (error) {
      console.error("Full error:", error);
      setSubmitStatus({
        show: true,
        success: false,
        message: `❌ Error submitting review: ${error.message}`,
      });
    }
  };

  const handleClearScoreCard = () => {
    setScoreCard(initialScoreCard);
  };

  const handleTerpeneToggle = (terpene) => {
    setFormData((prev) => {
      const currentArray = Array.isArray(prev.known_terps)
        ? prev.known_terps
        : [];
      const newArray = currentArray.includes(terpene)
        ? currentArray.filter((t) => t !== terpene)
        : [...currentArray, terpene];

      return { ...prev, known_terps: newArray };
    });
  };

  const handleFlavorToggle = (flavor, field) => {
    setFormData((prev) => {
      const dbField =
        field === "tastedTerpsInhale" ? "inhale_terps" : "exhale_terps";
      const currentArray = Array.isArray(prev[dbField]) ? prev[dbField] : [];
      const newArray = currentArray.includes(flavor)
        ? currentArray.filter((f) => f !== flavor)
        : [...currentArray, flavor];

      return { ...prev, [dbField]: newArray };
    });
  };

  const handleStyleToggle = (style, field) => {
    setFormData((prev) => {
      const dbFieldMap = {
        growStyle: "grow_style",
        flowerColor: "flower_color",
        breakStyle: "break_style",
      };
      const dbField = dbFieldMap[field];
      const currentArray = Array.isArray(prev[dbField]) ? prev[dbField] : [];
      const newArray = currentArray.includes(style)
        ? currentArray.filter((s) => s !== style)
        : [...currentArray, style];

      return { ...prev, [dbField]: newArray };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6 flex justify-center items-center">
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-green-900 mb-6 flex items-center gap-2">
          <span>🌿</span>
          New Strain Review
        </h1>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <StrainSearchInput
            value={formData.strain}
            onChange={handleChange}
            required
          />

          <SelectInput
            label="Weed Type"
            name="weedType"
            value={formData.weedType}
            onChange={handleChange}
            required
            options={WEED_TYPES}
          />

          <SliderInput
            label="THC %"
            name="thc"
            value={formData.thc}
            onChange={(e) => handleSliderChange(e, "thc", 0.1)}
            onAdjust={(amount) => adjustSlider("thc", amount, 0, 100, 0.1)}
            max={100}
            step={0.1}
          />

          <div>
            <span className="block text-lg font-semibold mb-1">
              Known Terpenes
            </span>
            <div className="flex flex-wrap gap-2">
              {TERPENES.map((terpene) => (
                <button
                  key={terpene}
                  type="button"
                  onClick={() => handleTerpeneToggle(terpene)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.known_terps.includes(terpene)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {terpene}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-lg font-semibold mb-1">Grow Style</span>
            <div className="flex flex-wrap gap-2">
              {GROW_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style, "growStyle")}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.grow_style.includes(style)
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label="Total Terpene %"
            name="terps_percent"
            value={formData.terps_percent}
            onChange={(e) => handleSliderChange(e, "terps_percent", 0.01)}
            onAdjust={(amount) =>
              adjustSlider("terps_percent", amount, 0, 15, 0.01)
            }
            max={15}
            step={0.01}
          />

          <TextInput
            label="Grower"
            name="grower"
            value={formData.grower}
            onChange={handleChange}
            required
            placeholder="Grower"
          />

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Location"
          />

          <SelectInput
            label="Smoking Device"
            name="smokingDevice"
            value={formData.smokingDevice}
            onChange={handleChange}
            required
            options={SMOKING_DEVICES}
          />

          <div>
            <span className="block text-lg font-semibold mb-1">
              Flower Color
            </span>
            <div className="flex flex-wrap gap-2">
              {FLOWER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleStyleToggle(color, "flowerColor")}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.flower_color.includes(color)
                        ? "bg-pink-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-lg font-semibold mb-1">
              Break Style
            </span>
            <div className="flex flex-wrap gap-2">
              {BREAK_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style, "breakStyle")}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.break_style.includes(style)
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <SliderInput
            label="Looks"
            name="looks"
            value={formData.looks}
            onChange={(e) => handleSliderChange(e, "looks", 0.1)}
            onAdjust={(amount) => adjustSlider("looks", amount, 0, 10, 0.1)}
          />

          <SliderInput
            label="Smell"
            name="smell"
            value={formData.smell}
            onChange={(e) => handleSliderChange(e, "smell", 0.1)}
            onAdjust={(amount) => adjustSlider("smell", amount, 0, 10, 0.1)}
          />

          <SliderInput
            label="Taste"
            name="taste"
            value={formData.taste}
            onChange={(e) => handleSliderChange(e, "taste", 0.1)}
            onAdjust={(amount) => adjustSlider("taste", amount, 0, 10, 0.1)}
          />

          <SliderInput
            label="Overall"
            name="overall"
            value={formData.overall}
            onChange={(e) => handleSliderChange(e, "overall", 0.1)}
            onAdjust={(amount) => adjustSlider("overall", amount, 0, 10, 0.1)}
          />

          <div>
            <span className="block text-lg font-semibold mb-1">
              Tasted Flavors (Inhale)
            </span>
            <div className="flex flex-wrap gap-2">
              {TASTED_FLAVORS.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  onClick={() =>
                    handleFlavorToggle(flavor, "tastedTerpsInhale")
                  }
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.inhale_terps.includes(flavor)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-lg font-semibold mb-1">
              Tasted Flavors (Exhale)
            </span>
            <div className="flex flex-wrap gap-2">
              {TASTED_FLAVORS.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  onClick={() =>
                    handleFlavorToggle(flavor, "tastedTerpsExhale")
                  }
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${
                      formData.exhale_terps.includes(flavor)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              How'd it feel? 🤔
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    throat_hitter: !prev.throat_hitter,
                  }))
                }
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105
                  ${
                    formData.throat_hitter
                      ? "border-red-500 bg-red-100 text-red-700 shadow-lg"
                      : "border-gray-300 hover:border-red-300 hover:bg-red-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="font-semibold">Throat Hitter</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    chest_punch: !prev.chest_punch,
                  }))
                }
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105
                  ${
                    formData.chest_punch
                      ? "border-blue-500 bg-blue-100 text-blue-700 shadow-lg"
                      : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">👊</span>
                  <span className="font-semibold">Chest Puncher</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    head_feel: !prev.head_feel,
                  }))
                }
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105
                  ${
                    formData.head_feel
                      ? "border-green-500 bg-green-100 text-green-700 shadow-lg"
                      : "border-gray-300 hover:border-green-300 hover:bg-green-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span className="font-semibold">Head Feel</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    body_feel: !prev.body_feel,
                  }))
                }
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105
                  ${
                    formData.body_feel
                      ? "border-purple-500 bg-purple-100 text-purple-700 shadow-lg"
                      : "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <span className="font-semibold">Body Feel</span>
                </div>
              </button>
            </div>

            {/* Grand Champion Button - Centered Below */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    grand_champ: !prev.grand_champ,
                  }))
                }
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 w-64
                  ${
                    formData.grand_champ
                      ? "border-yellow-500 bg-yellow-100 text-yellow-700 shadow-lg scale-105"
                      : "border-gray-300 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">👑</span>
                  <span className="font-bold text-lg">Grand Champion</span>
                  {formData.grand_champ && (
                    <div className="text-sm text-yellow-600 animate-pulse">
                      Elite Status Achieved! ⭐
                    </div>
                  )}
                </div>
              </button>
            </div>

            {(formData.throat_hitter ||
              formData.chest_punch ||
              formData.head_feel ||
              formData.body_feel ||
              formData.grand_champ) && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900">
                  Selected Effects:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.throat_hitter && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      🔥 Throat Hitter
                    </span>
                  )}
                  {formData.chest_punch && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      👊 Chest Puncher
                    </span>
                  )}
                  {formData.head_feel && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      🧠 Head Feel
                    </span>
                  )}
                  {formData.body_feel && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      💪 Body Feel
                    </span>
                  )}
                  {formData.grand_champ && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      👑 Grand Champion
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <TextInput
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any extra details..."
          />

          <TextInput
            label="Reviewed By"
            name="reviewed_by"
            value={formData.reviewed_by}
            onChange={handleChange}
            required
            placeholder="Your Name"
          />

          <TextInput
            label="Date (EST)"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            type="date"
          />

          <SliderInput
            label="Previous Rating"
            name="previous_rating"
            value={formData.previous_rating}
            onChange={(e) => handleSliderChange(e, "previous_rating", 0.1)}
            onAdjust={(amount) =>
              adjustSlider("previous_rating", amount, 0, 10, 0.1)
            }
          />

          <PhotoUpload
            onPhotosUploaded={(photos) =>
              setFormData((prev) => ({ ...prev, photos }))
            }
            existingPhotos={formData.photos}
          />

          {submitStatus.show && (
            <div
              className={`p-4 rounded-lg text-center ${
                submitStatus.success
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <p className="text-lg font-semibold">{submitStatus.message}</p>
            </div>
          )}

          <button
            type="submit"
            className="mt-4 px-4 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default MasterReview;
