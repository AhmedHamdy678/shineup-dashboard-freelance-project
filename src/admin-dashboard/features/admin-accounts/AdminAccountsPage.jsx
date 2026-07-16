/**
 * Admin accounts page.
 * Placeholder for Platform Admin to create / manage other admin accounts.
 */
import Card from '../../../shared/components/ui/Card';

export default function AdminAccountsPage() {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">حسابات المشرفين</h3>
      <Card>
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-lg font-medium">إدارة المشرفين قريباً</p>
          <p className="text-sm mt-1">يمكنك إنشاء وتعديل وإدارة حسابات المشرفين هنا.</p>
        </div>
      </Card>
    </div>
  );
}
