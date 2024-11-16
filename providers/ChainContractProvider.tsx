// import React, { createContext, useContext, useState, useEffect } from "react";
// import { contracts } from "../typechain";
// import { networkList } from "@repo/smart-contract-config/network-list";

// type ContractAddresses = {
//   [contractName: string]: string;
// };

// type ChainContracts = {
//   [chainId: number]: ContractAddresses;
// };

// type ChainContractContextType = {
//   currentChainId: number | null;
//   currentContracts: ContractAddresses | null;
// };

// const ChainContractContext = createContext<ChainContractContextType>({
//   currentChainId: null,
//   currentContracts: null,
// });

// export const useChainContract = () => useContext(ChainContractContext);

// export const ChainContractProvider: React.FC = ({ children }) => {
//   const { chain } = useNetwork();
//   const [currentChainId, setCurrentChainId] = useState<number | null>(null);
//   const [currentContracts, setCurrentContracts] =
//     useState<ContractAddresses | null>(null);

//   const chainContracts: ChainContracts = {
//     1: contracts.mainnet,
//     5: contracts.goerli,
//     // Add more chains as needed
//   };

//   useEffect(() => {
//     if (chain) {
//       setCurrentChainId(chain.id);
//       setCurrentContracts(chainContracts[chain.id] || null);
//     }
//   }, [chain]);

//   return (
//     <ChainContractContext.Provider value={{ currentChainId, currentContracts }}>
//       {children}
//     </ChainContractContext.Provider>
//   );
// };
