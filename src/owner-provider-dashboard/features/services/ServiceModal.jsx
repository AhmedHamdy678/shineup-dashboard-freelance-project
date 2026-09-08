import { useState, useEffect } from 'react';
import { useCatalogServices } from './useProviderServices';
import { useCarTypes } from '../../hooks/useCarTypes';
import Modal from '../../../shared/components/ui/Modal';
import Toggle from '../../../shared/components/ui/Toggle';

export default function ServiceModal({ service, existingServices = [], onClose, onSave, isSaving }) {
  const isEditMode = !!service;
  const { data: catalogServices = [], isLoading: isLoadingCatalog } = useCatalogServices();
  const { data: carTypes = [], isLoading: isLoadingCarTypes } = useCarTypes();


  const [catalogServiceId, setCatalogServiceId] = useState('');
  const [availableIs, setAvailableIs] = useState(true);
  const [carPrices, setCarPrices] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (carTypes.length === 0) return;

    setCarPrices((prev) => {
      // Instead of wiping state if length doesn't match, we merge to preserve user input
      const initial = { ...prev };
      carTypes.forEach((ct) => {
        if (!initial[ct.id]) {
          initial[ct.id] = { priceProvider: '', minutesDuration: '' };
        }
      });

      if (isEditMode && service?.prices) {
        setCatalogServiceId(service.catalogServiceId || service.serviceId || '');
        setAvailableIs(service.availableIs !== undefined ? service.availableIs : true);

        service.prices.forEach((p) => {
          const ctId = p.carType?.id || p.carTypeId;
          if (ctId && initial[ctId]) {
            initial[ctId] = {
              id: p.id || undefined,
              priceProvider: p.priceProvider ?? '',
              minutesDuration: p.minutesDuration ?? '',
              fromEffective: p.fromEffective || undefined,
              toEffective: p.toEffective ?? null,
            };
          }
        });
      } else {
        setCatalogServiceId('');
        setAvailableIs(true);
      }

      return initial;
    });
  }, [isEditMode, service, carTypes.length]);

  const handlePriceChange = (carTypeId, field, value) => {
    setCarPrices((prev) => ({
      ...prev,
      [carTypeId]: { ...prev[carTypeId], [field]: value },
    }));
  };

  const servicesArray = Array.isArray(catalogServices) ? catalogServices : [];
  const existingCatalogIds = new Set(
    existingServices.map((s) => s.catalogServiceId || s.serviceId).filter(Boolean)
  );
  const availableCatalogServices = servicesArray.filter((cat) => !existingCatalogIds.has(cat.id));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isEditMode && !catalogServiceId) {
      setErrorMsg('يرجى اختيار خدمة.');
      return;
    }

    let hasPartialEntry = false;

    const prices = Object.entries(carPrices)
      .filter(([, vals]) => {
        const hasPrice = vals.priceProvider !== '';
        const hasDuration = vals.minutesDuration !== '';
        
        if ((hasPrice && !hasDuration) || (!hasPrice && hasDuration)) {
          hasPartialEntry = true;
        }
        
        return hasPrice && hasDuration;
      })
      .map(([carTypeId, vals]) => {
        const priceItem = {
          carTypeId,
          priceProvider: Number(vals.priceProvider),
          minutesDuration: Number(vals.minutesDuration),
          fromEffective: vals.fromEffective || new Date().toISOString(),
          toEffective: vals.toEffective !== undefined ? vals.toEffective : null,
          activeIs: true,
        };
        if (vals.id) {
          priceItem.id = vals.id;
        }
        return priceItem;
      });

    if (hasPartialEntry) {
      setErrorMsg('يرجى إكمال السعر والمدة لجميع أنواع السيارات التي تضيفها.');
      return;
    }

    if (prices.length === 0) {
      setErrorMsg('يرجى إضافة سعر ومدة لنوع سيارة واحد على الأقل.');
      return;
    }

    onSave({
      serviceId: isEditMode ? (service.catalogServiceId || service.serviceId) : catalogServiceId,
      availableIs,
      prices,
    });
  };

  return (
    <Modal
      title={isEditMode ? "تعديل الخدمة" : "إضافة خدمة"}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            الخدمة
          </label>
          {isEditMode ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-medium">
              {service.name || service.nameEn || service.nameAr || ""}
            </div>
          ) : isLoadingCatalog ? (
            <select
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            >
              <option>جاري تحميل الخدمات...</option>
            </select>
          ) : (
            <select
              required
              disabled={isSaving}
              value={catalogServiceId}
              onChange={(e) => setCatalogServiceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">اختر خدمة...</option>
              {availableCatalogServices.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-gray-700">متاح</p>
            <p className="text-xs text-gray-400">يمكن للعملاء حجز هذه الخدمة</p>
          </div>
          <Toggle
            value={availableIs}
            onChange={setAvailableIs}
          />
        </div>

        {/* Dynamic Prices by Car Type */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">الأسعار حسب نوع السيارة</p>
            {isLoadingCarTypes && (
              <span className="text-xs text-gray-400">جاري تحميل أنواع السيارات...</span>
            )}
          </div>

          {carTypes.length === 0 && !isLoadingCarTypes ? (
            <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
              لا توجد أنواع سيارات متاحة
            </p>
          ) : (
            <div className="space-y-2">
              {carTypes.map((ct) => {
                const vals = carPrices[ct.id] || { priceProvider: '', minutesDuration: '' };
                return (
                  <div
                    key={ct.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-700">{ct.name}</p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        السعر (ر.س)
                      </label>
                      <input
                        type="number"
                        min="0"
                        disabled={isSaving}
                        value={vals.priceProvider}
                        onChange={(e) => handlePriceChange(ct.id, 'priceProvider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        المدة (دقيقة)
                      </label>
                      <input
                        type="number"
                        min="1"
                        disabled={isSaving}
                        value={vals.minutesDuration}
                        onChange={(e) => handlePriceChange(ct.id, 'minutesDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSaving || (!isEditMode && !catalogServiceId)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إضافة خدمة"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
