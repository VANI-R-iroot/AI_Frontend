
import { io } from "socket.io-client";
import { apiConfig } from "../utils/apiConfig.tsx";

const socket = io(`${apiConfig.webSocketUrl}`, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, 
});

export default socket;







