import app from "./app";
import { createServer } from "http";
import SocketService from "./services/socket.service";

const port = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
new SocketService(server);

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
