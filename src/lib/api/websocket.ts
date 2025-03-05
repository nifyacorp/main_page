import { io, Socket } from "socket.io-client";

export type SocketEvent = 'notification' | 'auth_error' | 'authenticated';

export interface SocketOptions {
  baseUrl?: string;
  debug?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (event: string, data: any) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private options: SocketOptions = {
    debug: false
  };
  private eventListeners: Map<string, Set<Function>> = new Map();
  private token: string | null = null;

  constructor(options?: SocketOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  /**
   * Initialize the socket connection
   */
  public connect(token?: string): void {
    if (this.socket) {
      this.log('Socket already connected or connecting, disconnecting first');
      this.disconnect();
    }

    this.token = token || localStorage.getItem('accessToken');
    if (!this.token) {
      this.log('No auth token available, aborting connection');
      return;
    }

    // Auto-detect backend URL, use the environment variable or fallback to relative URL
    const baseUrl = this.options.baseUrl || 
                   import.meta.env.VITE_BACKEND_URL || 
                   '';
    
    this.log('Initializing socket connection to:', baseUrl);
    
    this.socket = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.setUpListeners();
    
    // Wait for connection to authenticate
    this.socket.on('connect', () => {
      this.authenticate();
    });
  }

  /**
   * Authenticate the socket connection
   */
  private authenticate(): void {
    if (!this.socket || !this.token) {
      this.log('Cannot authenticate: socket or token missing');
      return;
    }

    this.log('Authenticating socket connection');
    this.socket.emit('authenticate', { token: this.token });
  }

  /**
   * Set up socket event listeners
   */
  private setUpListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      this.log('Socket connected:', this.socket?.id);
      
      if (this.options.onConnect) {
        this.options.onConnect();
      }

      this.dispatchEvent('connect', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.log('Socket disconnected:', reason);
      
      if (this.options.onDisconnect) {
        this.options.onDisconnect();
      }

      this.dispatchEvent('disconnect', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.log('Socket connection error:', error.message);
      
      if (this.options.onError) {
        this.options.onError(error);
      }

      this.dispatchEvent('error', { message: error.message });
    });

    this.socket.on('authenticated', () => {
      this.log('Socket authenticated successfully');
      this.dispatchEvent('authenticated', {});
    });

    this.socket.on('auth_error', (error) => {
      this.log('Socket authentication error:', error);
      this.dispatchEvent('auth_error', error);
    });

    // Listen for notification events
    this.socket.on('notification', (data) => {
      this.log('Received notification:', data);
      
      if (this.options.onMessage) {
        this.options.onMessage('notification', data);
      }

      this.dispatchEvent('notification', data);
    });
  }

  /**
   * Add an event listener
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)?.add(callback);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.delete(callback);
    }
  }

  /**
   * Dispatch an event to all listeners
   */
  private dispatchEvent(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event handler:', error);
        }
      });
    }
  }

  /**
   * Disconnect the socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.connected && !!this.socket?.connected;
  }

  /**
   * Logging helper
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// Create a singleton instance
export const socketClient = new WebSocketClient({
  debug: import.meta.env.DEV
});

export default socketClient;