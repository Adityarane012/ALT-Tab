type Room = {
  _id: string;
  name: string;
};

type RoomListProps = {
  rooms: Room[];
  activeRoomId: string | null;
  onSelect: (room: Room) => void;
};

export const RoomList = ({ rooms, activeRoomId, onSelect }: RoomListProps) => {
  return (
    <div className="acm-panel h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Rooms
          </div>
          <div className="text-sm text-slate-300">
            MPSTME ACM
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {rooms.map((room) => (
          <button
            key={room._id}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-900/60 transition ${
              activeRoomId === room._id ? 'bg-slate-900/80 text-acmTeal' : 'text-slate-300'
            }`}
            onClick={() => onSelect(room)}
          >
            #{room.name}
          </button>
        ))}
      </div>
    </div>
  );
};

