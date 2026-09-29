"use client";

import { useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Calendar,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface AboutFounderCardProps {
  name?: string;
  department?: string;
  graduationYear?: string | number;
  linkedinUrl?: string;
  githubUrl?: string;
  email?: string;
  imageUrl?: string;
}

export function AboutFounderCard({
  name = "Ved Kalantri",
  department = "Information Technology",
  graduationYear = "Class of 2027",
  linkedinUrl = "https://www.linkedin.com/in/ved-kalantri-b75915296/",
  githubUrl = "https://github.com/VedKalantri",
  email = "vedkalantri7@gmail.com",
  imageUrl = "/images/ved-kalantri.jpg",
}: AboutFounderCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
      {/* 1. PHOTO WITH SUBTLE HOVER OVERLAY */}
      <div className="relative group w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border border-zinc-800 bg-[#0c0d10] shadow-2xl shadow-black/60 transition-all duration-300 group-hover:border-blue-500/40 group-hover:shadow-blue-500/10">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={`${name} - Founder & Developer`}
            width={224}
            height={224}
            priority
            unoptimized={true}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-[50%_20%] transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-[#10131a] to-zinc-950 text-white select-none">
            <span className="text-4xl font-extrabold tracking-tight text-blue-400 font-heading">
              VK
            </span>
            <span className="text-[11px] text-zinc-400 mt-1 font-mono">{name}</span>
          </div>
        )}

        {/* Subtle, Smooth Hover Social Overlay */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out flex flex-col items-center justify-center p-3 pointer-events-none group-hover:pointer-events-auto">
          <p className="text-[11px] font-medium text-zinc-300 mb-2.5 tracking-wide">
            Connect with Ved
          </p>

          <div className="flex items-center gap-2.5">
            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              title="LinkedIn Profile"
              className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] transition-all duration-200 hover:scale-110 active:scale-95 shadow-md shadow-black/50 cursor-pointer"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>

            {/* GitHub */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              title="GitHub Profile"
              className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 hover:bg-zinc-100 hover:text-zinc-950 hover:border-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-md shadow-black/50 cursor-pointer"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              aria-label="Send email"
              title={`Email: ${email}`}
              className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-400 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md shadow-black/50 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Status Badge in corner */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700/50 text-[10px] font-medium text-emerald-400 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Founder
          </span>
        </div>
      </div>

      {/* 2. CLEAR DETAILS DISPLAYED BELOW THE PHOTO */}
      <div className="space-y-2 w-full max-w-[240px]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight font-heading">
            {name}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            Founder & Lead Developer
          </p>
        </div>

        {/* Department & Graduation Year Badges */}
        <div className="flex flex-col gap-1.5 pt-1">
          {/* Department */}
          <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-[#141720] border border-zinc-800 text-zinc-200 text-xs">
            <GraduationCap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="font-semibold text-zinc-200 truncate">{department}</span>
          </div>

          {/* Graduation Year */}
          <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-xl bg-[#141720] border border-zinc-800 text-zinc-200 text-xs">
            <Calendar className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="font-semibold text-zinc-200">{graduationYear}</span>
          </div>
        </div>

        {/* Quick Clickable Social Pills (Ideal for Mobile & Direct Access) */}
        <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[#0a66c2] hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/40 transition-all cursor-pointer"
            title="LinkedIn Profile"
          >
            <LinkedInIcon className="h-4 w-4" />
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            title="GitHub Profile"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            title="Click to copy email address"
          >
            {copiedEmail ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>Copy Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
