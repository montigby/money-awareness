import "./globals.css";

export const metadata = {
  title: "Money Self-Awareness",
  description: "Understand your relationship with money.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
