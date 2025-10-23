"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="w-full bg-gray-950/80 border-t border-white/10 py-6 text-center"
    >
      <p className="text-gray-400 text-sm">
        Powered by{" "}
        <span className="font-semibold text-yellow-400">Yellow Testnet</span> ·
        Encrypted with{" "}
        <span className="font-semibold text-blue-400">Lighthouse</span> ·
        Multichain-ready via{" "}
        <span className="font-semibold text-purple-400">Avail</span>
      </p>
    </motion.footer>
  );
}
