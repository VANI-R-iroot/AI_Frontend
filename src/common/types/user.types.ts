import type { IMessage } from "./message.types";

export interface IUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface IChatHistory {
  messages: IMessage[];
  user: IUser;
  sessionId: string;
}