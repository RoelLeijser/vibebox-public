import "~/styles/globals.css";

import { Inter } from "next/font/google";
import SessionProvider from "~/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Vibebox",
  icons: [{ rel: "icon", url: "/face.svg" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
