import React from "react";
import { Button, ConfigProvider } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";

const theme = {
  token: {
    colorBg: "#fcedd8",
    colorText: "#b0183d",
    colorPrimary: "#ffd464",
    colorSecondary: "#ff5e5e",
    colorAccent: "#e23c64",
  },
};

const App = () => {
  return (
    <Router>
      <div className="w-full h-screen p-4 bg-colorBg flex flex-col items-center justify-center font-['GeneralSans-Regular']">
        {/* <Navbar /> */}

        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
