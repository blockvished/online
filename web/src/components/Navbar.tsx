"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/upload", label: "Upload" },
    { href: "/documents", label: "Yor SealEncrypts" },
    { href: "/decrypt", label: "Decrypt Shared" },
    { href: "/tx-logs", label: "Recent Tx Log" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-950/50 backdrop-blur-lg border-b border-white/10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            SealEncrypt
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  className={`transition-colors ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Wallet Button */}
        <div className="flex items-center">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </nav>
    </header>
  );
}
