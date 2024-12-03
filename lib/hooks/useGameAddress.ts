import { useState, useEffect } from 'react';

export function useGameAddress() {
  const [gameAddress, setGameAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    const address = localStorage.getItem("gameAddress") as `0x${string}`;
    if (address) {
      setGameAddress(address);
    }
  }, []);

  const updateGameAddress = (address: `0x${string}`) => {
    localStorage.setItem("gameAddress", address);
    setGameAddress(address);
  };

  const clearGameAddress = () => {
    localStorage.removeItem("gameAddress");
    setGameAddress(null);
  };

  return {
    gameAddress,
    updateGameAddress,
    clearGameAddress,
  };
} 