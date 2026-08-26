import { useEffect, useState } from 'react';
import { createRoom, deleteRoom, fetchRooms } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type Room = {
  _id: string;
  name: string;
};

type RoomManagerProps = {
  onRoomsUpdated?: (rooms: Room[]) => void;
};

export const RoomManager = ({ onRoomsUpdated }: RoomManagerProps) => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRooms = async () => {
    if (!token) return;
    setIsLoading(true);
    const data = await fetchRooms(token);
    setRooms(data);
    onRoomsUpdated?.(data);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newRoomName.trim()) return;
    await createRoom(token, newRoomName.trim());
    setNewRoomName('');
    void loadRooms();
  };

  const handleDelete = async (roomId: string) => {
    if (!token) return;
    await deleteRoom(token, roomId);
    void loadRooms();
  };

  return (
    <div className="acm-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-acmTeal/10 border border-acmTeal/20 flex items-center justify-center text-acmTeal">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Room Manager</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              {rooms.length} channel{rooms.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          className="acm-input flex-1"
          placeholder="New channel name..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button
          type="submit"
          disabled={!newRoomName.trim()}
          className="acm-btn bg-acmTeal/80 text-black hover:bg-acmTeal disabled:opacity-30 disabled:cursor-not-allowed font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </form>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {rooms.map((room, i) => (
          <div
            key={room._id}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/30 transition-colors duration-150 group animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-acmTeal font-bold text-sm">#</span>
              <span className="text-sm text-slate-200 truncate">{room.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(room._id)}
              className="acm-btn-danger text-[11px] px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        ))}

        {/* Loading state */}
        {isLoading && !rooms.length && (
          <div className="flex items-center justify-center py-8">
            <svg className="w-5 h-5 text-acmTeal animate-spin-slow" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !rooms.length && (
          <div className="flex flex-col items-center py-8 text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-acmBorder flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">No channels yet</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Create the first channel above</p>
          </div>
        )}
      </div>
    </div>
  );
};
