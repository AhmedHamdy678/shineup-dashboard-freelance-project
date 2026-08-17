import { Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toggle from '../../../shared/components/ui/Toggle';
import useProviderAuth from '../../hooks/useProviderAuth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Gradient palette for avatar backgrounds — cycles by index
const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
];

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
/**
 * MemberTable
 *
 * Props:
 *  - members        {Array}    Real member data.
 *  - onToggleStatus {Function} Called with the member object when the Status toggle is clicked.
 *  - onEdit         {Function} Called with the member object to open the Edit modal.
 *  - onDelete       {Function} Called with the member object after the confirm dialog.
 */
export default function MemberTable({
  members,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const rows = members || [];
  const navigate = useNavigate();
  const { user: currentUser } = useProviderAuth();

  const handleEdit = (member) => {
    if (onEdit) onEdit(member);
  };

  const handleDelete = (member) => {
    if (onDelete) onDelete(member);
  };

  const handleToggle = (member) => {
    if (onToggleStatus) onToggleStatus(member);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          {/* ── Head ── */}
          <thead>
            <tr className="bg-gray-50">
              {['Member', 'Phone Number', 'Status', 'Joined Date', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-gray-50 bg-white">
            {rows.map((m, idx) => {
              const isActive = m.userIsActive ?? (m.status === 'ACTIVE');
              const isOwner = m.userId === currentUser?.id || m.role === 'OWNER';
              const gradient = isActive 
                ? AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] 
                : 'from-gray-300 to-gray-400';
                
              return (
                <tr
                  key={m.id}
                  className={`group transition-colors hover:bg-gray-50 ${!isActive ? 'bg-gray-50/50' : ''}`}
                >
                  {/* Member */}
                  <td className={`px-6 py-4 whitespace-nowrap text-center transition-opacity ${!isActive ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-center justify-center gap-3">
                      {/* Circular avatar with initials */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}
                      >
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                            {m.name}
                          </p>
                          {isOwner && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                              المالك
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{m.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${isActive ? 'text-gray-500' : 'text-gray-400 opacity-60'}`}>
                    {m.phone || '—'}
                  </td>

                  {/* Status — toggle + label */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle
                        value={isActive}
                        onChange={() => handleToggle(m)}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        {isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${isActive ? 'text-gray-500' : 'text-gray-400 opacity-60'}`}>
                    {formatDate(m.joinedAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View Profile */}
                      <button
                        onClick={() => navigate(`/provider/team/${m.id}`)}
                        title="View Profile"
                        className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        عرض
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(m)}
                        title="Edit member status"
                        className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        تعديل
                      </button>

                      {/* Delete */}
                      {!isOwner && (
                        <button
                          onClick={() => handleDelete(m)}
                          title="Remove member"
                          className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-transparent hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      <div className="border-t border-gray-100 px-6 py-3 text-right">
        <p className="text-xs text-gray-400">
          إظهار <span className="font-semibold text-gray-600">{rows.length}</span> عضو
        </p>
      </div>
    </div>
  );
}
