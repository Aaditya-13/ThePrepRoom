"use client";

import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto flex items-center justify-center">
      <div className="relative w-full flex items-center justify-center">
        <Image
          src="/images/offer-celebration-hero.png"
          alt="Student celebrating campus placement offer letter"
          width={1024}
          height={682}
          priority
          className="w-full h-auto max-h-[340px] sm:max-h-[380px] lg:max-h-[420px] object-contain select-none"
        />
      </div>
    </div>
  );
}
