import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Building2,
  Wrench,
  Car,
  ReceiptText,
  Tag,
  Phone,
  Zap,
  CalendarClock,
  TrendingDown,
  TrendingUp,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Timer,
  Lock,
} from 'lucide-react';
import { useBookingDetails } from './useBookingDetails';
import Badge from '../../../shared/components/ui/Badge';
import formatDate from '../../../shared/utils/formatDate';

/* ─────────────────────────────────────────
   Status maps
───────────────────────────────────────── */
const bookingStatusVariant = {
  PENDING: 'warning',
  PENDING_PROVIDER_ACCEPTANCE: 'warning',
  CONFIRMED: 'info',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  EXPIRED: 'default',
  PAYMENT_EXPIRED: 'warning',
  CANCELLED_BY_CUSTOMER: 'danger',
  CANCELLED_BY_PROVIDER: 'danger',
  REJECTED_BY_PROVIDER: 'danger',
  PENDING_PAYMENT: 'warning',
  NO_PROVIDERS_AVAILABLE: 'default',
};

const bookingStatusLabel = {
  PENDING: 'قيد الانتظار',
  PENDING_PROVIDER_ACCEPTANCE: 'بانتظار قبول المزود',
  CONFIRMED: 'مؤكد',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  EXPIRED: 'منتهي',
  PAYMENT_EXPIRED: 'انتهت صلاحية الدفع',
  CANCELLED_BY_CUSTOMER: 'أُلغي من قبل العميل',
  CANCELLED_BY_PROVIDER: 'أُلغي من قبل المزود',
  REJECTED_BY_PROVIDER: 'مرفوض من المزود',
  PENDING_PAYMENT: 'بانتظار الدفع',
  NO_PROVIDERS_AVAILABLE: 'لا يوجد مزودون متاحون',
};

const paymentStatusVariant = {
  PAID: 'success',
  UNPAID: 'danger',
  REFUNDED: 'info',
  PARTIAL: 'warning',
  PENDING: 'warning',
  UNKNOWN: 'default',
};

const paymentStatusLabel = {
  PAID: 'مدفوع',
  UNPAID: 'غير مدفوع',
  REFUNDED: 'مسترجع',
  PARTIAL: 'جزئي',
  PENDING: 'قيد المعالجة',
  UNKNOWN: 'غير محدد',
};

const slotHoldStateLabel = {
  NONE: 'لا يوجد',
  HELD: 'محجوز',
  RELEASED: 'محرر',
  EXPIRED: 'منتهي',
};

