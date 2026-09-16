import { useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';
import { useTeam, useAddMember, useDeleteMember, useActivateMember, useSuspendMember } from "./useTeam";
import useProviderAuth from "../../hooks/useProviderAuth";
import StatCard from "../../../shared/components/ui/StatCard";
import Pagination from "../../../shared/components/ui/Pagination";
import Modal from "../../../shared/components/ui/Modal";
import MemberModal from "./MemberModal";
import MemberTable from "./MemberTable";

export default function TeamPage() {
  const { user: currentUser } = useProviderAuth();
  const { data: teamData, isLoading } = useTeam();
  const members = Array.isArray(teamData) ? teamData : (teamData?.items || []);
  const { mutate: addMember, isPending: addingMember } = useAddMember();
  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
  
  const { mutate: activateMember } = useActivateMember();
  const { mutate: suspendMember } = useSuspendMember();

  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const pageSize = 6;

  // Stats excluding the OWNER
  const nonOwnerMembers = members.filter(m => !(m.userId === currentUser?.id || m.role === 'OWNER'));
  const totalMembers = nonOwnerMembers.length;
  const activeNow = nonOwnerMembers.filter((m) => (m.userIsActive ?? (m.status === "ACTIVE"))).length;

  // Pagination calculations
  const totalResults = members.length;
  const paginatedMembers = members.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleStatus = (member) => {
    // Check local fallback or status code
    const currentlyActive = member.userIsActive ?? (member.status === 'ACTIVE');
    
    const onSuccess = () => {
      toast.success("تم تحديث حالة العضو بنجاح");
    };
    const onError = (err) => {
      console.error("Status Change Error inline:", err);
      toast.error(getApiErrorMessage(err, 'فشل في تحديث حالة العضو'));
    };

    if (currentlyActive) {
      suspendMember(member.id, { onSuccess, onError });
    } else {
      activateMember(member.id, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!memberToDelete) return;
    deleteMember(memberToDelete.id, {
      onSuccess: () => {
        toast.success("تم حذف العضو من الفريق بنجاح");
        setMemberToDelete(null);
        // Adjust page if deletion empties the page
        const updatedTotal = totalResults - 1;
        const maxPage = Math.max(1, Math.ceil(updatedTotal / pageSize));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'فشل في حذف العضو'));
      }
    });
  };

  const handleSaveMember = (formData) => {
    // We only reach here for Add mode, as Edit mode handles itself inside MemberModal
    addMember(formData, {
      onSuccess: () => {
        toast.success("تمت إضافة العضو الجديد بنجاح");
        setShowAddModal(false);
        setCurrentPage(1);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'فشل في إضافة العضو'));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الفريق</h1>
          <p className="text-gray-500 mt-1">قم بإدارة أعضاء فريقك وصلاحياتهم.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          إضافة عضو
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <StatCard
          title="إجمالي الأعضاء"
          value={totalMembers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="نشط حالياً"
          value={activeNow}
          icon={Users}
          color="green"
        />
      </div>

      {/* Data Table */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">لا يوجد أعضاء بعد</h3>
          <p className="text-sm text-gray-400 mt-1">قم بإضافة أول عضو في فريقك للبدء.</p>
        </div>
      ) : (
        <>
          <MemberTable
            members={paginatedMembers}
            onToggleStatus={handleToggleStatus}
            onEdit={(m) => setEditingMember(m)}
            onDelete={(m) => setMemberToDelete(m)}
          />

          {/* Pagination */}
          {totalResults > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalResults={totalResults}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <Modal
          title="تأكيد الحذف"
          onClose={() => setMemberToDelete(null)}
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-gray-600 text-sm">
              هل أنت متأكد من رغبتك في حذف العضو <strong>{memberToDelete.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                حذف العضو
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingMember) && (
        <MemberModal
          member={editingMember}
          onClose={() => {
            setShowAddModal(false);
            setEditingMember(null);
          }}
          onSave={handleSaveMember}
          isSaving={addingMember}
        />
      )}
    </div>
  );
}
