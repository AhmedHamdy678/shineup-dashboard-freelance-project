import React from 'react';
import { format } from 'date-fns';
import { User, Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ message, isOwnMessage, isRead }) {
  const timeString = message.createdAt ? format(new Date(message.createdAt), 'hh:mm a') : '';
  const senderName = message.sender?.fullName || 'الدعم الفني';

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[75%] ${isOwnMessage ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        
        {/* Avatar - for incoming messages */}
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mb-5 shadow-sm">
            {message.sender?.avatarUrl ? (
              <img src={message.sender.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-emerald-600" />
            )}
          </div>
        )}

        <div className={`flex flex-col ${isOwnMessage ? 'items-start' : 'items-end'}`}>
          {!isOwnMessage && (
            <span className="text-xs text-gray-500 mb-1 ml-1">{senderName}</span>
          )}
          
          <div 
            className={`px-4 py-2.5 shadow-sm ${
              isOwnMessage 
                ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
            }`}
          >
            <p dir="auto" className="text-sm whitespace-pre-wrap leading-relaxed text-start">
              {message.body || message.text || message.content}
            </p>
          </div>
          
          <div className="flex items-center gap-1 mt-1 mx-1">
            <span className="text-[10px] text-gray-400">{timeString}</span>
            {isOwnMessage && (
              isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
