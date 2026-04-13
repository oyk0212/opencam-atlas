import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpenCam Atlas",
  description: "Live public cameras from official sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="border-b border-[color:var(--border)] bg-[rgba(201,100,66,0.08)]">
          <div className="container-shell flex min-h-11 items-center justify-center px-3 py-2 text-center text-[12px] text-[color:var(--muted)]">
            OpenCam Atlas should only connect to official public APIs and explicitly permitted public sources.
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
