type UserListProps = {
  users: { id: string; username: string; role: string }[];
};

export const UserList = ({ users }: UserListProps) => {
  return (
    <div className="acm-panel h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Online
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {users.map((u) => (
          <div key={u.id} className="px-4 py-1.5 text-sm text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{u.username}</span>
            <span className="text-[10px] text-slate-500 uppercase">
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

