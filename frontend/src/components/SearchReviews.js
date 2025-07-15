import { useState, useEffect } from "react";
import API_BASE_URL from "../config";

const SearchReviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [error, setError] = useState(null);
  const [showTop10, setShowTop10] = useState(false);

  // Fetch all reviews when component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  // Real-time search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredReviews(allReviews);
    } else {
      const filtered = allReviews.filter(review => 
        review.strain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.grower?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(review.known_terps) && 
          review.known_terps.some(terp => 
            terp.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
      setFilteredReviews(filtered);
    }
  }, [searchTerm, allReviews]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Debug the first review to see the data structure
      if (data.length > 0) {
        console.log("Sample review data:", {
          known_terps: data[0].known_terps,
          inhale: data[0].tasted_terps_inhale,
          exhale: data[0].tasted_terps_exhale
        });
      }
      
      setAllReviews(data);
      setFilteredReviews(data);
    } catch (err) {
      setError("Error fetching reviews. Please try again later.");
      console.error("Error fetching reviews:", err);
    }
  };

  const getTop10Reviews = () => {
    return [...allReviews]
      .sort((a, b) => b.overall_score - a.overall_score)
      .slice(0, 10);
  };

  const getDisplayedReviews = () => {
    if (showTop10) {
      return getTop10Reviews();
    }
    return filteredReviews;
  };

  // Update the debug function to be more defensive
  const debugArrayField = (field, value) => {
    console.log(`Debug ${field}:`, {
      raw: value,
      isArray: Array.isArray(value),
      type: typeof value
    });
  };

  // Update the parseTerpArray function to clean the values
  const parseTerpArray = (value) => {
    // If it's already an array, return it cleaned
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'string') {
          // Remove any quotes, braces, and extra whitespace
          return item.replace(/[{}"]/g, '').trim();
        }
        return item;
      });
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // If the string is empty or null/undefined, return empty array
      if (!value) return [];
      
      try {
        // Remove any outer braces and split by commas
        const cleanString = value.replace(/[{}]/g, '');
        
        // If it looks like JSON, try to parse it
        if (cleanString.includes('[') || cleanString.includes('"')) {
          const parsed = JSON.parse(cleanString);
          return Array.isArray(parsed) ? parsed.map(item => item.toString().replace(/[{}"]/g, '').trim()) : [];
        }
        
        // Otherwise split by comma and clean each item
        return cleanString
          .split(',')
          .map(item => item.replace(/[{}"]/g, '').trim())
          .filter(Boolean);
      } catch (e) {
        console.warn(`Error parsing value for field:`, e);
        // If parsing fails, just split by comma and clean
        return value
          .split(',')
          .map(item => item.replace(/[{}"]/g, '').trim())
          .filter(Boolean);
      }
    }
    
    return [];
  };

  // Update the renderReviewDetails function to handle potential string arrays
  const renderReviewDetails = (review) => {
    // Debug the fields without trying to parse
    debugArrayField('known_terps', review.known_terps);
    debugArrayField('tasted_terps_inhale', review.tasted_terps_inhale);
    debugArrayField('tasted_terps_exhale', review.tasted_terps_exhale);

    // Parse the arrays safely
    const knownTerps = parseTerpArray(review.known_terps);
    const inhaleFlavors = parseTerpArray(review.tasted_terps_inhale);
    const exhaleFlavors = parseTerpArray(review.tasted_terps_exhale);

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h3 className="text-2xl font-bold text-green-900 mb-4">Review Details</h3>
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <p className="text-lg"><strong>Strain:</strong> {review.strain}</p>
          <p className="text-lg"><strong>Location:</strong> {review.location}</p>
          <p className="text-lg"><strong>Type:</strong> {review.weed_type}</p>
          <p className="text-lg"><strong>Grower:</strong> {review.grower}</p>
          <p className="text-lg"><strong>THC:</strong> {review.thc}%</p>
          <p className="text-lg"><strong>Device:</strong> {review.smoking_instrument}</p>
        </div>

        {/* Ratings Section */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h4 className="text-xl font-semibold mb-2">Ratings</h4>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-lg"><strong>Looks:</strong> {review.looks}/10</p>
            <p className="text-lg"><strong>Smell:</strong> {review.smell_rating}/10</p>
            <p className="text-lg"><strong>Taste:</strong> {review.taste_rating}/10</p>
            <p className="text-lg"><strong>Overall:</strong> {review.overall_score}/10</p>
          </div>
        </div>

        {/* Terpene Profile section */}
        <div className="bg-purple-100 p-4 rounded-lg mb-4">
          <h4 className="text-xl font-semibold mb-2">Terpene Profile</h4>
          <div className="space-y-4">
            {/* Known Terpenes */}
            <div>
              <p className="font-semibold mb-2">Known Terpenes:</p>
              <div className="flex flex-wrap gap-2">
                {knownTerps.length > 0 ? (
                  knownTerps.map(terp => (
                    <span key={terp} className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm font-medium">
                      {terp}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No terpenes listed</span>
                )}
              </div>
            </div>

            <p className="text-lg"><strong>Terpene %:</strong> {review.terps_percent}%</p>

            {/* Inhale Flavors */}
            <div>
              <p className="font-semibold mb-2">Inhale Flavors:</p>
              <div className="flex flex-wrap gap-2">
                {inhaleFlavors.length > 0 ? (
                  inhaleFlavors.map(flavor => (
                    <span key={flavor} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {flavor}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No inhale flavors listed</span>
                )}
              </div>
            </div>

            {/* Exhale Flavors */}
            <div>
              <p className="font-semibold mb-2">Exhale Flavors:</p>
              <div className="flex flex-wrap gap-2">
                {exhaleFlavors.length > 0 ? (
                  exhaleFlavors.map(flavor => (
                    <span key={flavor} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {flavor}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No exhale flavors listed</span>
                )}
              </div>
            </div>
            
            {/* Terpene Score Display */}
            {review.terp_score && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">Terpene Score: {review.terp_score}%</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    review.terp_grade === 'A' ? 'bg-green-100 text-green-700' :
                    review.terp_grade === 'B' ? 'bg-blue-100 text-blue-700' :
                    review.terp_grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                    review.terp_grade === 'D' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Grade: {review.terp_grade}
                    {review.terp_grade === 'A' && review.terp_score >= 98 && '+'}
                    {review.terp_grade === 'A' && ' 🏆'}
                    {review.terp_grade === 'B' && ' 🥈'}
                    {review.terp_grade === 'C' && ' 🥉'}
                    {review.terp_grade === 'D' && ' ⚠️'}
                    {review.terp_grade === 'F' && ' ❌'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <p className="text-lg"><strong>Reviewed By:</strong> {review.reviewed_by}</p>
          <p className="text-lg"><strong>Date:</strong> {new Date(review.review_date).toLocaleDateString()}</p>
          {review.notes && (
            <div>
              <p className="text-lg font-semibold">Notes:</p>
              <p className="text-lg italic">{review.notes}</p>
            </div>
          )}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={() => setSelectedReview(null)}
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-green-900 mb-6 flex items-center gap-2">
            <span>🔍</span> Search Reviews
          </h2>
          
          {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by strain, grower, location, or terpenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              onClick={() => setShowTop10(!showTop10)}
            >
              {showTop10 ? "Show All Reviews" : "Show Top 10"}
            </button>
          </div>

          <div className="grid gap-4">
            {getDisplayedReviews().length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Showing {getDisplayedReviews().length} {showTop10 ? "top" : ""} reviews
                </p>
                {getDisplayedReviews().map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <p className="text-lg">
                        <span className="font-semibold text-green-900">Strain:</span>{' '}
                        {review.strain}
                      </p>
                      <p className="text-lg">
                        <span className="font-semibold text-green-900">Location:</span>{' '}
                        {review.location}
                      </p>
                      <p className="text-lg">
                        <span className="font-semibold text-green-900">Overall:</span>{' '}
                        {review.overall_score}/10
                      </p>
                      {review.terp_score && (
                        <p className="text-lg">
                          <span className="font-semibold text-purple-900">Terp Grade:</span>{' '}
                          {review.terp_grade} ({review.terp_score}%)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-red-500 font-semibold text-center">
                {searchTerm ? "No matching reviews found." : "No reviews available."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedReview && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          {renderReviewDetails(selectedReview)}
        </div>
      )}
    </div>
  );
};

export default SearchReviews;
