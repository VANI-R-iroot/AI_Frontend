import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatBotContextType {
  showChatBot: boolean;
  setShowChatBot: (show: boolean) => void;
}

const ChatBotContext = createContext<ChatBotContextType>({
  showChatBot: true,
  setShowChatBot: () => {}
});

export const ChatBotProvider = ({ children }: { children: ReactNode }) => {
  const [showChatBot, setShowChatBot] = useState(true);
  
  return (
    <ChatBotContext.Provider value={{ showChatBot, setShowChatBot }}>
      {children}
    </ChatBotContext.Provider>
  );
};

export const useChatBot = () => useContext(ChatBotContext);