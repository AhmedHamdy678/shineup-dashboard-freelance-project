import { formatDistanceToNow } from 'date-fns';

const roleColors = {
  provider: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="w-72 shrink-0 border-e border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Conversations</h2>
        <p className="text-xs text-gray-400 mt-0.5">{conversations.length} active</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-start p-4 border-b border-gray-100 transition-colors hover:bg-gray-50
              ${activeId === conv.id ? 'bg-blue-50 border-e-2 border-e-blue-500' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {conv.initials}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {conv.participantName}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColors[conv.participantRole]}`}>
                    {conv.participantRole}
                  </span>
                  <span className="text-xs text-gray-400 truncate">{conv.lastMessage}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
