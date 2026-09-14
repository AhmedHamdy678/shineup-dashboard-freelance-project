import { useState } from 'react';
import { useGetAuditLog } from './useAuditLog';
import Table from '../../../shared/components/ui/Table';
import Pagination from '../../../shared/components/ui/Pagination';
import { Activity, Clock } from 'lucide-react';

const PAGE_SIZE = 15;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetAuditLog(page, PAGE_SIZE);

  const logs = data?.data || [];
  const totalResults = data?.pagination?.total || 0;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getActionColor = (action) => {
    if (!action) return 'bg-gray-100 text-gray-800';
    if (action.includes('CREATE') || action.includes('ADD') || action.includes('GRANT')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('DELETE') || action.includes('REMOVE') || action.includes('REVOKE')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('UPDATE') || action.includes('PATCH')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'التاريخ والوقت',
      render: (val) => (
        <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium" dir="ltr">{formatDate(val)}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'الإجراء (Action)',
      render: (val) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${getActionColor(val)}`}>
          {val}
        </span>
      )
    },
    {
      key: 'actorUserId',
      label: 'المنفذ (Actor ID)',
      render: (val) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 select-all">
          {val || 'SYSTEM'}
        </span>
      )
    },
    {
      key: 'targetUserId',
      label: 'الهدف (Target ID)',
      render: (val) => val ? (
        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 select-all">
          {val}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            سجل التدقيق (Audit Log)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            سجل أمني يعرض جميع الإجراءات الإدارية التي تمت على النظام، للمراجعة والرقابة.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          </div>
        ) : isError ? (
          <div className="flex-1 p-6 text-red-500 text-center flex flex-col items-center justify-center">
            <p>حدث خطأ في تحميل سجل التدقيق.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <Table columns={columns} rows={logs} />
              {logs.length === 0 && (
                <div className="text-center py-12 text-gray-500">لا توجد سجلات لعرضها في هذه الصفحة.</div>
              )}
            </div>
            
            <div className="border-t border-gray-100 bg-gray-50/50">
              <Pagination
                currentPage={page}
                totalResults={totalResults}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
