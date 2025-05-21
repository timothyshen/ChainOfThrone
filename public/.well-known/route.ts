import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants/contracts";

export async function GET() {
  const farcasterConfig = {
    frame: {
      version: "1",
      name: "Chain of Thorns",
      subtitle: "Rule, Strategize, Conquer.",
      description:
        "Enter a decentralized battlefield where negotiation and blockchain-powered strategy define your path to victory.",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/open-graph.png`,
      buttonTitle: "🚩 Start Battle",
      primaryCategorySchema: "games",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#F5F5F5",
      requiredChains: ["eip155:10143"],
      requiredCapabilities: ["actions.signIn", "wallet.getEvmProvider"],
    },
  };

  return NextResponse.json(farcasterConfig);
}
