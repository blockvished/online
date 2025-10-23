import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SealEncryptModule", (m) => {
  const sealencrypt = m.contract("SealEncrypt");

  return { sealencrypt };
});
