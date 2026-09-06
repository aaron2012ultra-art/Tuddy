import React from "react";
import { motion } from "motion/react";
import { PetCustomization } from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";

interface TuddyAirplaneProps {
  pet: PetCustomization;
  isFlying?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TuddyAirplane: React.FC<TuddyAirplaneProps> = ({
  pet,
  isFlying = true,
  className = "",
  size = "md",
}) => {
  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.3 : 1;
  const w = 180 * scale;
  const h = 130 * scale;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      animate={
        isFlying
          ? {
              y: [-5, 5, -5],
              rotate: [-2, 2, -2],
            }
          : { y: 0, rotate: 0 }
      }
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 180 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          {/* Airplane fuselage gradient */}
          <linearGradient id="planeBodyGrad" x1="20" y1="40" x2="160" y2="100">
            <stop offset="0%" stopColor="#FFB7B2" />
            <stop offset="60%" stopColor="#FF9AA2" />
            <stop offset="100%" stopColor="#E57373" />
          </linearGradient>

          {/* Wing gradient */}
          <linearGradient id="wingGrad" x1="60" y1="60" x2="100" y2="115">
            <stop offset="0%" stopColor="#FFDAC1" />
            <stop offset="100%" stopColor="#F8B195" />
          </linearGradient>

          {/* Cockpit glass gloss */}
          <linearGradient id="glassGloss" x1="70" y1="35" x2="115" y2="65">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#B2E2F2" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#4A8A9E" stopOpacity="0.4" />
          </linearGradient>

          {/* Cloud trail */}
          <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* 1. CLOUD TRAIL & WIND STREAM behind the airplane */}
        {isFlying && (
          <g id="flight-trail" opacity="0.8">
            <motion.path
              d="M10 70 Q0 68 -15 72"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3], x: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <motion.path
              d="M18 78 Q5 76 -20 80"
              stroke="#E2E8F0"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ opacity: [0.4, 0.9, 0.4], x: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            />
            {/* Little fluffy exhaust cloud */}
            <motion.circle
              cx="5"
              cy="74"
              r="7"
              fill="#FFFFFF"
              opacity="0.75"
              animate={{ scale: [0.8, 1.2, 0.8], x: [-2, -8, -2] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            />
          </g>
        )}

        {/* 2. TAIL WINGS / STABILIZER */}
        <g id="tail-wing">
          {/* Vertical stabilizer */}
          <path
            d="M32 60 L18 28 C16 24 20 20 25 21 L48 45 Z"
            fill="#E57373"
            stroke="#C62828"
            strokeWidth="1.5"
          />
          {/* Decorative carrot badge on tail */}
          <ellipse cx="30" cy="36" rx="4" ry="6" fill="#F97316" transform="rotate(25 30 36)" />
          <polygon points="28,30 33,29 32,27" fill="#22C55E" />

          {/* Horizontal tail wing */}
          <path
            d="M18 64 L38 64 L30 72 L12 72 Z"
            fill="#F8B195"
            stroke="#D87A68"
            strokeWidth="1.5"
          />
        </g>

        {/* 3. MAIN FUSELAGE / CABIN */}
        <path
          d="M25 64 C25 50 45 42 75 42 C125 42 155 52 165 65 C155 78 125 88 75 88 C45 88 25 78 25 64 Z"
          fill="url(#planeBodyGrad)"
          stroke="#D32F2F"
          strokeWidth="2"
        />

        {/* Fuselage cream belly stripe */}
        <path
          d="M35 74 C65 82 110 82 155 72 C145 82 110 88 75 88 C50 88 38 82 35 74 Z"
          fill="#FFF3E0"
          opacity="0.9"
        />

        {/* Decorative fuselage airplane stripe */}
        <path
          d="M40 64 C70 65 120 64 158 66"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* 4. TUDDY MASCOT PEEKING OUT OF THE COCKPIT */}
        <g id="tuddy-pilot-inside">
          {/* Cockpit cut-out hole */}
          <ellipse cx="92" cy="46" rx="22" ry="14" fill="#334155" />

          {/* Tuddy sitting proudly inside the cockpit */}
          <foreignObject x="72" y="6" width="46" height="54">
            <div className="w-full h-full flex items-center justify-center overflow-visible">
              <AnthropomorphicBunny
                pet={pet}
                size="icon"
                mood="cheering"
                showShadow={false}
              />
            </div>
          </foreignObject>

          {/* Cockpit Windshield Dome (Glass sheen covering front) */}
          <path
            d="M74 46 C74 32 84 25 96 25 C108 25 116 34 116 46 Z"
            fill="url(#glassGloss)"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          {/* Glass reflection arc */}
          <path
            d="M82 36 Q92 30 106 32"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* 5. PASSENGER PORTHOLE WINDOWS */}
        <circle cx="56" cy="62" r="5" fill="#B2E2F2" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="128" cy="64" r="5" fill="#B2E2F2" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* 6. LOWER / MAIN WING */}
        <g id="main-wing">
          <path
            d="M68 66 L108 66 L94 104 L60 98 Z"
            fill="url(#wingGrad)"
            stroke="#C27848"
            strokeWidth="1.8"
          />
          {/* Wing tip stripe */}
          <path
            d="M62 96 L92 101"
            stroke="#FFB7B2"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* 7. FRONT NOSE CONE */}
        <ellipse cx="164" cy="65" rx="5" ry="8" fill="#D32F2F" stroke="#9A0007" strokeWidth="1.2" />

        {/* 8. PROPELLER WITH ROTATION ANIMATION */}
        <motion.g
          id="airplane-propeller"
          animate={isFlying ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 0.18, ease: "linear" }}
          style={{ originX: "167px", originY: "65px" }}
        >
          {/* Propeller hub */}
          <circle cx="167" cy="65" r="4.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          {/* Propeller blades */}
          <ellipse cx="167" cy="48" rx="2.5" ry="14" fill="#334155" opacity="0.85" />
          <ellipse cx="167" cy="82" rx="2.5" ry="14" fill="#334155" opacity="0.85" />
          <circle cx="167" cy="40" r="1.5" fill="#FDE047" />
          <circle cx="167" cy="90" r="1.5" fill="#FDE047" />
        </motion.g>

        {/* Front light glow */}
        <circle cx="163" cy="65" r="2" fill="#FEF08A" />
      </svg>
    </motion.div>
  );
};
