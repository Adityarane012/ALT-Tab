import { useEffect, useState } from 'react';
import { TypingIndicator } from './TypingIndicator';

type MessageInputProps = {
  onSend: (content: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  typingUsers: { id: string; username: string }[];
};

export const MessageInput = ({ onSend, onTypingChange, typingUsers }: MessageInputProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!value) {
      onTypingChange(false);
      return;
    }
    onTypingChange(true);
    const timeout = setTimeout(() => onTypingChange(false), 2000);
    return () => clearTimeout(timeout);
  }, [value, onTypingChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim()) return;
      onSend(value.trim());
      setValue('');
    }
  };

  return (
    <div className="mt-2">
      <div className="acm-panel p-3">
        <textarea
          className="w-full bg-transparent resize-none outline-none text-sm"
          rows={2}
          placeholder='Type a message or use commands like /kick username, /create-room roomName'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <TypingIndicator typingUsers={typingUsers} />
    </div>
  );
};

