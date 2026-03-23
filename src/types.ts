export type Message = {
  userId: string;
  userName: string;
  text: string;
};

export type Point = {
  x: number;
  y: number;
};

export const GamePhase = {
  NotActive: "notActive",
  LoadingRound: "loadingRound",
  Playing: "playing",
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];