const slotHoldStateVariant = {
  NONE: 'default',
  HELD: 'warning',
  RELEASED: 'success',
  EXPIRED: 'danger',
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
/** Convert Minor unit (integer cents) → display string */
function fromMinor(minor, currency = 'SAR') {
  if (minor == null) return '—';
  const val = (minor / 100).toFixed(2);
  return `${val} ${currency}`;
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function Card({ icon: Icon, iconColor = 'blue', title, children }) {
  const iconBg = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    teal: 'bg-teal-50 text-teal-600',
    rose: 'bg-rose-50 text-rose-600',
  }[iconColor] || 'bg-gray-50 text-gray-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-sm text-right font-medium ${
          highlight ? 'text-emerald-600 font-bold text-base' : 'text-gray-800'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

function FinanceRow({ label, value, icon: Icon, iconClass, highlight = false, negative = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 px-4 rounded-xl mb-2 ${
        highlight ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}
        <span className={`text-sm ${highlight ? 'font-semibold text-emerald-700' : 'text-gray-600'}`}>{label}</span>
      </div>
      <span
        className={`text-sm font-bold ${
          highlight ? 'text-emerald-700 text-base' : negative ? 'text-red-600' : 'text-gray-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────── */
function BookingDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-2/5" />
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-52 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError } = useBookingDetails(bookingId);

  if (isLoading) return <BookingDetailsSkeleton />;

  if (isError || !booking) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl text-center">
          تعذّر تحميل بيانات الحجز. يرجى المحاولة مرة أخرى.
        </div>
      </div>
    );
  }

  const isScheduled = booking.bookingMethod === 'SCHEDULED';
  const status = booking.status?.toUpperCase();
  const payStatus = booking.paymentStatus?.toUpperCase();
  const pricing = booking.pricing || {};
  const currency = pricing.currency || booking.currency || 'SAR';

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto" dir="rtl">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button
          id="booking-details-back-btn"
          onClick={() => navigate(-1)}
          className="mt-0.5 p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 mb-0.5">تفاصيل الحجز</p>
          <h1 className="text-xl font-bold text-gray-900 font-mono tracking-wide">
            {booking.code || bookingId}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={bookingStatusVariant[status] || 'default'}>
              {bookingStatusLabel[status] || status || '—'}
            </Badge>
            <Badge variant={paymentStatusVariant[payStatus] || 'default'}>
              {paymentStatusLabel[payStatus] || payStatus || '—'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Timeline Card ──────────────────────── */}
      <Card
        icon={isScheduled ? CalendarClock : Zap}
        iconColor={isScheduled ? 'purple' : 'green'}
        title="التوقيت والجدولة"
      >
        {/* Booking method badge */}
        <div className="mb-4">
          {isScheduled ? (
            <span
              id="booking-method-scheduled-badge"
              className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <Calendar className="w-3.5 h-3.5" />
              مجدول
            </span>
          ) : (
            <span
              id="booking-method-now-badge"
              className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <Zap className="w-3.5 h-3.5" />
              فوري
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Request time */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">تاريخ الطلب</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {booking.createdAt ? formatDate(booking.createdAt) : '—'}
            </p>
          </div>

          {/* Execution time — most important for SCHEDULED */}
          {isScheduled && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <CalendarClock className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">موعد التنفيذ الفعلي</span>
              </div>
              <p className="text-sm font-bold text-purple-800">
                {(booking.scheduledAt || booking.scheduleAt || booking.scheduledTime) ? formatDate(booking.scheduledAt || booking.scheduleAt || booking.scheduledTime) : '—'}
              </p>
            </div>
          )}

          {/* Payment deadline — shown when present */}
          {booking.paymentDeadlineAt && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Timer className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-amber-600">آخر موعد للدفع</span>
              </div>
              <p className="text-sm font-bold text-amber-800">
                {formatDate(booking.paymentDeadlineAt)}
              </p>
            </div>
          )}

          {/* Completion time — only when present */}
          {booking.completedAt && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-600">وقت الانتهاء</span>
              </div>
              <p className="text-sm font-bold text-green-800">
                {formatDate(booking.completedAt)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Parties Grid ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Customer Card */}
        <Card icon={User} iconColor="blue" title="معلومات العميل">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
              {booking.customer?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{booking.customer?.name || '—'}</p>
              {booking.customer?.phone && (
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{booking.customer.phone}</span>
                </a>
              )}
            </div>
          </div>
          <InfoRow label="رقم المعرّف" value={booking.customer?.id} mono />
        </Card>

        {/* Provider Card */}
        <Card icon={Building2} iconColor="orange" title="مزود الخدمة">
          {/* Type badge */}
          <div className="mb-3">
            {booking.provider?.type === 'COMPANY' ? (
              <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Building2 className="w-3 h-3" />
                شركة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                <User className="w-3 h-3" />
                فرد
              </span>
            )}
          </div>

          <InfoRow
            label="اسم المزود"
            value={
              booking.provider?.companyName ||
              booking.provider?.individualDisplayName ||
              '—'
            }
          />
          <InfoRow
            label="الفني المُسنَد"
            value={booking.providerMember?.displayName || '—'}
          />
          {booking.providerMember?.phone && (
            <div className="flex items-start justify-between gap-4 py-2.5">
              <span className="text-sm text-gray-500 shrink-0">هاتف الفني</span>
              <a
                href={`tel:${booking.providerMember.phone}`}
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{booking.providerMember.phone}</span>
              </a>
            </div>
          )}
        </Card>
      </div>

      {/* ── Operational Status Card ──────────────── */}
      <Card icon={Info} iconColor="blue" title="الحالة التشغيلية">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* slotHoldState */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">حالة الحجز الزمني</p>
            <Badge variant={slotHoldStateVariant[booking.slotHoldState] || 'default'}>
              {slotHoldStateLabel[booking.slotHoldState] || booking.slotHoldState || '—'}
            </Badge>
          </div>

          {/* canPay */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">إمكانية الدفع</p>
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              booking.canPay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {booking.canPay
                ? <><CheckCircle className="w-3.5 h-3.5" /> متاح</>  
                : <><XCircle className="w-3.5 h-3.5" /> غير متاح</>}
            </div>
          </div>

          {/* canCancel */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">إمكانية الإلغاء</p>
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              booking.canCancel ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {booking.canCancel
                ? <><CheckCircle className="w-3.5 h-3.5" /> متاح</>
                : <><XCircle className="w-3.5 h-3.5" /> غير متاح</>}
            </div>
          </div>

          {/* paymentConfirmationPending */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">تأكيد الدفع</p>
            {booking.paymentConfirmationPending ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> قيد التأكيد
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> لا يوجد إجراء
              </div>
            )}
          </div>
        </div>

        {/* Payment remaining seconds — only if > 0 */}
        {booking.paymentRemainingSeconds > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              الوقت المتبقي للدفع:{' '}
              <span className="font-bold">
                {Math.floor(booking.paymentRemainingSeconds / 60)} دقيقة
              </span>
            </p>
          </div>
        )}
      </Card>

      {/* ── Service Details Card ────────────────── */}
      <Card icon={Wrench} iconColor="teal" title="تفاصيل الخدمة">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="text-xs text-teal-600 font-medium mb-1">الخدمة</p>
            <p className="text-sm font-bold text-teal-900">{booking.service?.name || booking.service?.nameAr || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Car className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">نوع السيارة</p>
            </div>
            <p className="text-sm font-bold text-gray-800">{booking.carType?.name || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">المبلغ الإجمالي</p>
            <p className="text-sm font-bold text-gray-800">
              {booking.amount != null
                ? `${Number(booking.amount).toFixed(2)} ${currency}`
                : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Financial Breakdown Card ────────────── */}
      <Card icon={ReceiptText} iconColor="rose" title="التفاصيل المالية">
        {/* Promotion badge */}
        {pricing.promotion && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-4 py-3">
            <Tag className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-600 mb-0.5">كود الخصم المُطبَّق</p>
              <p className="text-sm font-bold">
                {pricing.promotion.nameAr || pricing.promotion.nameEn}{' '}
                {pricing.promotion.code && (
                  <span className="font-mono text-amber-700">({pricing.promotion.code})</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <FinanceRow
            label="الإجمالي قبل الخصم"
            value={fromMinor(
              pricing.originalCustomerSubtotalMinor ??
              pricing.originalCustomerAmountMinor ??
              pricing.originalSubtotalMinor,
              currency
            )}
            icon={ReceiptText}
            iconClass="text-gray-400"
          />

          {((pricing.customerDiscountMinor ?? pricing.customerDiscountAmountMinor ?? pricing.discountMinor) ?? 0) > 0 && (
            <FinanceRow
              label="الخصم"
              value={`- ${fromMinor(
                pricing.customerDiscountMinor ??
                pricing.customerDiscountAmountMinor ??
                pricing.discountMinor,
                currency
              )}`}
              icon={TrendingDown}
              iconClass="text-red-400"
              negative
            />
          )}

          <FinanceRow
            label="إجمالي ما دفعه العميل"
            value={fromMinor(
              pricing.customerPayableMinor ??
              pricing.customerPayableAmountMinor,
              currency
            )}
            icon={Banknote}
            iconClass="text-emerald-500"
            highlight
          />

          <div className="pt-3 border-t border-gray-100 mt-1 space-y-1">
            <FinanceRow
              label="عمولة المنصة"
              value={fromMinor(
                pricing.platformCommissionAmountMinor ??
                pricing.platformCommissionChargedMinor,
                currency
              )}
              icon={ShieldCheck}
              iconClass="text-blue-400"
            />
            <FinanceRow
              label="إجمالي المزود الإجمالي"
              value={fromMinor(
                pricing.providerGrossAmountMinor,
                currency
              )}
              icon={Banknote}
              iconClass="text-blue-300"
            />
            <FinanceRow
              label="صافي أرباح المزود"
              value={fromMinor(
                pricing.providerNetAmountMinor ??
                pricing.providerNetEarningMinor,
                currency
              )}
              icon={TrendingUp}
              iconClass="text-green-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-left">
          * جميع المبالغ بالعملة: {currency}
        </p>
      </Card>

    </div>
  );
}
