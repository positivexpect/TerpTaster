import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Master Review",
      description: "Complete strain analysis with terpene profiling",
      icon: "⭐",
      route: "/master-review",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "Quick Review",
      description: "Fast strain reviews with photo upload",
      icon: "📝",
      route: "/basic-review",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Quick Score",
      description: "Rapid terpene taste scoring",
      icon: "⚡",
      route: "/quick-score",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      title: "Search Reviews",
      description: "Find and filter strain reviews",
      icon: "🔍",
      route: "/search",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Terp Training",
      description: "Learn terpene profiles and effects",
      icon: "🎓",
      route: "/training",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16 text-center">
          {/* Main Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fe3768294f4a94f4fbef5c197119b2d02%2Ffe3bcc97fa4e4bfeb384f1fcf40350fb?format=webp&width=400"
              alt="TerpTaster Logo"
              className="h-32 w-32 md:h-40 md:w-40 rounded-2xl shadow-2xl border-4 border-white/20"
            />
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            <span className="bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
              Terp Taster
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto font-light">
            The ultimate cannabis strain review platform with terpene analysis,
            photo uploads, and community insights
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-12 text-center">
            <div className="text-white">
              <div className="text-2xl font-bold text-green-300">🌿</div>
              <div className="text-sm opacity-80">Strain Reviews</div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold text-purple-300">🧪</div>
              <div className="text-sm opacity-80">Terpene Analysis</div>
            </div>
            <div className="text-white">
              <div className="text-2xl font-bold text-blue-300">📸</div>
              <div className="text-sm opacity-80">Photo Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              onClick={() => navigate(feature.route)}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to start reviewing?
            </h3>
            <p className="text-purple-100 mb-6">
              Join the community and share your cannabis experiences
            </p>
            <button
              onClick={() => navigate("/basic-review")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your First Review 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ feature, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
  >
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <span className="text-2xl">{feature.icon}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
        {feature.title}
      </h3>

      <p className="text-purple-100 text-sm leading-relaxed">
        {feature.description}
      </p>

      <div className="mt-4 flex items-center text-green-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Get Started
        <svg
          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default Home;
