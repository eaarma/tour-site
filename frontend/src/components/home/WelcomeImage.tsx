"use client";

import { ReactNode } from "react";

interface WelcomeImageProps {
  imageUrl: string;
  children?: ReactNode;
}

const WelcomeImage: React.FC<WelcomeImageProps> = ({ imageUrl, children }) => {
  return (
    <div className="relative w-full">
      {/* Hero image */}
      <div className="w-full h-50 sm:h-60 md:h-70 lg:h-80">
        <img
          src={imageUrl}
          alt="Welcome"
          className="w-full h-full object-cover rounded-xl shadow-md"
        />
      </div>

      {/* Overlay children (e.g. SearchBar) */}
      {children && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-11/12 max-w-3xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default WelcomeImage;
