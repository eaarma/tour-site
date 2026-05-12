"use client";

import { ReactNode } from "react";

import Image from "next/image";

interface WelcomeImageProps {
  imageUrl: string;
  contentPosition?: "LEFT" | "CENTER" | "RIGHT";
  overlayStrength?: number;
  overlayColor?: string;
  children?: ReactNode;
  floatingContent?: ReactNode;
}

const contentPositionClasses = {
  LEFT: {
    container: "justify-start",
    content: "text-left",
  },
  CENTER: {
    container: "justify-center",
    content: "text-center",
  },
  RIGHT: {
    container: "justify-end",
    content: "text-right",
  },
} as const;

const WelcomeImage: React.FC<WelcomeImageProps> = ({
  imageUrl,
  contentPosition = "LEFT",
  overlayStrength = 36,
  overlayColor = "15, 23, 42",
  children,
  floatingContent,
}) => {
  const positionClasses = contentPositionClasses[contentPosition];
  const normalizedOverlayStrength = Math.min(100, Math.max(0, overlayStrength));
  const leadingOverlayOpacity = normalizedOverlayStrength / 100;
  const middleOverlayOpacity = leadingOverlayOpacity * 0.4;
  const overlayStyle = {
    backgroundImage: `linear-gradient(90deg, rgba(${overlayColor}, ${leadingOverlayOpacity.toFixed(2)}) 0%, rgba(${overlayColor}, ${middleOverlayOpacity.toFixed(2)}) 38%, rgba(${overlayColor}, 0) 72%)`,
  };

  return (
    <div className="full-bleed relative z-30 w-full">
      <div className="relative h-64 w-full overflow-hidden sm:h-72 sm:rounded-xl md:h-80 lg:h-[24rem]">
        <Image
          src={imageUrl}
          alt="Guided hiking tours in Croatia"
          fill
          priority
          className="object-cover object-[center_62%]"
        />
        <div className="absolute inset-0" style={overlayStyle} />

        {children ? (
          <div
            className={`absolute inset-x-0 bottom-10 z-10 flex px-4 sm:bottom-12 sm:px-6 md:bottom-20 lg:bottom-[24%] lg:px-8 ${positionClasses.container}`}
          >
            <div
              className={`pointer-events-auto w-full max-w-3xl ${positionClasses.content}`}
            >
              {children}
            </div>
          </div>
        ) : null}
      </div>

      {floatingContent ? (
        <div className="relative z-20 mx-auto -mt-8 w-11/12 max-w-3xl sm:-mt-9">
          {floatingContent}
        </div>
      ) : null}
    </div>
  );
};

export default WelcomeImage;
