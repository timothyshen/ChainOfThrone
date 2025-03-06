import { monadTestnet } from "viem/chains";

import { http, createPublicClient } from "viem";

export const contractClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});
