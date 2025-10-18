"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center p-4 shadow-md">
      <h1 className="text-xl font-bold">TimeLockedVault</h1>
      <ConnectButton showBalance={false} />
    </nav>
  );
};

export default Navbar;
