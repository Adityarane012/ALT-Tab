type TypingIndicatorProps = {
  typingUsers: { id: string; username: string }[];
};

export const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (!typingUsers.length) return null;

  const names = typingUsers.map((u) => u.username);
  let label: string;
  if (names.length === 1) {
    label = `${names[0]} is typing`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`;
  } else {
    label = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className="typing-container flex items-center gap-2.5 py-1.5 px-1">
      <div className="flex items-center gap-[5px] bg-slate-800/40 rounded-full px-2.5 py-1.5 border border-acmBorder/30">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-xs text-slate-400 truncate font-medium">{label}</span>
    </div>
  );
};
