import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, setDirectUserRole, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      auth: { token }
    });
    setSocket(s);

    s.on('roleUpdate', (data: { role: 'admin' | 'moderator' | 'user' }) => {
      setDirectUserRole(data.role);
    });

    s.on('bannedUser', () => {
      // Wait for the push to complete so we don't trigger the Dashboard's !user -> /Login redirect
      router.push('/banned').then(() => {
        logout(); // strip auth tokens after we've left the protected page
      }).catch(() => {
        logout();
      });
    });

    return () => {
      s.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

