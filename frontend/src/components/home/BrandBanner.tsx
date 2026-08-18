"use client";

import { motion } from "framer-motion";

const USPs = [
  "100% PREMIUM COTTON",
  "ETHICALLY CRAFTED",
  "FREE WORLDWIDE SHIPPING",
  "LUXURY FIT & FINISH",
  "EASY 30-DAY RETURNS",
  "LIMITED EDITION DROPS",
];

export function BrandBanner() {
  return (
    <div className="relative z-20 -mt-25 sm:-mt-30 lg:-mt-32 w-full bg-black py-8  overflow-hidden flex items-center border-y border-white/10 select-none">
      <motion.div
        className="flex whitespace-nowrap gap-12 sm:gap-16 items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 45,
        }}
      >
        {[...USPs, ...USPs].map((item, index) => (
          <div key={index} className="flex items-center gap-12 sm:gap-16">
            <span className="font-be-vietnam-pro-black text-sm sm:text-base tracking-widest text-white uppercase font-bold">
              {item}
            </span>
            <span className="text-[#CD0000] text-xs">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
