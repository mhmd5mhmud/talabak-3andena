import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthGuard, Footer, Header } from "@/components/shell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "طلبك عندنا | توصيل طعام بتراث دافئ",
  description: "منصة توصيل للمطابخ المصرية والسورية والإيطالية والسعودية والأمريكية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <Header />
          <AuthGuard>
            <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
          </AuthGuard>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
