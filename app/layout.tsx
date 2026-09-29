import type { Metadata } from "next";
import { Outfit, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";

const headingFont = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ThePrepRoom",
    default: "ThePrepRoom — College Placement Experience Platform",
  },
  description:
    "Learn from the interviews that came before you. Explore student-reported interview experiences, questions, online assessments, and preparation insights.",
  keywords: [
    "placement preparation",
    "interview experiences",
    "college placement",
    "technical interview questions",
    "online assessment",
    "campus recruitment",
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[#090a0d] text-[#f4f4f5] font-sans"
        suppressHydrationWarning
      >
        <Navbar currentUser={currentUser} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
