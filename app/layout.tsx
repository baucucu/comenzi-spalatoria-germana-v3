import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import Logo from "@/components/logo";
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Comenzi - Spalatoria Germana",
  // description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-8 md:gap-20 items-center">
              {/* make nav sticky */}
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14 md:h-16 sticky top-0 bg-background z-20">
                <div className="w-full max-w-full md:max-w-5xl flex justify-between items-center p-3 md:px-5 text-sm">
                  <div className="flex gap-3 md:gap-5 items-center font-semibold">
                    <Link href={"/"}><Logo /></Link>
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className="flex flex-col flex-1 gap-8 md:gap-20 w-full max-w-full md:max-w-5xl p-3 md:p-5">
                {children}
              </div>
              {/* make footer sticky */}
              <footer className="w-full flex flex-row items-center justify-between border-t mx-auto text-center text-xs px-4 h-14 md:h-16 sticky bottom-0 bg-background z-20">
                <p className="m-0">
                  Powered by{" "}
                  <a
                    href="https://appy.agency.com/?utm_source=spalatoria-germana&utm_medium=comenzi-app&utm_term=footer-link"
                    target="_blank"
                    className="font-bold hover:underline inline-block py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    rel="noreferrer"
                  >
                    appy.agency
                  </a>
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
