import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../shared/components/ui/Modal';
import Toggle from '../../../shared/components/ui/Toggle';
import { useActivateMember, useSuspendMember } from './useTeam';

export default function MemberModal({ member, onClose, onSave, isSaving }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { mutate: activateMember, isPending: isActivating } = useActivateMember();
  const { mutate: suspendMember, isPending: isSuspending } = useSuspendMember();
  
  const isStatusChanging = isActivating || isSuspending;
  const isBusy = isSaving || isStatusChanging;

  useEffect(() => {
    if (member) {
      // For Edit: Track the original status
      // We look at member.userIsActive first, fallback to status code
      const currentlyActive = member.userIsActive ?? (member.status === 'ACTIVE');
      setIsActive(currentlyActive);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setIsActive(true);
    }
  }, [member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (member) {
      // EDIT MODE: Status change only
      const originalIsActive = member.userIsActive ?? (member.status === 'ACTIVE');
      if (isActive === originalIsActive) {
        // No change
        onClose();
        return;
      }
      
      const onSuccess = () => {
        toast.success("تم تغيير حالة العضو بنجاح");
        onClose();
      };
      const onError = (err) => {
        console.error("Status Change Error:", err);
        const msg = err.response?.data?.message || err.message || "حدث خطأ أثناء تغيير الحالة";
        toast.error(`خطأ: ${msg}`);
      };

      if (isActive) {
        activateMember(member.id, { onSuccess, onError });
      } else {
        suspendMember(member.id, { onSuccess, onError });
      }
      return;
    }

    // ADD MODE
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) return;
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password.trim(),
      status: isActive ? 'ACTIVE' : 'SUSPENDED',
    };
    onSave(payload);
  };

  return (
    <Modal
      title={member ? "تغيير حالة العضو" : "إضافة عضو فريق"}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ADD MODE FIELDS */}
        {!member && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                required
                disabled={isBusy}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="أحمد محمد"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                required
                disabled={isBusy}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="050xxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                disabled={isBusy}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isBusy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="أدخل كلمة مرور قوية"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE STATUS TOGGLE */}
        <div className={!member ? "pt-4 border-t border-gray-100" : ""}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">تفعيل حساب العضو</p>
                <p className="text-xs text-gray-400">تحديد ما إذا كان العضو يستطيع استخدام النظام أم لا.</p>
              </div>
              <Toggle value={isActive} onChange={setIsActive} />
            </div>
            
            {member && !isActive && (
              <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-md border border-red-100 mt-2">
                إيقاف العضو سيمنعه من الدخول للنظام واستقبال أي طلبات.
              </p>
            )}
            {member && isActive && (
              <p className="text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded-md border border-emerald-100 mt-2">
                هذا العضو نشط حالياً ويمكنه الدخول للنظام.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            {member ? "حفظ التغييرات" : "إضافة عضو"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
