import "./globals.css";

export const metadata = {
  title: "MaRe Signal",
  description: "Luxury Salon Prospector",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
