import type {Metadata} from "next";
import {DM_Sans, Fraunces} from "next/font/google";
import {notFound} from "next/navigation";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {isAppLocale, locales} from "@/i18n/routing";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {applicationName: "Christmas Slippers"};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function RootLayout({children, params}: LayoutProps<"/[locale]">) {
  const {locale} = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
