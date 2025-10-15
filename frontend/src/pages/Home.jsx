import React from "react";
import Navbar from "../components/common/Navbar";

const Home = () => {
  return (
    <div className="w-full h-screen flex flex-col gap-[8vw] items-center">
      <Navbar />

      <div className="text-center flex flex-col gap-8">
        <h1 className="text-8xl  font-bold">
          Next Level <br />{" "}
          <span className="text-colorAccent font-[GeneralSans-BoldItalic]">
            Shopping
          </span>{" "}
          Experience
        </h1>
        <p className="text-xl opacity-50">
          Experience the future of shopping, powered by AI
        </p>
      </div>
    </div>
  );
};

export default Home;
