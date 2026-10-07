import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "Airbnb | Vacation rentals, cabins, beach houses & more",
  description:
    "Find vacation rentals, cabins, beach houses, unique homes and experiences around the world.",
  icons: {
    icon: "https://a0.muscache.com/airbnb/static/logotype_favicon-21cc8e6c6a2cca43f061d2dcabdf6e58.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <Navbar />
          {children}
          <AuthModal />
          <Toaster
            position="bottom-left"
            toastOptions={{
              style: { borderRadius: "12px", fontSize: "14px", fontWeight: 500 },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
