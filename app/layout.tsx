import type { Metadata } from "next";
import { Caveat, Inter, Lora, Roboto_Mono } from "next/font/google";
import { AnchorSidebar } from "@/components/anchor/AnchorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppStateProvider } from "@/components/anchor/AppStateContext";
import { StagingDock } from "@/components/anchor/StagingDock";
import { ThemeProvider } from "@/components/anchor/ThemeProvider";
import { FontInjector } from "@/components/anchor/FontInjector";
import { SidebarTriggerConditional } from "@/components/anchor/SidebarTriggerConditional";
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
  title: "Anchor",
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
              {/* Universal Staging Dock */}
              <StagingDock />
              
              {/* Keep trigger perfectly positioned at the top left, visible only when closed */}
              <SidebarTriggerConditional />

              {/* Sidebar sits on top, flex handles its transition */}
              <div className="z-40 pointer-events-none absolute inset-0 flex h-full w-full">
                <div className="pointer-events-auto flex h-full">
                  <AnchorSidebar />
                </div>
              </div>
              
              {/* Main canvas acts as background layer, fully centered regardless of sidebar */}
              <main className="z-0 absolute inset-0 h-full w-full overflow-hidden">
                <div className="pointer-events-auto h-full w-full relative">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
