import type { Metadata, Viewport } from "next";
import { Geist_Mono, Golos_Text } from "next/font/google";
import "./globals.css";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourLauncherButton } from "@/components/tour/TourLauncherButton";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Golos was drawn for Cyrillic first, so Mongolian text (ө, ү) sets evenly
// instead of looking like a Latin font with borrowed letters.
const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Карго бизнесийн сургалтын платформ`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "карго",
    "карго бизнес",
    "карго нээх",
    "онлайн сургалт",
    "Cargo Hub",
  ],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Карго бизнесийн сургалтын платформ`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/logo-banner.jpg", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Карго бизнесийн сургалтын платформ`,
    description: SITE_DESCRIPTION,
    images: ["/logo-banner.jpg"],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${golos.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        <TourProvider>
          {children}
          <TourLauncherButton />
        </TourProvider>
      </body>
    </html>
  );
}
