"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface WelcomeImageProps {
  imageUrl: string;
  children?: ReactNode;
}

const WelcomeImage: React.FC<WelcomeImageProps> = ({ imageUrl, children }) => {
  return (
    <div className="relative w-full z-30">
      {/* Hero image */}
      <div className="relative w-full h-60 sm:h-70 md:h-80 lg:h-90 sm:rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
    object-cover shadow-md sm:rounded-xl
    scale-100
    object-[50%_50%] sm:object-[50%_60%] sm:-translate-x-[1.5%]
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
