import React, { ReactNode } from "react";
import ChatBotWidget from "../common/ChatBotWidget";

interface Props {
  children: ReactNode;
}

const PublicLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="public-layout">
      <main>{children}</main>
      <ChatBotWidget /> 
    </div>
  );
};

export default PublicLayout;


