import { io } from "socket.io-client";

const token = "your_bearer_token";

const socket = io("http://localhost:3000", {
  extraHeaders: token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {}
});

export default socket;