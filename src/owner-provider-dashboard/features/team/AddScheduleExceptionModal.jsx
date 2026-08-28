import React, { useState } from 'react';
import providerAxiosClient from '../../api/providerAxiosClient';
import Modal from '../../../shared/components/ui/Modal';

export default function AddScheduleExceptionModal({ memberId, onClose, onSaveSuccess }) {
  const [type, setType] = useState('UNAVAILABLE');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    // Bug #8 fix: new Date('') produces Invalid Date; NaN comparisons always
    // return false, allowing the form to submit garbage ISO strings to the API.
    if (!startsAt || !endsAt || isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('يرجى تحديد تاريخ ووقت صالحين للبداية والنهاية');
      return;
    }

    if (end <= start) {
      setError('وقت النهاية يجب أن يكون بعد وقت البداية');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await providerAxiosClient.post(`/providers/me/members/${memberId}/work-schedule/exceptions`, {
        type,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        reason
      });
      onSaveSuccess();
    } catch (err) {
      console.error('Failed to add exception', err);
      setError('حدث خطأ أثناء حفظ الاستثناء. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = type === 'UNAVAILABLE' ? 'إضافة إجازة' : 'إضافة عمل إضافي';

  return (
    <Modal title={modalTitle} onClose={onClose} size="md">
      <div dir="rtl" className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الاستثناء
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exceptionType"
                  value="UNAVAILABLE"
                  checked={type === 'UNAVAILABLE'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">إجازة / غير متاح</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exceptionType"
                  value="AVAILABLE_OVERRIDE"
                  checked={type === 'AVAILABLE_OVERRIDE'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">عمل إضافي</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ ووقت البداية
            </label>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ ووقت النهاية
            </label>
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السبب
            </label>
            <textarea
              rows="3"
              required
              placeholder="أدخل السبب..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center min-w-[80px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'حفظ'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
