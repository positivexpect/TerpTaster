import React, { useState, useEffect, useRef } from 'react';
import strainsData from '../strains_data.json';

const StrainSearchInput = ({ value, onChange, onSelect, required }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e);

    // Search for matching strains
    if (inputValue.length > 1) {
      const matches = strainsData
        .filter(strain => 
          strain["Strain Name"].toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectStrain = (strain) => {
    onChange({ target: { name: 'strain', value: strain["Strain Name"] } });
    setSelectedStrain(strain);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(strain);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow" ref={wrapperRef}>
      <label className="block text-lg font-semibold mb-3 text-gray-700">
        Strain Name
      </label>
      <div className="relative">
        <input
          name="strain"
          value={value}
          onChange={handleInputChange}
          required={required}
          placeholder="Enter strain name"
          className="w-full p-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {suggestions.map((strain, index) => (
              <div
                key={`${strain["Strain Name"]}-${index}`}
                onClick={() => selectStrain(strain)}
                className="p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-semibold text-purple-900">{strain["Strain Name"]}</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Breeder:</span> {strain.Breeder} | 
                  <span className="font-medium ml-2">Type:</span> {strain.Type} |
                  <span className="font-medium ml-2">Genetics:</span> {strain.Genetics}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected strain info */}
      {selectedStrain && (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
          <div className="font-semibold text-purple-900">{selectedStrain["Strain Name"]}</div>
          <div className="text-sm text-gray-600 mt-1">
            <div><span className="font-medium">Breeder:</span> {selectedStrain.Breeder}</div>
            <div><span className="font-medium">Genetics:</span> {selectedStrain.Genetics}</div>
            <div><span className="font-medium">Flowering Time:</span> {selectedStrain["Flowering Time (Days)"]} days</div>
            <div><span className="font-medium">Type:</span> {selectedStrain.Type}</div>
          </div>
          {selectedStrain.URL && (
            <a
              href={selectedStrain.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block"
            >
              View More Info →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default StrainSearchInput; 