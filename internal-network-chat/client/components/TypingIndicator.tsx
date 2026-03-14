type TypingIndicatorProps = {
  typingUsers: { id: string; username: string }[];
};

export const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (!typingUsers.length) return null;
  const names = typingUsers.map((u) => u.username).join(', ');
  return (
    <div className="text-xs text-slate-400 mt-1">
      {names} {typingUsers.length === 1 ? 'is' : 'are'} typing...
    </div>
  );
};

