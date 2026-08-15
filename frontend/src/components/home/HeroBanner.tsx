"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface StarIconProps {
  className?: string;
  style?: React.CSSProperties;
}

function StarIcon({ className, style }: StarIconProps) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="currentColor"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M28 0C28 15.464 15.464 28 0 28C15.464 28 28 40.536 28 56C28 40.536 40.536 28 56 28C40.536 28 28 15.464 28 0Z" />
    </svg>
  );
}

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full bg-[#F2F0F1] overflow-hidden pb-0">
      <div className="max-w-360 mx-auto min-h-165.75 px-4 sm:px-10 lg:pl-25 lg:pr-8 pt-8 sm:pt-10 lg:pt-20 flex flex-col lg:flex-row items-center lg:items-start justify-between relative">
        {/* Left Column: Text Content & Stats */}
        <div className="w-full lg:w-150 flex flex-col items-start z-10 pb-6 lg:pb-0">
          {/* Main Title */}
          <h1 className="font-integral text-[36px] sm:text-[48px] lg:text-[64px] font-extrabold text-black leading-8.5 sm:leading-12 lg:leading-16 tracking-tight uppercase max-w-xl text-left">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>

          {/* Subtitle */}
          <p className="font-satoshi text-sm sm:text-base text-black/60 font-normal leading-relaxed max-w-136.25 mt-4 sm:mt-5 mb-6 sm:mb-8 text-left">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of style.
          </p>

          <div className="w-full sm:w-52.5 mb-8 sm:mb-12">
            <Link
              href="/product"
              className="w-50 sm:w-52.5 bg-black h-13 my-3 flex items-center justify-center rounded-full font-satoshi font-medium text-base text-white hover:text-black cursor-pointer relative overflow-hidden transition-all duration-500 ease-in-out shadow-md hover:shadow-lg border border-black z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-white before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0"
            >
              Shop Now
            </Link>
          </div>

          {/* Stats Counter Row */}
          <div className="w-full flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-6 lg:gap-8">
            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="flex flex-col items-center sm:items-start flex-1 sm:flex-initial">
                <span className="font-satoshi text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-black leading-none text-center sm:text-left">
                  200+
                </span>
                <span className="font-satoshi text-xs lg:text-sm text-black/60 font-normal mt-1.5 whitespace-nowrap text-center sm:text-left">
                  International Brands
                </span>
              </div>

              <div className="w-px h-11 sm:h-13 bg-black/10 shrink-0" />

              <div className="flex flex-col items-center sm:items-start flex-1 sm:flex-initial">
                <span className="font-satoshi text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-black leading-none text-center sm:text-left">
                  2,000+
                </span>
                <span className="font-satoshi text-xs lg:text-sm text-black/60 font-normal mt-1.5 whitespace-nowrap text-center sm:text-left">
                  High-Quality Products
                </span>
              </div>

              <div className="hidden sm:block w-px h-13 bg-black/10 shrink-0" />
            </div>

            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <span className="font-satoshi text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-black leading-none">
                30,000+
              </span>
              <span className="font-satoshi text-xs lg:text-sm text-black/60 font-normal mt-1.5 whitespace-nowrap">
                Happy Customers
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Star Sparkle 1 */}
        <div
          className="hidden lg:block absolute z-20 pointer-events-none"
          style={{
            width: "56px",
            height: "56px",
            top: "297px",
            left: "750px",
          }}
        >
          <StarIcon
            className="text-black opacity-100"
            style={{
              width: "56px",
              height: "56px",
            }}
          />
        </div>

        {/* Desktop Star Sparkle 2 */}
        <div
          className="hidden lg:block absolute z-20 pointer-events-none"
          style={{
            width: "104px",
            height: "104px",
            top: "86px",
            left: "1255px",
          }}
        >
          <StarIcon
            className="text-black opacity-100"
            style={{
              width: "104px",
              height: "104px",
            }}
          />
        </div>

        {/* Right Column: Hero Image & Mobile Stars Container */}
        <div className="relative w-full lg:w-1/2 flex items-end justify-center self-end min-h-100 lg:min-h-165.75 lg:absolute lg:right-0 lg:bottom-0 mt-6 lg:mt-0">
          {/* Mobile Star Sparkle 1 */}
          <div
            className="lg:hidden absolute z-20 pointer-events-none"
            style={{
              left: "28px",
              top: "25%",
            }}
          >
            <StarIcon
              className="text-black opacity-100"
              style={{
                width: "44px",
                height: "44px",
              }}
            />
          </div>

          {/* Mobile Star Sparkle 2 */}
          <div
            className="lg:hidden absolute z-20 pointer-events-none"
            style={{
              right: "22px",
              top: "5%",
            }}
          >
            <StarIcon
              className="text-black opacity-100"
              style={{
                width: "76px",
                height: "76px",
              }}
            />
          </div>

          {/* Banner Image Wrapper */}
          <div className="relative w-full h-full min-h-100 lg:min-h-165.75 flex items-end justify-center lg:justify-end overflow-hidden">
            <Image
              src="/banner.png"
              alt="Trendy Fashionable Couple Posing"
              width={700}
              height={663}
              priority
              className="object-contain object-bottom w-full h-auto max-h-110 sm:max-h-137.5 lg:max-h-165.75"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

