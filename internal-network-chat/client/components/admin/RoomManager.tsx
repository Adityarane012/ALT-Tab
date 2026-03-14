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

  const loadRooms = async () => {
    if (!token) return;
    const data = await fetchRooms(token);
    setRooms(data);
    onRoomsUpdated?.(data);
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
    <div className="acm-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Rooms
          </div>
          <div className="text-sm text-slate-100">
            Room Manager
          </div>
        </div>
      </div>
      <form onSubmit={handleCreate} className="flex gap-2 mb-3">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-sm outline-none focus:border-acmTeal"
          placeholder="Create room e.g. acm-devrel"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-acmTeal/80 text-xs font-semibold text-black hover:bg-acmTeal transition"
        >
          Create
        </button>
      </form>
      <div className="flex-1 overflow-y-auto text-sm">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="flex items-center justify-between py-1.5 border-b border-slate-900 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-acmTeal text-xs">#</span>
              <span className="text-slate-200">{room.name}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(room._id)}
              className="text-[11px] text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
        {!rooms.length && (
          <div className="text-xs text-slate-500 mt-2">
            No rooms yet. Create the first channel.
          </div>
        )}
      </div>
    </div>
  );
};

