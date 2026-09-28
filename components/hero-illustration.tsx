"use client";

import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto flex items-center justify-center">
      {/* Subtle organic ambient glow behind the character */}
      <div className="absolute -inset-4 bg-blue-600/15 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* The pure, perfectly blended illustration with zero borders or extra chips */}
      <div className="relative w-full">
        <Image
          src="/images/offer-celebration-hero.png"
          alt="Student celebrating campus placement offer letter"
          width={1024}
          height={682}
          priority
          className="w-full h-auto object-contain drop-shadow-md select-none"
        />
      </div>
    </div>
  );
}
