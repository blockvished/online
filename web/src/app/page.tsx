"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Share2 } from "lucide-react";

const features = [
  {
    icon: <Lock className="h-8 w-8 text-blue-400" />,
    title: "Ironclad Encryption",
    description:
      "Your files are encrypted on-device before being stored, ensuring only you and your chosen recipients can access them.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-purple-400" />,
    title: "On-Chain Conditions",
    description:
      "Leverage smart contracts to set conditions for decryption, such as time-locks, payments, or specific recipient addresses.",
  },
  {
    icon: <Share2 className="h-8 w-8 text-yellow-400" />,
    title: "Decentralized & Secure",
    description:
      "Built on a multichain architecture for maximum uptime and censorship resistance. Your data, your rules.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // This will make each child animate 0.2s after the previous one
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  return (
    <div className="relative flex-grow flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-[800px] h-[800px] bg-radial-gradient(ellipse_at_center,_var(--tw-gradient-stops)) from-purple-900/40 via-blue-900/20 to-transparent rounded-full -translate-y-1/3 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center py-20">
        {/* Hero Section */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          SealEncrypt
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg max-w-2xl text-gray-400 mb-10"
        >
          Securely store, encrypt, and share documents on-chain — unlocking them
          automatically based on time, payment, or recipient conditions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
        >
          <Link
            href="/upload"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-600/40 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center"
            >
              <div className="bg-white/10 p-3 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
