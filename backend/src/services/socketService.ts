import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

      socket.on('join_user_channel', (userId: string) => {
        socket.join(`user_${userId}`);
      });

      socket.on('join_project_channel', (projectId: string) => {
        socket.join(`project_${projectId}`);
      });

      socket.on('disconnect', () => {
        // disconnected
      });
    });

    console.log('✅ Real-time Socket.IO server initialized.');
  }

  public static broadcast(event: string, payload: any) {
    if (this.io) {
      this.io.emit(event, payload);
    }
  }

  public static emitToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, payload);
    }
  }

  public static emitToProject(projectId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(`project_${projectId}`).emit(event, payload);
    }
  }
}
