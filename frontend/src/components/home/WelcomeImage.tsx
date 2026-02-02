"use client";

import { ReactNode } from "react";

interface WelcomeImageProps {
  imageUrl: string;
  children?: ReactNode;
}

const WelcomeImage: React.FC<WelcomeImageProps> = ({ imageUrl, children }) => {
  return (
    <div className="relative w-full z-20">
      {/* Hero image */}
      <div className="w-full h-50 sm:h-60 md:h-70 lg:h-80 sm:rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          className="
    w-full h-full object-cover shadow-md sm:rounded-xl
    scale-120
    object-[50%_80%] sm:object-[50%_65%]
  "
        />
      </div>

      {/* Overlay children (e.g. SearchBar) */}
      {children && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-10 sm:bottom-1 translate-y-full sm:translate-y-1/2 w-11/12 max-w-3xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default WelcomeImage;
