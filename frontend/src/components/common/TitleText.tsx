"use client";

import Image from "next/image";

interface TitleTextProps {
  title: string;
  image: string;
}

const TitleText: React.FC<TitleTextProps> = ({ title, image }) => {
  return (
    <div className="flex items-center space-x-2 md:space-x-4 border p-1 md:p-2">
      <Image
        src={image}
        alt={title}
        width={40} // 10 * 4 (Tailwind's w-10 means 2.5rem = 40px)
        height={40}
        className="object-cover rounded-full"
      />
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};

export default TitleText;
