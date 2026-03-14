import { useEffect, useRef, useState } from 'react';
import { TypingIndicator } from './TypingIndicator';

type MessageInputProps = {
  onSend: (content: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  typingUsers: { id: string; username: string }[];
};

const SLASH_COMMANDS = [
  { cmd: '/kick', desc: 'Kick a user from the room', usage: '/kick username' },
  { cmd: '/ban', desc: 'Ban a user from the server', usage: '/ban username' },
  { cmd: '/create-room', desc: 'Create a new channel', usage: '/create-room name' },
  { cmd: '/clear', desc: 'Clear all messages in room', usage: '/clear' },
];

export const MessageInput = ({ onSend, onTypingChange, typingUsers }: MessageInputProps) => {
  const [value, setValue] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCmds, setFilteredCmds] = useState(SLASH_COMMANDS);
  const [selectedCmdIdx, setSelectedCmdIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!value) {
      onTypingChange(false);
      return;
    }
    onTypingChange(true);
    const timeout = setTimeout(() => onTypingChange(false), 2000);
    return () => clearTimeout(timeout);
  }, [value, onTypingChange]);

  // Slash command autocomplete
  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      const query = value.toLowerCase();
      const filtered = SLASH_COMMANDS.filter(c => c.cmd.startsWith(query));
      setFilteredCmds(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedCmdIdx(0);
    } else {
      setShowCommands(false);
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    setShowCommands(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCmdIdx(i => Math.min(i + 1, filteredCmds.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCmdIdx(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const cmd = filteredCmds[selectedCmdIdx];
        if (cmd) {
          setValue(cmd.cmd + ' ');
          setShowCommands(false);
        }
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectCommand = (cmd: string) => {
    setValue(cmd + ' ');
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="mt-2 space-y-1">
      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Command autocomplete */}
      {showCommands && (
        <div className="acm-panel p-1.5 mb-1 animate-slide-up">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 py-1 font-medium">
            Commands
          </div>
          {filteredCmds.map((cmd, i) => (
            <button
              key={cmd.cmd}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors duration-100 ${
                i === selectedCmdIdx ? 'bg-acmTeal/10 text-acmTeal' : 'text-slate-300 hover:bg-slate-800/40'
              }`}
              onClick={() => selectCommand(cmd.cmd)}
              onMouseEnter={() => setSelectedCmdIdx(i)}
            >
              <span className="text-sm font-mono font-semibold">{cmd.cmd}</span>
              <span className="text-xs text-slate-500">{cmd.desc}</span>
              <span className="ml-auto text-[10px] text-slate-600 font-mono">{cmd.usage}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="acm-panel p-1 flex items-end gap-1 transition-all duration-200 focus-within:border-acmTeal/40 focus-within:shadow-glow-teal">
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent resize-none outline-none text-sm px-3 py-2.5 text-slate-200 placeholder-slate-500 min-h-[40px] max-h-[120px]"
          rows={1}
          placeholder="Type a message or / for commands..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-0.5 pb-1.5 pr-1">
          {/* Character count */}
          {value.length > 0 && (
            <span className="text-[10px] text-slate-600 tabular-nums px-1.5">
              {value.length}
            </span>
          )}
          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-acmBlue via-acmPurple to-acmTeal text-white shadow-lg shadow-acmPurple/20 hover:shadow-acmPurple/40 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
