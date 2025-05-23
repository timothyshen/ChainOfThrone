export const GAME_FACTORY_ADDRESS =
  "0xff1d3212c99f79a9596986767cf8d5ca1a112db7";
// export const MONAD_GAME_FACTORY_ADDRESS =
//   "0xa557e5ed0f4004085379f1b6ea93b340a474a883";
export const MONAD_GAME_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_MONAD_CONTRACT;

export const APP_URL = process.env.NEXT_PUBLIC_URL!;
if (!APP_URL) {
  throw new Error("NEXT_PUBLIC_URL is not set");
}
