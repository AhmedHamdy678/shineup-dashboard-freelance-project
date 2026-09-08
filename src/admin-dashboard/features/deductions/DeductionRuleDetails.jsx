import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient, { getApiErrorMessage } from '../../api/axiosClient';
import { formatBps, formatMinorUnits } from '../../../shared/utils/financialUtils';
import formatDate from '../../../shared/utils/formatDate';
import { ArrowRight, Activity, Percent, Calendar, AlertCircle } from 'lucide-react';

export default function DeductionRuleDetails() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRuleDetails();
  }, [ruleId]);

  const fetchRuleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get(`/admin/platform-deductions/${ruleId}`);
      setRule(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to fetch rule details', err);
      setError(getApiErrorMessage(err, 'تعذر تحميل تفاصيل القاعدة. يرجى المحاولة لاحقاً.'));
    } finally {
      setLoading(false);
    }
  };

  const getRuleLabel = (r) => {
    if (r.scopeType === 'PROVIDER_TYPE' && r.providerType === 'COMPANY') return 'خصم الشركات';
    if (r.scopeType === 'PROVIDER_TYPE' && r.providerType === 'INDIVIDUAL') return 'خصم الأفراد';
    if (r.scopeType === 'PROVIDER') return 'خصم خاص لمزود';
    return r.name || 'قاعدة خصم';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-24 w-full bg-gray-50 rounded border border-gray-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/admin/deductions')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!rule) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/deductions')} 
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل قاعدة الخصم</h1>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{getRuleLabel(rule)}</h2>
          {rule.isActive !== false ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              نشط
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
              غير نشط
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">المعلومات الأساسية</h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-gray-500 mb-1">معرّف القاعدة (ID)</span>
                <span className="block text-sm font-mono text-gray-900" dir="ltr">{rule.id}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">نطاق القاعدة (Scope)</span>
                <span className="block text-sm font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md inline-block">
                  {rule.scopeType}
                </span>
              </div>
              {rule.providerId && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">معرّف المزود</span>
                  <span className="block text-sm font-mono text-gray-900 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md inline-block" dir="ltr">
                    {rule.providerId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Value & Section 3: Timestamps */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">قيمة الخصم</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  {rule.calculationType === 'PERCENTAGE' ? (
                    <>
                      <span className="block text-2xl font-bold text-gray-900" dir="ltr">
                        {formatBps(rule.percentageBps)}%
                      </span>
                      <span className="block text-xs text-gray-500">نسبة مئوية (Percentage)</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-2xl font-bold text-gray-900" dir="ltr">
                        {formatMinorUnits(rule.fixedAmountMinor)} {rule.currency}
                      </span>
                      <span className="block text-xs text-gray-500">مبلغ ثابت (Fixed Amount)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">التواريخ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="block text-xs text-gray-500">تاريخ الإنشاء</span>
                    <span className="block text-sm text-gray-900">{formatDate(rule.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="block text-xs text-gray-500">آخر تحديث</span>
                    <span className="block text-sm text-gray-900">{formatDate(rule.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for Future Updates */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-dashed border-gray-300">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">تعديل قاعدة الخصم</h2>
        <p className="text-sm text-gray-500 mb-4">
          يمكنك تعديل إعدادات هذه القاعدة من هنا. هذه الميزة ستتوفر قريباً.
        </p>
        <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center text-gray-400">
          {/* TODO: Add update form here */}
          <span>نموذج التعديل قيد التطوير...</span>
        </div>
      </div>
    </div>
  );
}
