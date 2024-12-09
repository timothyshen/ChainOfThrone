import DiplomacyGame from '@/components/gamePlay/GamePlayPage';

export default function GamePage({ params }: { params: { address: string } }) {
  return (
    <DiplomacyGame gameAddressParam={params.address as `0x${string}`} />
  );
}