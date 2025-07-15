import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import MasterReview from "./components/MasterReview";
import BasicReview from "./components/BasicReview";
import SearchReviews from "./components/SearchReviews";
import TerpTraining from "./components/TerpTraining";
import TerpTasteQuickScore from "./components/TerpTasteQuickScore";
import NavBar from "./components/NavBar";

function App() {
  return (
    <Router>
      <div className="app min-h-screen bg-gray-100">
        <NavBar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/master-review" element={<MasterReview />} />
            <Route path="/basic-review" element={<BasicReview />} />
            <Route path="/quick-score" element={<TerpTasteQuickScore />} />
            <Route path="/search" element={<SearchReviews />} />
            <Route path="/training" element={<TerpTraining />} />
            <Route path="*" element={<h1 className="text-center text-red-600 text-3xl">404 - Not Found</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
