import "./globalStyles.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Providers from "./providers";
import ShowAuthModals from "@/components/Modals/ShowAuthModals";
import { Suspense } from "react";
import Loading from "./loading";
import { Plus_Jakarta_Sans } from "@next/font/google";
import { getUser } from "@/lib/users";

const plus_jakarta = Plus_Jakarta_Sans({
  weight: ["500", "700"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en" className="light">
      <head />
      <body className={plus_jakarta.variable}>
        <Providers boards={user?.boards}>
          <Header />
          <Sidebar />
          <ShowAuthModals />
          <main>
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </Providers>
      </body>
    </html>
  );
}
