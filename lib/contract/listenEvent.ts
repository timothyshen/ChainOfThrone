// // listen to event RoundExecuted

// import { contractClient } from "./client";
// import { MONAD_GAME_FACTORY_ADDRESS } from "@/lib/constants/contracts";
// import { parseAbiItem } from "viem";

// const watchGameRoundExecuted = contractClient.watchEvent({
//   address: MONAD_GAME_FACTORY_ADDRESS,
//   event: parseAbiItem([
//     "event GameCreated(address indexed gameAddress, address indexed creator)",
//   ]),
//   onLogs: (logs) => {
//     console.log(logs);
//   },
// });

// export default watchGameRoundExecuted;
