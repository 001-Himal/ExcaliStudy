import type { Metadata } from "next";
import { Caveat, Inter, Lora, Roboto_Mono } from "next/font/google";
import { ExcaliStudySidebar } from "@/components/excalistudy/ExcaliStudySidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppStateProvider } from "@/components/excalistudy/AppStateContext";
import { PageVisibilityWrapper } from "@/components/excalistudy/PageVisibilityWrapper";
import { ExcaliStudyCanvas } from "@/components/excalistudy/ExcaliStudyCanvas";
import { ThemeProvider } from "@/components/excalistudy/ThemeProvider";
import { FontInjector } from "@/components/excalistudy/FontInjector";
import { SidebarTriggerConditional } from "@/components/excalistudy/SidebarTriggerConditional";
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
  title: "Excalidraw",
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
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateProvider>
            <FontInjector />
          <SidebarProvider>
            <div className="relative flex h-screen w-full overflow-hidden bg-background">
              <ExcaliStudyCanvas />
              
              {/* Keep trigger perfectly positioned at the top left, visible only when closed */}
              <SidebarTriggerConditional />

              {/* Sidebar sits on top, flex handles its transition */}
              <div className="z-40 pointer-events-none absolute inset-0 flex h-full w-full">
                <div className="pointer-events-auto flex h-full">
                  <ExcaliStudySidebar />
                </div>
              </div>

              <div className="z-10 pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
                <PageVisibilityWrapper className="pointer-events-auto h-full w-full relative">
                  {children}
                </PageVisibilityWrapper>
              </div>
            </div>
          </SidebarProvider>
        </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



