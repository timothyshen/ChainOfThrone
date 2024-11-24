// listen to event RoundExecuted

import { contractClient } from "./client";
import { CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { parseAbiItem } from "viem";

const watchGameRoundExecuted = contractClient.watchEvent({
  address: CONTRACT_ADDRESS,
  event: parseAbiItem(["event RoundExecuted()"]),
  onLogs: (logs) => {
    console.log(logs);
  },
});

export default watchGameRoundExecuted;
