import React from "react";

interface CardFrameProps {
  children: React.ReactNode;
  idx?: string | number;
}

const CardFrame: React.FC<CardFrameProps> = ({ children, idx }) => {
  return (
    <div
      key={idx}
      className="card bg-base-100 shadow rounded-xl border border-base-300 space-y-8"
    >
      {children}
    </div>
  );
};

export default CardFrame;
