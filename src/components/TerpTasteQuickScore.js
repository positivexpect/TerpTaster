import React, { useState, useEffect, useCallback } from 'react';
import terpeneData from '../data/terpenes.json';

// Get terpenes from our JSON data
const TERPENES = terpeneData.terpenes.map(t => t.name).sort();

// Get unique flavors from our JSON data
const TASTED_FLAVORS = [...new Set(
  terpeneData.terpenes.flatMap(t => t.possibleFlavors)
)].sort();

// Create flavor to terpenes mapping from our JSON data
const flavorToTerpenes = {};
terpeneData.terpenes.forEach(terpene => {
  terpene.possibleFlavors.forEach(flavor => {
    if (!flavorToTerpenes[flavor]) {
      flavorToTerpenes[flavor] = [];
    }
    flavorToTerpenes[flavor].push(terpene.name);
  });
});

const TerpTasteQuickScore = () => {
  const [selectedTerpenes, setSelectedTerpenes] = useState([]);
  const [inhaleFlavors, setInhaleFlavors] = useState([]);
  const [exhaleFlavors, setExhaleFlavors] = useState([]);
  const [showExpectedFlavors, setShowExpectedFlavors] = useState(false);
  const [scoreCard, setScoreCard] = useState(null);

  const calculateScore = useCallback(() => {
    const allTastedFlavors = [...new Set([...inhaleFlavors, ...exhaleFlavors])];
    let matchedTerpenes = new Set();
    let totalPossibleMatches = selectedTerpenes.length;
    let correctMatches = 0;

    // For each selected terpene
    selectedTerpenes.forEach(terpene => {
      // Get all possible flavors for this terpene
      const terpData = terpeneData.terpenes.find(t => t.name === terpene);
      if (terpData) {
        // If any of the tasted flavors match this terpene's possible flavors, count it as correct
        const hasMatch = allTastedFlavors.some(flavor => 
          terpData.possibleFlavors.includes(flavor)
        );
        if (hasMatch) {
          correctMatches++;
          matchedTerpenes.add(terpene);
        }
      }
    });

    // Calculate score based on terpene matches
    const score = totalPossibleMatches > 0 
      ? (correctMatches / totalPossibleMatches) * 100 
      : 0;

    return {
      score: Math.round(score),
      matchedTerpenes: Array.from(matchedTerpenes),
      correctMatches,
      totalPossibleMatches,
      identifiedFlavors: allTastedFlavors
    };
  }, [selectedTerpenes, inhaleFlavors, exhaleFlavors]);

  useEffect(() => {
    if (selectedTerpenes.length > 0 && (inhaleFlavors.length > 0 || exhaleFlavors.length > 0)) {
      setScoreCard(calculateScore());
    } else {
      setScoreCard(null);
    }
  }, [selectedTerpenes, inhaleFlavors, exhaleFlavors, calculateScore]);

  // Get all possible flavors for selected terpenes
  const getPotentialFlavors = () => {
    const potentialFlavors = new Set();
    selectedTerpenes.forEach(terpName => {
      const terpData = terpeneData.terpenes.find(t => t.name === terpName);
      if (terpData) {
        terpData.possibleFlavors.forEach(flavor => potentialFlavors.add(flavor));
      }
    });
    return Array.from(potentialFlavors);
  };

  const handleTerpeneToggle = (terpene) => {
    setSelectedTerpenes(prev => {
      if (prev.includes(terpene)) {
        return prev.filter(t => t !== terpene);
      }
      return [...prev, terpene];
    });
  };

  const handleFlavorToggle = (flavor, type) => {
    const setFlavors = type === 'inhale' ? setInhaleFlavors : setExhaleFlavors;
    setFlavors(prev => {
      if (prev.includes(flavor)) {
        return prev.filter(f => f !== flavor);
      }
      return [...prev, flavor];
    });
  };

  const handleReset = () => {
    setSelectedTerpenes([]);
    setInhaleFlavors([]);
    setExhaleFlavors([]);
    setScoreCard(null);
    setShowExpectedFlavors(false);
  };

  const renderPreview = () => (
    <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-purple-900">Analysis</h3>
      
      <div className="grid gap-6">
        {/* Selected Terpenes Section */}
        <div>
          <h4 className="font-semibold text-lg text-purple-700 mb-2">Selected Terpenes:</h4>
          {selectedTerpenes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTerpenes.map(terpene => (
                <span key={terpene} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {terpene}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Select terpenes to begin analysis</p>
          )}
        </div>

        {/* Expected Flavors Section */}
        {selectedTerpenes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg text-orange-700">Expected Flavors:</h4>
              <button
                onClick={() => setShowExpectedFlavors(!showExpectedFlavors)}
                className="px-3 py-1 text-sm font-semibold rounded-full transition
                  bg-orange-100 text-orange-700 hover:bg-orange-200"
              >
                {showExpectedFlavors ? 'Hide Expected' : 'Show Expected'} 🎯
              </button>
            </div>
            {showExpectedFlavors ? (
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {getPotentialFlavors().map(flavor => (
                    <span key={flavor} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Click to reveal expected flavors</p>
            )}
          </div>
        )}

        {/* Your Tasted Flavors */}
        {(inhaleFlavors.length > 0 || exhaleFlavors.length > 0) && (
          <div>
            <h4 className="font-semibold text-lg text-green-700 mb-2">Your Tasted Flavors:</h4>
            <div className="space-y-3">
              {inhaleFlavors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">On Inhale:</p>
                  <div className="flex flex-wrap gap-2">
                    {inhaleFlavors.map(flavor => (
                      <span key={flavor} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {exhaleFlavors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">On Exhale:</p>
                  <div className="flex flex-wrap gap-2">
                    {exhaleFlavors.map(flavor => (
                      <span key={flavor} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-time Score Card */}
        {scoreCard && (
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-purple-900">Real-time Score:</h4>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition flex items-center gap-2"
              >
                <span>🔄</span> Reset
              </button>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <strong>Grade:</strong>{' '}
                <span className={`text-3xl font-bold flex items-center gap-2 ${
                  scoreCard.score >= 90 ? 'text-green-600' :
                  scoreCard.score >= 80 ? 'text-blue-600' :
                  scoreCard.score >= 70 ? 'text-yellow-600' :
                  scoreCard.score >= 60 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {scoreCard.score >= 90 ? 'A' : scoreCard.score >= 80 ? 'B' : scoreCard.score >= 70 ? 'C' : scoreCard.score >= 60 ? 'D' : 'F'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Accuracy:</strong>{' '}
                <span className={`text-lg font-semibold ${
                  scoreCard.score >= 90 ? 'text-green-600' :
                  scoreCard.score >= 80 ? 'text-blue-600' :
                  scoreCard.score >= 70 ? 'text-yellow-600' :
                  scoreCard.score >= 60 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {scoreCard.score}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Matches:</strong>{' '}
                <span className="text-lg">
                  {scoreCard.correctMatches} of {scoreCard.totalPossibleMatches}
                </span>
              </div>
              <div className="mt-2 text-sm text-purple-700 font-medium">
                {scoreCard.score >= 90 && '🌟 Outstanding palate!'}
                {scoreCard.score >= 80 && scoreCard.score < 90 && '✨ Great tasting skills!'}
                {scoreCard.score >= 70 && scoreCard.score < 80 && '👍 Good effort!'}
                {scoreCard.score >= 60 && scoreCard.score < 70 && '🔍 Keep practicing!'}
                {scoreCard.score < 60 && '📚 Time to train your palate!'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-green-900 mb-6">
            🌿 Quick Terp Taste Score
          </h2>

          {/* Known Terpenes Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Select Known Terpenes:</h3>
            <div className="flex flex-wrap gap-2">
              {TERPENES.map((terpene) => (
                <button
                  key={terpene}
                  onClick={() => handleTerpeneToggle(terpene)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${selectedTerpenes.includes(terpene)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {terpene}
                </button>
              ))}
            </div>
          </div>

          {/* Inhale Flavors Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Select Inhale Flavors:</h3>
            <div className="flex flex-wrap gap-2">
              {TASTED_FLAVORS.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => handleFlavorToggle(flavor, 'inhale')}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${inhaleFlavors.includes(flavor)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Exhale Flavors Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Select Exhale Flavors:</h3>
            <div className="flex flex-wrap gap-2">
              {TASTED_FLAVORS.map((flavor) => (
                <button
                  key={flavor}
                  onClick={() => handleFlavorToggle(flavor, 'exhale')}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition
                    ${exhaleFlavors.includes(flavor)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Section */}
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default TerpTasteQuickScore; 