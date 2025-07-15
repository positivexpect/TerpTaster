import React, { useState, useEffect } from 'react';
import terpeneData from '../data/terpenes.json';

// Create expanded profiles from the terpene data
const createTerpeneProfiles = () => {
  const profiles = [];
  terpeneData.terpenes.forEach(terpene => {
    terpene.possibleFlavors.forEach(flavor => {
      profiles.push({
        name: terpene.name,
        flavor: flavor,
        effects: terpene.effects,
        funFact: terpene.funFact,
        notableStrains: terpene.notableStrains
      });
    });
  });
  return profiles;
};

const terpeneProfiles = createTerpeneProfiles();

const getRandomProfile = () => terpeneProfiles[Math.floor(Math.random() * terpeneProfiles.length)];

const getRandomOptions = (correctProfile) => {
  const options = [correctProfile];
  while (options.length < 4) {
    const randomProfile = getRandomProfile();
    if (!options.some(option => 
      option.name === randomProfile.name && 
      option.flavor === randomProfile.flavor
    )) {
      options.push(randomProfile);
    }
  }
  return options.sort(() => Math.random() - 0.5); // Shuffle the options
};

const TerpTraining = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(getRandomProfile());
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [hints, setHints] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [streak, setStreak] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (difficulty === 'Multiple Choice') {
      setIsLoading(true);
      setMultipleChoiceOptions(getRandomOptions(currentProfile));
      setIsLoading(false);
    }
  }, [currentProfile, difficulty]);

  const handleGuess = (e, selectedFlavor = null) => {
    e.preventDefault();
    setShowDetails(true);
    setInputDisabled(true);
    
    const userGuess = selectedFlavor || guess.trim();
    if (userGuess.toLowerCase() === currentProfile.flavor.toLowerCase()) {
      setFeedback(`✅ Correct! The flavor of ${currentProfile.name} is ${currentProfile.flavor}.`);
      setStreak(streak + 1);
    } else {
      setFeedback(`❌ Wrong! The correct flavor for ${currentProfile.name} is ${currentProfile.flavor}.`);
      setStrikes(strikes + 1);
      setStreak(0);
    }
    setGuess('');
  };

  const handleHint = () => {
    if (hintsUsed < 3) {
      const hintOptions = [currentProfile.effects, currentProfile.funFact, currentProfile.notableStrains];
      setHints([...hints, hintOptions[hintsUsed]]);
      setHintsUsed(hintsUsed + 1);
    }
  };

  const handleNext = () => {
    setCurrentProfile(getRandomProfile());
    setFeedback('');
    setHints([]);
    setHintsUsed(0);
    setGuess('');
    setShowDetails(false);
    setInputDisabled(false);
  };

  const handleTryAgain = () => {
    setStrikes(0);
    setStreak(0);
    setHintsUsed(0);
    handleNext();
  };

  const handleDifficultyChange = () => {
    setDifficulty(null);
    setStrikes(0);
    setStreak(0);
    setHintsUsed(0);
    setFeedback('');
    setHints([]);
    setShowDetails(false);
    setInputDisabled(false);
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6 flex items-center justify-center">
        <div className="container mx-auto">
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 w-full max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-green-900 mb-6 text-center">Select Difficulty</h2>
            <button onClick={() => setDifficulty('Just Learning')} className="w-full p-4 mb-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Just Learning</button>
            <button onClick={() => setDifficulty('Multiple Choice')} className="w-full p-4 mb-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Multiple Choice</button>
            <button onClick={() => setDifficulty('Expert Mode')} className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700">Expert Mode</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-purple-600 to-pink-500 p-6 flex items-center justify-center">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 w-full max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-green-900 mb-6 text-center">🌿 Terp Training Game ({difficulty})</h2>

          <p className="text-lg text-gray-800 text-center mb-4">
            {difficulty !== 'Just Learning' && `Guess the flavor or scent of the terpene: `}
            <strong>{currentProfile.name}</strong>
          </p>

          {feedback && (
            <p className={`mt-4 text-lg font-semibold text-center ${feedback.includes('✅') ? 'text-green-700' : 'text-red-600'}`}>
              {feedback}
            </p>
          )}

          {difficulty === 'Just Learning' && (
            <div className="mt-4 text-lg">
              <p><strong>Flavor:</strong> {currentProfile.flavor}</p>
              <p><strong>Effects:</strong> {currentProfile.effects}</p>
              <p><strong>Fun Fact:</strong> {currentProfile.funFact}</p>
              <p><strong>Notable Strains:</strong> {currentProfile.notableStrains}</p>
              <button onClick={handleNext} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Next</button>
            </div>
          )}

          {difficulty === 'Multiple Choice' && !showDetails && (
            <div className="grid gap-2">
              {isLoading ? (
                <p className="text-center">Loading options...</p>
              ) : (
                multipleChoiceOptions.map((option) => (
                  <button
                    key={option.name + option.flavor}
                    onClick={(e) => handleGuess(e, option.flavor)}
                    disabled={inputDisabled}
                    className="w-full p-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    {option.flavor}
                  </button>
                ))
              )}
            </div>
          )}

          {difficulty === 'Expert Mode' && !showDetails && (
            <form onSubmit={handleGuess} className="grid gap-4">
              <input
                type="text"
                placeholder="Enter your guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                disabled={inputDisabled}
                className="w-full p-2 rounded border"
                required
              />
              <button
                type="submit"
                disabled={inputDisabled}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Submit
              </button>
            </form>
          )}

          {difficulty !== 'Just Learning' && (
            <>
              <button
                onClick={handleHint}
                disabled={hintsUsed >= 3 || inputDisabled}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Need a Hint? ({3 - hintsUsed} left)
              </button>

              {hints.map((hint, index) => (
                <p key={index} className="mt-2 text-lg font-semibold text-center text-blue-700">
                  Hint {index + 1}: {hint}
                </p>
              ))}

              {showDetails && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-100">
                  <p><strong>Effects:</strong> {currentProfile.effects}</p>
                  <p><strong>Fun Fact:</strong> {currentProfile.funFact}</p>
                  <p><strong>Notable Strains:</strong> {currentProfile.notableStrains}</p>
                </div>
              )}

              {strikes >= 3 ? (
                <div className="mt-6 text-center">
                  <p className="text-red-700 text-2xl font-bold">❌ FAIL</p>
                  <button
                    onClick={handleTryAgain}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                showDetails && (
                  <button
                    onClick={handleNext}
                    className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Next
                  </button>
                )
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <p className="text-lg text-red-600 text-center">
                  Strikes: {strikes} / 3
                </p>
                <p className="text-lg text-green-700 text-center">
                  Streak: {streak}
                </p>
              </div>
            </>
          )}

          <button 
            onClick={handleDifficultyChange}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Change Difficulty
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerpTraining;
