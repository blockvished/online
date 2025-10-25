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
        Built with <span className="font-semibold text-white">Next.js</span> ,{" "}
        <span className="font-semibold text-fuchsia-500">RainbowKit</span> &{" "}
        <span className="font-semibold text-green-400">Envio</span> · Deployed
        to <span className="font-semibold text-purple-400">Sepolia</span> via{" "}
        <span className="font-semibold text-yellow-400">Hardhat</span> ·
        Encrypted by{" "}
        <span className="font-semibold text-lime-400">Lighthouse</span> on{" "}
        <span className="font-semibold text-cyan-400">IPFS</span>
      </p>
    </motion.footer>
  );
}
