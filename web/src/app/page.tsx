"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
      >
        Time-Locked Document Vault
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg max-w-2xl text-gray-400 mb-8"
      >
        Securely store, encrypt, and share documents on-chain — unlocking them
        automatically based on time, payment, or recipient conditions.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Link
          href="/upload"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-transform"
        >
          Get Started
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mt-10 text-sm text-gray-500"
      >
        Powered by Yellow Testnet · Encrypted with Lighthouse · Multichain-ready
        via Avail
      </motion.p>
    </main>
  );
}
