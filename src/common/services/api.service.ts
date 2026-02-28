import { API_CONFIG } from './config';
import type { IChatHistory, IUser } from '../types/user.types';
import type { IMessage, IMessageResponse, ISendMessagePayload } from '../types/message.types';

interface IRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

class APIService {
  private static instance: APIService;
  private baseURL: string;

  private constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: IRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: IRequestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Chat related endpoints
  public async getChatHistory(userId: string): Promise<IChatHistory> {
    return this.request<IChatHistory>(`/chat/history/${userId}`);
  }

  public async sendMessage(payload: ISendMessagePayload): Promise<IMessageResponse> {
    return this.request<IMessageResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMessages(sessionId: string): Promise<IMessage[]> {
    return this.request<IMessage[]>(`/chat/messages/${sessionId}`);
  }

  // User related endpoints
  public async getUserInfo(userId: string): Promise<IUser> {
    return this.request<IUser>(`/user/${userId}`);
  }

  public async updateUser(userId: string, data: Partial<IUser>): Promise<IUser> {
    return this.request<IUser>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export default APIService.getInstance();