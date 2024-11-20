import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Swap from "./Swap"; // Import your Swap component (if you have one)
import AddLiquidity from "./Liquidity";
import { Header } from "./Header";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Define different routes for your components */}
        <Route path="/" element={<Swap />} /> {/* Default route for the Swap component */}
        <Route path="/liquidity" element={<AddLiquidity />} /> {/* Route for adding liquidity */}
      </Routes>
    </Router>
  );
};

export default App;
