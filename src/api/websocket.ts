import { Server } from 'socket.io';
import { DocuMind } from '../DocuMind';

export function setupWebSocket(io: Server, documind: DocuMind) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat', async (message: string) => {
      try {
        const reply = await documind.chat(message);
        socket.emit('chat', reply);
      } catch (error) {
        socket.emit('error', 'Error processing chat message');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}