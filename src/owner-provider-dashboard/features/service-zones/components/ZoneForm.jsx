import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import providerAxiosClient from '../../../api/providerAxiosClient';
import toast from 'react-hot-toast';

export default function ZoneForm({ 
  initialData,
  newZoneLocation, 
  setNewZoneLocation, 
  members, 
  onCancel, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    label: '',
    city: '',
    area: '',
    activeIs: true,
    memberIds: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || '',
        city: initialData.city || '',
        area: initialData.area || '',
        activeIs: initialData.activeIs ?? true,
        memberIds: initialData.selectedMembers ? initialData.selectedMembers.map(m => m.id) : []
      });
    } else {
      setFormData({
        label: '',
        city: '',
        area: '',
        activeIs: true,
        memberIds: []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => {
      const isSelected = prev.memberIds.includes(memberId);
      if (isSelected) {
        return { ...prev, memberIds: prev.memberIds.filter(id => id !== memberId) };
      } else {
        return { ...prev, memberIds: [...prev.memberIds, memberId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newZoneLocation.lat || !newZoneLocation.lng) {
      setError('يرجى تحديد موقع المنطقة على الخريطة أولاً.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        label: formData.label,
        city: formData.city,
        area: formData.area,
        latitude: newZoneLocation.lat,
        longitude: newZoneLocation.lng,
        radiusMeters: newZoneLocation.radiusKm * 1000,
        assignmentMode: "SELECTED_MEMBERS",
        memberIds: formData.memberIds,
        activeIs: formData.activeIs
      };

      if (initialData) {
        await providerAxiosClient.patch(`/providers/me/service-zones/${initialData.id}`, payload);
        toast.success("تم تحديث المنطقة بنجاح");
      } else {
        await providerAxiosClient.post('/providers/me/service-zones', payload);
        toast.success("تم إضافة المنطقة بنجاح");
      }
      
      onSuccess();
    } catch (err) {
      console.error('Failed to create zone:', err);
      if (err.response && err.response.data) {
        console.error('API Error Response:', err.response.data);
        setError(`خطأ من الخادم: ${err.response.data.message || JSON.stringify(err.response.data)}`);
      } else {
        setError('حدث خطأ أثناء حفظ المنطقة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="font-semibold text-gray-900">{initialData ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}</h2>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 leading-relaxed">
          <strong>طريقة الإضافة:</strong> اضغط على الخريطة لتحديد مركز المنطقة، ثم استخدم شريط التمرير أدناه لتحديد النطاق.
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form id="create-zone-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المنطقة *</label>
            <input
              type="text"
              name="label"
              required
              placeholder="مثال: شمال الرياض"
              value={formData.label}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">المدينة *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="مثال: الرياض"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الحي *</label>
              <input
                type="text"
                name="area"
                required
                placeholder="مثال: الياسمين"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">نطاق التغطية (كم)</label>
              <span className="text-sm font-bold text-blue-600">{newZoneLocation.radiusKm} كم</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={newZoneLocation.radiusKm}
              onChange={(e) => setNewZoneLocation(prev => ({ ...prev, radiusKm: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{ direction: 'ltr' }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1" style={{ direction: 'ltr' }}>
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  name="activeIs"
                  className="sr-only"
                  checked={formData.activeIs}
                  onChange={handleInputChange}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.activeIs ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.activeIs ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-700">تفعيل المنطقة فوراً</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">تعيين الأعضاء</label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
              {members.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">لا يوجد أعضاء في الفريق</div>
              ) : (
                members.map(member => (
                  <label key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(member.id)}
                      onChange={() => handleMemberToggle(member.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{member.name || member.displayName}</span>
                      {member.email && <span className="text-xs text-gray-500">{member.email}</span>}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إلغاء
        </button>
        <button
          type="submit"
          form="create-zone-form"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          {initialData ? 'حفظ التعديلات' : 'حفظ المنطقة'}
        </button>
      </div>
    </div>
  );
}
