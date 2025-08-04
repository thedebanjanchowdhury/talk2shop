"use client";
import { ContainerTextFlip } from "../ui/container-text-flip";
import { motion } from "motion/react";
import { cn } from "../../lib/util";
import { Button } from "@heroui/react";

export function HeroText() {
  const words = ["automated", "intelligent", "personalized", "seamless"];
  return (
    <div className="">
      <motion.h1
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        className={cn(
          "relative mb-6 max-w-xl text-left text-4xl leading-normal font-bold tracking-tight text-zinc-700 md:text-7xl dark:text-zinc-100"
        )}
        layout
      >
        <div className="inline-block">
          Experience <ContainerTextFlip words={words} /> AI shopping today!
        </div>
      </motion.h1>
    </div>
  );
}
