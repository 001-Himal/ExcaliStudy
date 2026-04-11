import type { Metadata } from "next";
import { Caveat, Inter, Lora, Roboto_Mono } from "next/font/google";
import { AppStateProvider } from "@/components/excalistudy/AppStateContext";
import { PageVisibilityWrapper } from "@/components/excalistudy/PageVisibilityWrapper";
import { ExcaliStudyCanvas } from "@/components/excalistudy/ExcaliStudyCanvas";
import { StudyPanel } from "@/components/excalistudy/StudyPanel";
import { ThemeProvider } from "@/components/excalistudy/ThemeProvider";
import { FontInjector } from "@/components/excalistudy/FontInjector";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ExcaliStudy",
  description: "Personal study organizer built around an infinite canvas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${caveat.variable} ${inter.variable} ${lora.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <FontInjector />
            <div className="relative flex h-screen w-full overflow-hidden">
              {/* Excalidraw canvas fills the entire screen */}
              <ExcaliStudyCanvas />

              {/* Study Panel — right side floating sidebar */}
              <StudyPanel />

              {/* Page route overlays (assignments, subjects, settings, etc.) */}
              <div className="z-[50] pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
                <PageVisibilityWrapper className="pointer-events-auto h-full w-full relative">
                  {children}
                </PageVisibilityWrapper>
              </div>
            </div>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
