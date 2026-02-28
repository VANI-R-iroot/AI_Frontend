
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from './config';
import type { ISendMessagePayload } from '../types/message.types';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() { }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(userId: string, token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(API_CONFIG.SOCKET_URL, {
      reconnectionDelayMax: API_CONFIG.TIMEOUT,
      reconnectionAttempts: API_CONFIG.RECONNECT_ATTEMPTS,
      auth: {
        token: token || '',
        userId: userId
      },
      query: {
        client: 'web'
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners(userId);
    return this.socket;
  }

  private setupEventListeners(userId: string): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      setTimeout(() => {
        this.socket?.emit('user:join', userId);
      }, 100);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    this.socket.on('user:joined', (data) => {
      console.log('👤 User joined:', data);
    });
  }

  // Listen for user message confirmation
  public onMessageReceived(callback: (data: any) => void): void {
    this.socket?.on('chat:message:received', callback);
  }

  // Listen for streaming start
  public onStreamStart(callback: (data: any) => void): void {
    this.socket?.on('chat:stream:start', callback);
  }

  // Listen for streaming chunks
  public onStreamChunk(callback: (data: any) => void): void {
    this.socket?.on('chat:stream:chunk', callback);
  }

  // Listen for streaming end
  public onStreamEnd(callback: (data: any) => void): void {
    this.socket?.on('chat:stream:end', callback);
  }

  // Listen for typing indicator
  public onAssistantTyping(callback: (data: any) => void): void {
    this.socket?.on('assistant:typing', callback);
  }

  // Send message
  public sendMessage(payload: ISendMessagePayload): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('chat:message', payload);
  }

  // Emit typing indicator
  public emitTyping(isTyping: boolean, userId: string, sessionId?: string): void {
    if (isTyping) {
      this.socket?.emit('user:typing', { userId, sessionId });
    } else {
      this.socket?.emit('user:stop_typing', { userId, sessionId });
    }
  }

  // Get conversation history
  public getConversation(sessionId: string, userId: string): void {
    this.socket?.emit('conversation:get', { sessionId, userId });
  }

  // Listen for conversation history
  public onConversationHistory(callback: (data: any) => void): void {
    this.socket?.on('conversation:history', callback);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default SocketService.getInstance();
