'use client';

import { ChatWindow } from '@/components/chat/ChatWindow';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import { useEffect, useState } from 'react';

export default function ChatPage() {
  const { user } = useAuth();
  const [supportAvailable, setSupportAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<{ available: boolean }>>('/chat/support-status')
      .then((res) => setSupportAvailable(res.data.data.available))
      .catch(() => setSupportAvailable(false))
      .finally(() => setIsLoading(false));
  }, []);

  const sessionId = `session-${user?.id ?? 'guest'}-${new Date().toDateString().replaceAll(/\s/g, '-')}`;

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Chat</h1>
        <p className="text-gray-500 text-sm">Get help from our automated assistant or human support</p>
      </div>
      <ChatWindow sessionId={sessionId} supportAvailable={supportAvailable} />
    </div>
  );
}
