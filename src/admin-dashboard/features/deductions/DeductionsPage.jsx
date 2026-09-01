import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { formatBps, formatMinorUnits } from '../../../shared/utils/financialUtils';
import { Percent, Calculator, Info, AlertCircle, Globe, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeductionsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Rule State
  const [calcType, setCalcType] = useState('PERCENTAGE');
  const [globalValue, setGlobalValue] = useState('');
  const [isUpdatingGlobal, setIsUpdatingGlobal] = useState(false);

  // Type Rule Modal State
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedProviderType, setSelectedProviderType] = useState('COMPANY');
  const [typeCalcType, setTypeCalcType] = useState('PERCENTAGE');
  const [typeRuleValue, setTypeRuleValue] = useState('');
  const [isUpdatingType, setIsUpdatingType] = useState(false);

  // Provider Specific Rule Modal State
  const [isProviderRuleModalOpen, setIsProviderRuleModalOpen] = useState(false);
  const [targetProviderId, setTargetProviderId] = useState('');
  const [providerCalcType, setProviderCalcType] = useState('PERCENTAGE');
  const [providerRuleValue, setProviderRuleValue] = useState('');
  const [isUpdatingProvider, setIsUpdatingProvider] = useState(false);

  // Status Toggle State
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  // Simulator State
  const [providerId, setProviderId] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [simulatorResult, setSimulatorResult] = useState(null);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simulatorError, setSimulatorError] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/platform-deductions');
      const fetchedRules = res.data?.items || res.data?.data || [];
      setRules(fetchedRules);
      
      const globalRule = fetchedRules.find(r => r.scopeType === 'GLOBAL');
      if (globalRule) {
        setCalcType(globalRule.calculationType || 'PERCENTAGE');
        if (globalRule.calculationType === 'PERCENTAGE' && globalRule.percentageBps != null) {
          setGlobalValue(globalRule.percentageBps / 100);
        } else if (globalRule.calculationType === 'FIXED_AMOUNT' && globalRule.fixedAmountMinor != null) {
          setGlobalValue(globalRule.fixedAmountMinor / 100);
        }
      }
    } catch (err) {
      console.error('Failed to fetch rules', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGlobal = async () => {
    if (!globalValue && globalValue !== 0) return;
    try {
      setIsUpdatingGlobal(true);
      const valueMultiplier = Math.round(parseFloat(globalValue) * 100);
      
      const payload = {
        calculationType: calcType,
        currency: "SAR",
        isActive: true
      };
      
      if (calcType === 'PERCENTAGE') {
        payload.percentageBps = valueMultiplier;
      } else {
        payload.fixedAmountMinor = valueMultiplier;
      }
      
      await axiosClient.put('/admin/platform-deductions/global', payload, {
        headers: {
          'Idempotency-Key': crypto.randomUUID()
        }
      });
      
      toast.success('تم تحديث الخصم العام بنجاح');
      fetchRules();
    } catch (err) {
      console.error('Failed to update global deduction', err);
      const backendError = err.response?.data?.message || err.message;
      toast.error(`خطأ: ${backendError}`);
    } finally {
      setIsUpdatingGlobal(false);
    }
  };

  const populateTypeModal = (type) => {
    const existingRule = rules.find(r => r.scopeType === 'PROVIDER_TYPE' && r.providerType === type);
    if (existingRule) {
      setTypeCalcType(existingRule.calculationType || 'PERCENTAGE');
      if (existingRule.calculationType === 'PERCENTAGE' && existingRule.percentageBps != null) {
        setTypeRuleValue(existingRule.percentageBps / 100);
      } else if (existingRule.calculationType === 'FIXED_AMOUNT' && existingRule.fixedAmountMinor != null) {
        setTypeRuleValue(existingRule.fixedAmountMinor / 100);
      } else {
        setTypeRuleValue('');
      }
    } else {
      setTypeCalcType('PERCENTAGE');
      setTypeRuleValue('');
    }
  };

  const handleOpenTypeModal = () => {
    setSelectedProviderType('COMPANY');
    populateTypeModal('COMPANY');
    setIsTypeModalOpen(true);
  };

  const handleProviderTypeChange = (type) => {
    setSelectedProviderType(type);
    populateTypeModal(type);
  };

  const handleUpdateTypeRule = async () => {
    if (!typeRuleValue && typeRuleValue !== 0) return;
    try {
      setIsUpdatingType(true);
      const valueMultiplier = Math.round(parseFloat(typeRuleValue) * 100);
      
      const payload = {
        calculationType: typeCalcType,
        currency: "SAR",
        isActive: true
      };
      
      if (typeCalcType === 'PERCENTAGE') {
        payload.percentageBps = valueMultiplier;
      } else {
        payload.fixedAmountMinor = valueMultiplier;
      }
      
      await axiosClient.put(`/admin/platform-deductions/provider-types/${selectedProviderType}`, payload, {
        headers: {
          'Idempotency-Key': crypto.randomUUID()
        }
      });
      
      toast.success('تم إعداد خصم لنوع المزود بنجاح');
      setIsTypeModalOpen(false);
      fetchRules();
    } catch (err) {
      console.error('Failed to update type deduction', err);
      const backendError = err.response?.data?.message || err.message;
      toast.error(`خطأ: ${backendError}`);
    } finally {
      setIsUpdatingType(false);
    }
  };

  const handleUpdateProviderRule = async () => {
    if (!targetProviderId || (!providerRuleValue && providerRuleValue !== 0)) return;
    try {
      setIsUpdatingProvider(true);
      const valueMultiplier = Math.round(parseFloat(providerRuleValue) * 100);
      
      const payload = {
        calculationType: providerCalcType,
        currency: "SAR",
        isActive: true
      };
      
      if (providerCalcType === 'PERCENTAGE') {
        payload.percentageBps = valueMultiplier;
      } else {
        payload.fixedAmountMinor = valueMultiplier;
      }
      
      await axiosClient.put(`/admin/platform-deductions/providers/${targetProviderId}`, payload, {
        headers: {
          'Idempotency-Key': crypto.randomUUID()
        }
      });
      
      toast.success('تم إعداد خصم خاص للمزود بنجاح');
      setIsProviderRuleModalOpen(false);
      setTargetProviderId('');
      setProviderRuleValue('');
      fetchRules();
    } catch (err) {
      console.error('Failed to update provider deduction', err);
      const backendError = err.response?.data?.message || err.message;
      toast.error(`خطأ: ${backendError}`);
    } finally {
      setIsUpdatingProvider(false);
    }
  };

  const handleToggleStatus = async (ruleId, currentStatus) => {
    try {
      setToggleLoadingId(ruleId);
      await axiosClient.patch(`/admin/platform-deductions/${ruleId}/status`, {
        isActive: !currentStatus
      }, {
        headers: {
          'Idempotency-Key': crypto.randomUUID()
        }
      });
      toast.success('تم تحديث حالة القاعدة بنجاح');
      fetchRules();
    } catch (err) {
      console.error('Failed to toggle status', err);
      const backendError = err.response?.data?.message || err.message;
      toast.error(`خطأ: ${backendError}`);
    } finally {
      setToggleLoadingId(null);
    }
  };

  const handleSimulate = async () => {
    if (!providerId || !grossAmount) return;
    try {
      setSimulatorLoading(true);
      setSimulatorError(null);
      setSimulatorResult(null);

      const grossAmountMinor = Math.round(parseFloat(grossAmount) * 100);
      const res = await axiosClient.get(
        `/admin/platform-deductions/preview?providerId=${providerId}&grossAmountMinor=${grossAmountMinor}&currency=SAR`
      );
      setSimulatorResult(res.data?.data || res.data);
    } catch (err) {
      console.error('Simulation failed', err);
      setSimulatorError('فشل في حساب العمولة. يرجى التأكد من البيانات المدخلة.');
    } finally {
      setSimulatorLoading(false);
    }
  };

  const getRuleLabel = (rule) => {
    if (rule.scopeType === 'PROVIDER_TYPE' && rule.providerType === 'COMPANY') return 'خصم الشركات';
    if (rule.scopeType === 'PROVIDER_TYPE' && rule.providerType === 'INDIVIDUAL') return 'خصم الأفراد';
    if (rule.scopeType === 'PROVIDER') return 'خصم خاص لمزود';
    return rule.name || 'قاعدة خصم';
  };

  const renderRuleValue = (rule) => {
    if (rule.calculationType === 'PERCENTAGE') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-sm font-semibold">
          {formatBps(rule.percentageBps)}%
        </span>
      );
    }
    if (rule.calculationType === 'FIXED_AMOUNT') {
      return (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-sm font-semibold">
          {formatMinorUnits(rule.fixedAmountMinor)} SAR
        </span>
      );
    }
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إعدادات العمولات والخصومات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Global Rule Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  الخصم العام للمنصة
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  هذه النسبة تطبق كخصم افتراضي على جميع العمليات ما لم توجد قاعدة مخصصة لمزود.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex bg-white rounded-lg p-1 border border-blue-200 self-start">
                <button
                  onClick={() => setCalcType('PERCENTAGE')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    calcType === 'PERCENTAGE' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  نسبة مئوية (%)
                </button>
                <button
                  onClick={() => setCalcType('FIXED_AMOUNT')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    calcType === 'FIXED_AMOUNT' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  مبلغ ثابت (SAR)
                </button>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    {calcType === 'PERCENTAGE' ? 'نسبة الخصم المئوية (%)' : 'الخصم الثابت (SAR)'}
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                    placeholder={calcType === 'PERCENTAGE' ? 'مثال: 10' : 'مثال: 50'}
                    value={globalValue}
                    onChange={(e) => setGlobalValue(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleUpdateGlobal}
                  disabled={isUpdatingGlobal || (!globalValue && globalValue !== 0)}
                  className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[42px]"
                >
                  {isUpdatingGlobal ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'تحديث الخصم العام'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                قواعد الخصم النشطة
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsProviderRuleModalOpen(true)}
                  className="text-sm bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إعداد خصم خاص لمزود
                </button>
                <button 
                  onClick={handleOpenTypeModal}
                  className="text-sm bg-gray-900 text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  إعداد خصم لنوع مزود
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-50 rounded-lg border border-gray-100"></div>
                ))}
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                لا توجد قواعد خصم نشطة حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div 
                    key={rule.id || Math.random()} 
                    className={`flex items-center justify-between p-4 border border-gray-100 rounded-lg transition-colors bg-white ${rule.isActive ? 'hover:border-blue-100' : 'opacity-60 bg-gray-50'}`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{getRuleLabel(rule)}</span>
                        
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={rule.isActive}
                              onChange={() => handleToggleStatus(rule.id, rule.isActive)}
                              disabled={toggleLoadingId === rule.id}
                            />
                            <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 ${toggleLoadingId === rule.id ? 'opacity-50' : ''}`}></div>
                          </label>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {rule.isActive ? 'نشط' : 'متوقف'}
                          </span>
                        </div>
                      </div>
                      {rule.description && <span className="text-sm text-gray-500">{rule.description}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      {renderRuleValue(rule)}
                      <Link 
                        to={`/admin/deductions/${rule.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              حاسبة العمولات
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">معرف المزود (Provider ID)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="أدخل معرف المزود"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ العملية الافتراضي (SAR)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="مثال: 500"
                  value={grossAmount}
                  onChange={(e) => setGrossAmount(e.target.value)}
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleSimulate}
                disabled={!providerId || !grossAmount || simulatorLoading}
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {simulatorLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>احسب العمولة</>
                )}
              </button>

              {simulatorError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{simulatorError}</p>
                </div>
              )}

              {simulatorResult && !simulatorLoading && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">إجمالي العملية</span>
                    <span className="font-semibold text-gray-900" dir="ltr">{grossAmount} SAR</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm bg-red-50 p-3 rounded-lg">
                    <span className="text-red-700 font-medium">عمولة المنصة</span>
                    <span className="font-bold text-red-700" dir="ltr">
                      {formatMinorUnits(simulatorResult.platformDeductionMinor)} SAR
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm bg-green-50 p-3 rounded-lg">
                    <span className="text-green-700 font-medium">صافي ربح المزود</span>
                    <span className="font-bold text-green-700" dir="ltr">
                      {formatMinorUnits(simulatorResult.providerNetEarningMinor)} SAR
                    </span>
                  </div>

                  {simulatorResult.matchedScope && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-2">
                      <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                      <p>تم تطبيق قاعدة: <span className="font-medium text-gray-700">{simulatorResult.matchedScope}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Type Rule Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">إعداد خصم لنوع مزود</h3>
              <button 
                onClick={() => setIsTypeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Provider Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">نوع المزود</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProviderTypeChange('COMPANY')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      selectedProviderType === 'COMPANY' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    شركات
                  </button>
                  <button
                    onClick={() => handleProviderTypeChange('INDIVIDUAL')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      selectedProviderType === 'INDIVIDUAL' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    أفراد
                  </button>
                </div>
              </div>

              {/* Calculation Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">نوع الخصم</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTypeCalcType('PERCENTAGE')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      typeCalcType === 'PERCENTAGE' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    نسبة مئوية (%)
                  </button>
                  <button
                    onClick={() => setTypeCalcType('FIXED_AMOUNT')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      typeCalcType === 'FIXED_AMOUNT' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    مبلغ ثابت (SAR)
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {typeCalcType === 'PERCENTAGE' ? 'النسبة المئوية (%)' : 'المبلغ الثابت (SAR)'}
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder={typeCalcType === 'PERCENTAGE' ? 'مثال: 10' : 'مثال: 50'}
                  value={typeRuleValue}
                  onChange={(e) => setTypeRuleValue(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setIsTypeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateTypeRule}
                disabled={isUpdatingType || (!typeRuleValue && typeRuleValue !== 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isUpdatingType ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'حفظ الإعدادات'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Specific Rule Modal */}
      {isProviderRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">إعداد خصم خاص لمزود</h3>
              <button 
                onClick={() => setIsProviderRuleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Provider ID Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">معرف المزود (Provider ID) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="أدخل ID المزود..."
                  value={targetProviderId}
                  onChange={(e) => setTargetProviderId(e.target.value)}
                  dir="ltr"
                />
              </div>

              {/* Calculation Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">نوع الخصم</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setProviderCalcType('PERCENTAGE')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      providerCalcType === 'PERCENTAGE' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    نسبة مئوية (%)
                  </button>
                  <button
                    onClick={() => setProviderCalcType('FIXED_AMOUNT')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      providerCalcType === 'FIXED_AMOUNT' 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    مبلغ ثابت (SAR)
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {providerCalcType === 'PERCENTAGE' ? 'النسبة المئوية (%)' : 'المبلغ الثابت (SAR)'}
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder={providerCalcType === 'PERCENTAGE' ? 'مثال: 10' : 'مثال: 50'}
                  value={providerRuleValue}
                  onChange={(e) => setProviderRuleValue(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setIsProviderRuleModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateProviderRule}
                disabled={isUpdatingProvider || !targetProviderId || (!providerRuleValue && providerRuleValue !== 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isUpdatingProvider ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'حفظ الإعدادات'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
