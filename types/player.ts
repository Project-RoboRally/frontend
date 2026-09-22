import type { Robot } from "./robot";
import type { Register } from "./register";

export type Player = {
  username: string;
  robot: Robot;
  register: Register[];
  priorityOrder: boolean;
};