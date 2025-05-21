import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";

export function useFarcasterActions() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error);
      }
    };

    init();
  }, []);

  const openUrl = async (url: string) => {
    if (!isReady) {
      console.warn("Farcaster SDK not ready");
      return;
    }

    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
      // Fallback to regular window.open if Farcaster action fails
      window.open(url, "_blank");
    }
  };

  return {
    isReady,
    openUrl,
  };
}
