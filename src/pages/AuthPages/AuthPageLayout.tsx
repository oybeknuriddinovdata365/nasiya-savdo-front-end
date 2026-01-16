import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        <main className="flex flex-col justify-center w-full lg:w-1/2 p-6 sm:p-12 xl:p-16">
          {children}
        </main>

        <aside className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-brand-950 dark:bg-white/5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs mt-10">
              <img
                width={231}
                height={48}
                src="/images/logo/logo.svg"
                alt="Nasiya App Logo"
                className="mb-4"
              />
              <p className="text-center text-gray-400 dark:text-white/60 text-lg">
                Admin Panel
              </p>
            </div>
          </div>
        </aside>

        <div className="fixed bottom-6 right-6 z-50">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}