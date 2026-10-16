import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import KioskHeader from "@/components/KioskHeader";
import KioskIdleTimer from "@/components/KioskIdleTimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kiosk Khảo sát & Quản lý chất lượng | Bệnh viện Quân y 7A",
  description:
    "Cổng khảo sát mức độ hài lòng người bệnh tại Bệnh viện Quân y 7A - Cục Hậu cần Quân khu 7.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#060c23] font-sans text-white antialiased selection:bg-cyan-500 selection:text-white">
        <KioskHeader />
        <KioskIdleTimer />
        <main className="flex-1 flex flex-col relative">{children}</main>
      </body>
    </html>
  );
}
