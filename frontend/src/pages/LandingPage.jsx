import React from "react";
import { NavbarComponent } from "../components/Dashboard/NavbarComponent";
import { HeroText } from "../components/Dashboard/HeroText";
import { Card, CardFooter, Image, Button } from "@heroui/react";

function HeroCard() {
  return (
    <div className="">
      <Card isFooterBlurred className="border-none" radius="xl">
        <Image
          alt="Woman listing to music"
          className="object-cover"
          height={300}
          src="../src/assets/heroImage.jpeg"
          width={350}
          fit="cover"
          radius="lg"
        />
        <CardFooter className="justify-between h-20 px-2 border-white/20 border-1 gap-2 overflow-hidden py-1 absolute rounded-xl bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10 bg-white/10 backdrop-blur-md">
          <p className="text-md max-w-30 ml-4 font-semibold text-white/80">
            NVIDIA GeForce RTX 5090
          </p>
          <Button
            className="text-lg font-semibold text-white hover:text-black bg-black py-2 hover:bg-white/80 transition-all duration-100 ease-in"
            color="default"
            radius="lg"
            size="lg"
            variant="flat"
          >
            Buy Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function LandingPage() {
  return (
    <div>
      <NavbarComponent />
      <div className="mt-14 p-10 flex items-center justify-center gap-8">
        <HeroText />
        <Button
          color="primary"
          variant="solid"
          className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg"
        >
          Get Started
        </Button>
        <HeroCard />
      </div>
    </div>
  );
}

export default LandingPage;
