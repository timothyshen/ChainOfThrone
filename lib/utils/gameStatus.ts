import { GameStatusEnum } from "@/lib/types/gameStatus";

export type GameStatusNumber = 0 | 1 | 2;

/**
 * Convert numeric game status from contract to GameStatusEnum
 */
export const getGameStatusText = (status: number): GameStatusEnum => {
  switch (status) {
    case 0:
      return GameStatusEnum.NOT_STARTED;
    case 1:
      return GameStatusEnum.ONGOING;
    case 2:
      return GameStatusEnum.COMPLETED;
    default:
      return GameStatusEnum.NOT_STARTED;
  }
};

/**
 * Status display text mapping
 */
export const STATUS_DISPLAY_MAP: Record<GameStatusNumber, string> = {
  0: "Open",
  1: "In Progress",
  2: "Completed",
};

/**
 * Get display text for game status
 */
export const getStatusDisplayText = (status: number): string =>
  STATUS_DISPLAY_MAP[status as GameStatusNumber] ?? "Unknown";

/**
 * Get Tailwind classes for status badge styling
 */
export const getStatusBadgeStyles = (status: number): string => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap";
  const statusStyles: Record<GameStatusNumber, string> = {
    0: "bg-white text-green-400 border border-green-400",
    1: "bg-white text-yellow-400 border border-yellow-400",
    2: "bg-white text-red-400 border border-red-400",
  };
  return `${baseStyles} ${statusStyles[status as GameStatusNumber] ?? ""}`;
};

/**
 * Get background color class for status
 */
export const getStatusColor = (status: GameStatusEnum): string => {
  switch (status) {
    case GameStatusEnum.NOT_STARTED:
      return "bg-yellow-500";
    case GameStatusEnum.ONGOING:
      return "bg-green-500";
    case GameStatusEnum.COMPLETED:
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};
