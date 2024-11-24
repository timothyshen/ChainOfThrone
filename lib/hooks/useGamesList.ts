// import { contractClient } from "@/lib/contract/client";
// import { useState } from "react";

// export function useGamesList(pageSize = 10) {
//   const [currentPage, setCurrentPage] = useState(0);

//   // Get games info in batches
//   const result = await contractClient.readContract({
//     address: gameFactoryAddress,
//     abi: gameFactoryABI,
//     functionName: "getGamesInfo",
//     args: [currentPage * pageSize, pageSize],
//     watch: true,
//   });

//   return {
//     games: gamesInfo,
//     isLoading,
//     currentPage,
//     setCurrentPage,
//   };
// }
