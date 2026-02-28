export interface IMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  userId?: string;
}

export interface ISendMessagePayload {
  message: string;
  userId: string;
  sessionId?: string;
}

export interface IMessageResponse {
  success: boolean;
  message: IMessage;
  error?: string;
}
