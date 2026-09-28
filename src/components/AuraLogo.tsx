import React from "react";

interface AuraLogoProps {
  className?: string;
}

export default function AuraLogo({ className = "w-6 h-6" }: AuraLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L2 22H6.5L12 11L17.5 22H22L12 2Z"
        fill="currentColor"
      />
      <path
        d="M8.5 16H15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="1.5" fill="#3b82f6" />
    </svg>
  );
}
