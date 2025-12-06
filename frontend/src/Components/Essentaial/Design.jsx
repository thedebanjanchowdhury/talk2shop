import React, { useState, useEffect, useCallback } from "react";

const images = [
  { src: "/1.png", alt: "AI Chatbot Interface", duration: 5000 }, // 5s
  { src: "/2.png", alt: "New Product Launch", duration: 8000 },    // 8s
  { src: "/3.png", alt: "Sales Promotion", duration: 8000 },       // 8s
];

export default function Design() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, []);

  // --- Auto slide with custom duration ---
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(goNext, images[current].duration);
    return () => clearTimeout(timer);
  }, [current, paused, goNext]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* --- Carousel Wrapper --- */}
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 object-cover"
            />
          </div>
        ))}
      </div>

      {/* --- Indicators --- */}
      <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current
                ? "bg-white scale-110 ring-2 ring-blue-500"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* --- Controls --- */}
      <button
        onClick={goPrev}
        className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        aria-label="Previous slide"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white">
          <svg
            className="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        onClick={goNext}
        className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        aria-label="Next slide"
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white">
          <svg
            className="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}
