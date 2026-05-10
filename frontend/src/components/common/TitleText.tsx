"use client";

import Image from "next/image";

interface TitleTextProps {
  title: string;
  image?: string | null;
}

const TitleText: React.FC<TitleTextProps> = ({ title, image }) => {
  const trimmedImage = image?.trim() || null;
  const initial = title.trim().charAt(0).toUpperCase() || "T";

  return (
    <div className="flex items-center space-x-2 md:space-x-4 p-1 md:p-2">
      {trimmedImage ? (
        <Image
          src={trimmedImage}
          alt={title}
          width={40}
          height={40}
          className="object-cover rounded-full"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-sm font-semibold text-base-content/70">
          {initial}
        </div>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};

export default TitleText;
