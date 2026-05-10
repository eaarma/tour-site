import React from "react";

interface CardFrameProps {
  children: React.ReactNode;
  idx?: string | number;
}

const CardFrame: React.FC<CardFrameProps> = ({ children, idx }) => {
  return (
    <div
      key={idx}
      className="overflow-hidden rounded-[28px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
    >
      {children}
    </div>
  );
};

export default CardFrame;
