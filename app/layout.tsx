import "./globals.css";
import React from "react";

export const metadata = {
  title: "Lesson Generator",
  description: "Generate TypeScript lessons and view them",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>{children}</div>
      </body>
    </html>
  );
}
