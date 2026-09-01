import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import {
  ArrowLeft,
  Check,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import baseToast from "react-hot-toast";
import Pagination from "../../../shared/components/ui/Pagination";
import Badge from "../../../shared/components/ui/Badge";
import Modal from "../../../shared/components/ui/Modal";
import { getServices } from "../../api/endpoints/services.api";
import {
  getProviderCarTypes,
  getProviderManagement,
  getProviderVerificationDocument,
  managementErrorMessage,
  managementFieldErrorMessage,
} from "../../api/endpoints/providerManagement.api";
import {
  useCreateAdminProviderProfile,
  usePatchProviderManagement,
  useProviderManagementDetail,
  useProviderManagementList,
  useRegisteredProviderApplicant,
} from "./useProviderManagement";
import CoverageMapPicker from "./components/CoverageMapPicker";

const tabs = [
  ["overview", "نظرة عامة"],
  ["profile", "الملف التعريفي"],
  ["members", "الأعضاء"],
  ["services", "الخدمات والأسعار"],
  ["coverage", "نطاق التغطية"],
  ["schedule", "جدول العمل"],
  ["availability", "التوفر"],
];
const dayNames = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const dateLabel = (value) =>
  value ? new Date(value).toLocaleString("ar-EG") : "—";
const minutesToTime = (minutes) => {
  const value = Number(minutes);
  if (!Number.isFinite(value)) return "00:00";
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (value % 60).toString().padStart(2, "0");
  return `${hours}:${remainder}`;
};
const timeToMinutes = (value) => {
  const [hours, minutes] = String(value || "00:00")
    .split(":")
    .map(Number);
  return hours * 60 + minutes;
};

/** Uses only member state explicitly returned by the management response. */
const isEligibleCompanyFieldMember = (member, ownerUserId) => {
  if (!member || member.userId === ownerUserId || member.leftAt) return false;

  const memberStatus = member.status?.code || member.membershipStatus;
  const userStatus = member.user?.status?.code || member.user?.status;
  if (memberStatus && memberStatus !== "ACTIVE") return false;
  if (userStatus && userStatus !== "ACTIVE") return false;
  if (member.operationalProfile?.activeIs === false) return false;
  if (member.user?.isActive === false || member.userIsActive === false)
    return false;

  return true;
};
const statusVariant = (status) =>
  ({
    APPROVED: "success",
    ACTIVE: "success",
    READY: "success",
    PENDING_REVIEW: "warning",
    NOT_READY: "warning",
    REJECTED: "danger",
    SUSPENDED: "danger",
    CLOSED: "danger",
    INACTIVE: "default",
  })[status] || "default";
const labels = {
  INDIVIDUAL: "فردي",
  COMPANY: "شركة",
  APPROVED: "معتمد",
  PENDING_REVIEW: "قيد المراجعة",
  REJECTED: "مرفوض",
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  SUSPENDED: "موقوف",
  CLOSED: "مغلق",
  READY: "جاهز",
  NOT_READY: "غير مكتمل",
  REGISTERED_ONLY: "التسجيل غير مكتمل",
  PROFILE_CREATED: "تم إنشاء الملف",
  providerProfile: "Provider Profile",
  UNAVAILABLE: "غير متاح",
  AVAILABLE_OVERRIDE: "توفير استثنائي",
  ALL_MEMBERS: "كل الأعضاء",
  SELECTED_MEMBERS: "أعضاء محددون",
};
const pretty = (value) =>
  labels[value] || String(value || "—").replaceAll("_", " ");
const uiLabels = {
  "Provider Management": "إدارة مقدمي الخدمة",
  "Review and maintain provider data using the management facade.":
    "مراجعة وتحديث بيانات مقدمي الخدمة من خلال واجهة الإدارة.",
  Overview: "نظرة عامة",
  Profile: "الملف التعريفي",
  Members: "الأعضاء",
  "Services & Prices": "الخدمات والأسعار",
  Coverage: "نطاق التغطية",
  "Work Schedule": "جدول العمل",
  Availability: "التوفر",
  Provider: "مقدم الخدمة",
  "Provider type": "نوع مقدم الخدمة",
  Approval: "حالة الاعتماد",
  Lifecycle: "الحالة التشغيلية",
  "Owner status": "حالة المالك",
  "All types": "كل الأنواع",
  "All statuses": "كل الحالات",
  "All owners": "كل الملاك",
  Any: "الكل",
  "All lifecycle": "كل الحالات",
  "Any readiness": "الكل",
  Readiness: "الجاهزية",
  "Loading provider management…": "جارٍ تحميل بيانات مقدم الخدمة…",
  "Provider unavailable": "مقدم الخدمة غير متاح",
  Retry: "إعادة المحاولة",
  "Back to Provider Management": "العودة إلى إدارة مقدمي الخدمة",
  Refresh: "تحديث",
  Save: "حفظ",
  Cancel: "إلغاء",
  "Access restricted": "الوصول مقيد",
  "Profile details": "بيانات الملف التعريفي",
  "Save profile": "حفظ الملف التعريفي",
  "Owner full name": "الاسم الكامل للمالك",
  "Owner email": "البريد الإلكتروني للمالك",
  "Business name (Arabic)": "اسم النشاط بالعربية",
  "Business name (English)": "اسم النشاط بالإنجليزية",
  "Description (Arabic)": "الوصف بالعربية",
  "Description (English)": "الوصف بالإنجليزية",
  "Commercial registration": "السجل التجاري",
  "Address title": "عنوان العنوان",
  City: "المدينة",
  Area: "المنطقة",
  Street: "الشارع",
  "Building number": "رقم المبنى",
  Latitude: "خط العرض",
  Longitude: "خط الطول",
  "Address notes": "ملاحظات العنوان",
  "Provider media": "وسائط مقدم الخدمة",
  "Verification document": "مستند التحقق",
  "Choose file": "اختيار ملف",
  "Existing company members": "أعضاء الشركة الحاليون",
  Member: "العضو",
  Status: "الحالة",
  Joined: "تاريخ الانضمام",
  Actions: "الإجراءات",
  Identity: "البيانات الشخصية",
  Operational: "البيانات التشغيلية",
  "Edit identity profile": "تعديل البيانات الشخصية",
  "Edit operational profile": "تعديل البيانات التشغيلية",
  "Full name": "الاسم الكامل",
  Phone: "الهاتف",
  "Display name (Arabic)": "الاسم الظاهر بالعربية",
  "Display name (English)": "الاسم الظاهر بالإنجليزية",
  "Bio (Arabic)": "النبذة بالعربية",
  "Bio (English)": "النبذة بالإنجليزية",
  "Public phone": "الهاتف العام",
  "Provider services": "خدمات مقدم الخدمة",
  "Catalog service": "خدمة الكتالوج",
  "All members": "كل الأعضاء",
  "Selected members": "أعضاء محددون",
  Add: "إضافة",
  State: "الحالة",
  Prices: "الأسعار",
  Activate: "تفعيل",
  Deactivate: "إيقاف",
  "Service prices": "أسعار الخدمات",
  "Provider service": "خدمة مقدم الخدمة",
  "Car type": "نوع السيارة",
  Price: "السعر",
  Minutes: "المدة بالدقائق",
  Effective: "ساري من",
  Open: "مفتوح",
  Active: "نشط",
  Inactive: "غير نشط",
  Edit: "تعديل",
  "Add price": "إضافة سعر",
  "Update price": "تحديث السعر",
  "Provider coverage": "نطاق تغطية مقدم الخدمة",
  "Create zone": "إنشاء نطاق",
  "Update zone": "تحديث النطاق",
  "Save assignments": "حفظ التعيينات",
  Label: "الاسم",
  Radius: "نصف القطر",
  "Radius (m)": "نصف القطر (متر)",
  Coordinates: "الإحداثيات",
  Assignments: "التعيينات",
  Zone: "النطاق",
  "Replace assignments": "استبدال التعيينات",
  "COMPANY coverage": "نطاق تغطية الشركة",
  "INDIVIDUAL coverage": "نطاق تغطية مقدم الخدمة الفردي",
  "Weekly schedule": "الجدول الأسبوعي",
  "Replace weekly": "استبدال الجدول الأسبوعي",
  "Schedule member": "عضو الجدول",
  Timezone: "المنطقة الزمنية",
  Day: "اليوم",
  "Start minute": "دقيقة البداية",
  "End minute": "دقيقة النهاية",
  Remove: "حذف",
  "Add period": "إضافة فترة",
  "Schedule exceptions": "استثناءات الجدول",
  Type: "النوع",
  "Starts at": "يبدأ في",
  "Ends at": "ينتهي في",
  Reason: "السبب",
  "Create exception": "إنشاء استثناء",
  "Delete this schedule exception?": "هل تريد حذف استثناء الجدول هذا؟",
  "Clear weekly schedule?": "مسح الجدول الأسبوعي؟",
  "Confirm clear": "تأكيد المسح",
  "Available for bookings": "متاح للحجوزات",
  "Unavailable for bookings": "غير متاح للحجوزات",
  "Loading coverage…": "جارٍ تحميل نطاق التغطية…",
  "Loading schedule…": "جارٍ تحميل جدول العمل…",
  "Unable to load this provider.": "تعذر تحميل بيانات مقدم الخدمة.",
  "Individual providers use the owner/member model; there is no company staff editor here.":
    "مقدم الخدمة الفردي يستخدم نموذج المالك والعضو؛ لا توجد إدارة موظفي شركة هنا.",
  "Coverage model is read-only and comes from the backend. Coordinates and radius are sent unchanged.":
    "نموذج التغطية للعرض فقط ومصدره النظام. سيتم إرسال الإحداثيات ونصف القطر كما هي.",
  "Selected eligible members": "الأعضاء المؤهلون المحددون",
  "Unnamed zone": "نطاق بلا اسم",
  "Owner member": "عضو المالك",
  "The backend treats this as replace-all. Clearing every period requires explicit confirmation.":
    "استبدال الجدول يتم بالكامل. يتطلب مسح كل الفترات تأكيدًا صريحًا.",
  "The backend may reject this command based on approval, lifecycle, or financial rules.":
    "قد يرفض النظام هذا الطلب حسب الاعتماد أو الحالة التشغيلية أو القواعد المالية.",
};
const extraUiLabels = {
  Delete: "حذف",
  Unavailable: "غير متاح",
  "Available override": "توافر استثنائي",
  Available: "متاح",
  "File limits: logo 2 MB, cover 5 MB, verification document 10 MB. The API accepts one file per field and at most three files per request.":
    "حدود الملفات: الشعار 2 ميجابايت، الغلاف 5 ميجابايت، ومستند التحقق 10 ميجابايت. يقبل النظام ملفًا واحدًا لكل حقل وبحد أقصى ثلاثة ملفات في الطلب.",
  Current: "الحالي",
  Uploaded: "تم الرفع",
  "Replacement is not available while this document exists.":
    "لا يمكن الاستبدال ما دام هذا المستند موجودًا.",
  "This pending provider can receive its missing verification document. Uploading does not change approval or availability.":
    "يمكن لمقدم الخدمة قيد المراجعة استلام مستند التحقق المفقود. لا يغير الرفع حالة الاعتماد أو التوفر.",
  "Member updated.": "تم تحديث العضو.",
  "Profile updated.": "تم تحديث الملف التعريفي.",
  "Coverage saved.": "تم حفظ نطاق التغطية.",
  Saved: "تم الحفظ.",
  "Weekly schedule replaced.": "تم استبدال الجدول الأسبوعي.",
  "Exception created.": "تم إنشاء الاستثناء.",
  "Exception deleted.": "تم حذف الاستثناء.",
  "Select an eligible schedule member first.":
    "اختر عضوًا مؤهلًا للجدول أولًا.",
  "Select a member and both exception dates.":
    "اختر عضوًا وأدخل تاريخي الاستثناء.",
  "Catalog service": "خدمة الكتالوج",
  "Provider service": "خدمة مقدم الخدمة",
  "Car type": "نوع السيارة",
  Price: "السعر",
  Minutes: "الدقائق",
  "Service prices": "أسعار الخدمات",
  "Provider services": "خدمات مقدم الخدمة",
  State: "الحالة",
  Prices: "الأسعار",
  Actions: "الإجراءات",
  "Create zone": "إنشاء نطاق",
  "Update zone": "تحديث النطاق",
  "Save assignments": "حفظ التعيينات",
  "Replace assignments": "استبدال التعيينات",
  Zone: "النطاق",
  Coordinates: "الإحداثيات",
  Radius: "نصف القطر",
  "Radius (m)": "نصف القطر (متر)",
  Assignments: "التعيينات",
  "All members": "كل الأعضاء",
  "Selected members": "أعضاء محددون",
  Add: "إضافة",
  Activate: "تفعيل",
  Deactivate: "إيقاف",
  Edit: "تعديل",
  "Add price": "إضافة سعر",
  "Update price": "تحديث السعر",
  Open: "مفتوح",
  Active: "نشط",
  Inactive: "غير نشط",
  "Availability updated.": "تم تحديث التوفر.",
  "Loading provider management…": "جارٍ تحميل إدارة مقدمي الخدمة…",
  "Loading coverage…": "جارٍ تحميل نطاق التغطية…",
  "Loading schedule…": "جارٍ تحميل جدول العمل…",
  "Unable to load this provider.": "تعذر تحميل بيانات مقدم الخدمة.",
  Retry: "إعادة المحاولة",
  Refresh: "تحديث",
  Save: "حفظ",
  Cancel: "إلغاء",
  "Back to Provider Management": "العودة إلى إدارة مقدمي الخدمة",
  "Access restricted": "الوصول مقيد",
  Provider: "مقدم الخدمة",
};
const translateUi = (value) =>
  typeof value === "string"
    ? uiLabels[value] || extraUiLabels[value] || value
    : value;
const translateNode = (node) =>
  Array.isArray(node)
    ? node.map(translateNode)
    : typeof node === "string"
      ? translateUi(node)
      : isValidElement(node)
        ? cloneElement(
            node,
            {},
            Children.map(node.props.children, translateNode),
          )
        : node;
const toast = {
  success: (message) => baseToast.success(translateUi(message)),
  error: (message) => baseToast.error(translateUi(message)),
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  className = "",
  min,
  max,
  step,
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-gray-500 mb-1">
        {translateUi(label)}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 mb-1">
        {translateUi(label)}
      </span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children, disabled = false }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 mb-1">
        {translateUi(label)}
      </span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
      >
        {Children.map(children, translateNode)}
      </select>
    </label>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-bold text-gray-900">
          {translateUi(title)}
        </h2>
        {action}
      </div>
      {translateNode(children)}
    </section>
  );
}

function BusyButton({
  children,
  busy,
  disabled = false,
  onClick,
  danger = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {busy && <RefreshCw size={14} className="animate-spin" />}
      {Children.map(children, translateNode)}
    </button>
  );
}

function ProviderList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [dateFilters, setDateFilters] = useState({
    createdFrom: "",
    createdTo: "",
  });
  const [filters, setFilters] = useState({
    typeProvider: "",
    approvalStatus: "",
    userStatus: "",
    availableIs: "",
    lifecycleStatus: "",
    registrationStage: "",
    readiness: "",
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  const query = {
    page,
    limit: 20,
    search: appliedSearch,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...filters,
    createdFrom: dateFilters.createdFrom
      ? `${dateFilters.createdFrom}T00:00:00.000Z`
      : "",
    createdTo: dateFilters.createdTo
      ? `${dateFilters.createdTo}T23:59:59.999Z`
      : "",
  };
  const { data, isLoading, isError, error, refetch } =
    useProviderManagementList(query);
  const items = data?.items || [];
  const meta = data?.meta || { page, limit: 20, total: 0, totalPages: 1 };
  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const setDateFilter = (key, value) => {
    setDateFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const clear = () => {
    setSearch("");
    setAppliedSearch("");
    setFilters({
      typeProvider: "",
      approvalStatus: "",
      userStatus: "",
      availableIs: "",
      lifecycleStatus: "",
      registrationStage: "",
      readiness: "",
    });
    setDateFilters({ createdFrom: "", createdTo: "" });
    setPage(1);
  };
  const headings = [
    "النشاط / المالك",
    "رقم الهاتف",
    "التسجيل",
    "الملف",
    "النوع",
    "الاعتماد",
    "التوفر",
    "الحالة التشغيلية",
    "الجاهزية",
    "آخر تحديث",
  ];
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            إدارة مقدمي الخدمة
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مراجعة وتحديث بيانات مقدمي الخدمة من خلال واجهة الإدارة.
          </p>
        </div>
        <div className="text-sm text-gray-500">{meta.total || 0} مقدم خدمة</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            dir="rtl"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم النشاط أو المالك أو الهاتف أو البريد"
            className="min-w-[260px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={clear}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            مسح الفلاتر
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <SelectField
            label="مرحلة التسجيل"
            value={filters.registrationStage}
            onChange={(v) => setFilter("registrationStage", v)}
          >
            <option value="">الكل</option>
            <option value="REGISTERED_ONLY">التسجيل غير مكتمل</option>
            <option value="PROFILE_CREATED">تم إنشاء الملف</option>
          </SelectField>
          <SelectField
            label="نوع مقدم الخدمة"
            value={filters.typeProvider}
            onChange={(v) => setFilter("typeProvider", v)}
          >
            <option value="">كل الأنواع</option>
            <option value="INDIVIDUAL">فردي</option>
            <option value="COMPANY">شركة</option>
          </SelectField>
          <SelectField
            label="حالة الاعتماد"
            value={filters.approvalStatus}
            onChange={(v) => setFilter("approvalStatus", v)}
          >
            <option value="">كل الحالات</option>
            <option value="PENDING_REVIEW">قيد المراجعة</option>
            <option value="APPROVED">معتمد</option>
            <option value="REJECTED">مرفوض</option>
          </SelectField>
          <SelectField
            label="حالة المالك"
            value={filters.userStatus}
            onChange={(v) => setFilter("userStatus", v)}
          >
            <option value="">كل الملاك</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
          </SelectField>
          <SelectField
            label="التوفر"
            value={filters.availableIs}
            onChange={(v) => setFilter("availableIs", v)}
          >
            <option value="">الكل</option>
            <option value="true">متاح</option>
            <option value="false">غير متاح</option>
          </SelectField>
          <SelectField
            label="الحالة التشغيلية"
            value={filters.lifecycleStatus}
            onChange={(v) => setFilter("lifecycleStatus", v)}
          >
            <option value="">كل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="SUSPENDED">موقوف</option>
            <option value="CLOSED">مغلق</option>
          </SelectField>
          <SelectField
            label="الجاهزية"
            value={filters.readiness}
            onChange={(v) => setFilter("readiness", v)}
          >
            <option value="">الكل</option>
            <option value="READY">جاهز</option>
            <option value="NOT_READY">غير مكتمل</option>
          </SelectField>
          <label className="block text-sm text-gray-700">
            <span className="mb-1 block text-xs font-semibold text-gray-500">
              من تاريخ
            </span>
            <input
              type="date"
              value={dateFilters.createdFrom}
              max={dateFilters.createdTo || undefined}
              onChange={(event) =>
                setDateFilter("createdFrom", event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm text-gray-700">
            <span className="mb-1 block text-xs font-semibold text-gray-500">
              إلى تاريخ
            </span>
            <input
              type="date"
              value={dateFilters.createdTo}
              min={dateFilters.createdFrom || undefined}
              onChange={(event) =>
                setDateFilter("createdTo", event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            جارٍ تحميل مقدمي الخدمة…
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-red-600 font-semibold">
              {managementErrorMessage(error)}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            لا يوجد مقدمو خدمة مطابقون للفلاتر.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {headings.map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-start text-xs font-bold text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((provider) => (
                  <tr
                    key={
                      provider.providerId ||
                      `registered-${provider.ownerUserId}`
                    }
                    onClick={() => {
                      if (provider.providerId) {
                        navigate(
                          `/admin/provider-management/${provider.providerId}`,
                        );
                        return;
                      }
                      if (provider.ownerUserId) {
                        navigate(
                          `/admin/provider-management/registered/${provider.ownerUserId}`,
                        );
                      }
                    }}
                    className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">
                        {provider.businessNameAr ||
                          provider.businessName ||
                          (provider.registrationStage === "REGISTERED_ONLY"
                            ? "حساب مقدم خدمة مسجل"
                            : "بدون اسم")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {provider.owner?.fullName || "—"} ·{" "}
                        {provider.owner?.email || "—"}
                      </p>
                    </td>
                    <td
                      className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap"
                      dir="ltr"
                    >
                      {provider.owner?.phone || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          provider.registrationStage === "REGISTERED_ONLY"
                            ? "warning"
                            : "success"
                        }
                      >
                        {pretty(provider.registrationStage)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      {provider.profileExists ? (
                        <span className="text-sm text-green-700">
                          تم إنشاء الملف
                        </span>
                      ) : (
                        <span className="text-sm text-amber-700">
                          لم يتم إنشاء الملف
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {provider.typeProvider ? (
                        <Badge variant="info">
                          {pretty(provider.typeProvider)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">
                          لم يتم تحديده بعد
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {provider.approvalStatus ? (
                        <Badge variant={statusVariant(provider.approvalStatus)}>
                          {pretty(provider.approvalStatus)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {provider.availableIs === null ||
                      provider.availableIs === undefined ? (
                        "—"
                      ) : (
                        <span
                          className={
                            provider.availableIs
                              ? "text-green-700"
                              : "text-gray-500"
                          }
                        >
                          {provider.availableIs ? "متاح" : "غير متاح"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {provider.lifecycleStatus ? (
                        <Badge
                          variant={statusVariant(provider.lifecycleStatus)}
                        >
                          {pretty(provider.lifecycleStatus)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          provider.readyForReview ? "success" : "warning"
                        }
                      >
                        {provider.readyForReview ? "جاهز" : "غير مكتمل"}
                      </Badge>
                      {provider.missingFields?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          ناقص: {provider.missingFields.map(pretty).join("، ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {dateLabel(provider.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={meta.page || page}
          totalResults={meta.total || 0}
          pageSize={meta.limit || 20}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function Overview({ item, profile }) {
  const missing = item?.missingFields || [];
  const stats = [
    ["نوع مقدم الخدمة", item?.typeProvider],
    ["حالة الاعتماد", item?.approvalStatus],
    ["الحالة التشغيلية", item?.lifecycleStatus],
    ["التوفر", item?.availableIs ? "متاح" : "غير متاح"],
    ["الجاهزية", item?.readyForReview ? "READY" : "NOT_READY"],
    ["الأعضاء", item?.membersCount],
    ["الخدمات", item?.servicesCount],
    ["آخر تحديث", dateLabel(item?.updatedAt)],
  ];
  return (
    <div className="space-y-5" dir="rtl">
      <SectionCard title="الحالة المعتمدة من النظام">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {[
                  "نوع مقدم الخدمة",
                  "حالة الاعتماد",
                  "الحالة التشغيلية",
                  "الجاهزية",
                ].includes(label) ? (
                  <Badge variant={statusVariant(value)}>{pretty(value)}</Badge>
                ) : (
                  value
                )}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="بيانات النشاط والمالك">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">اسم النشاط</p>
            <p className="font-semibold">
              {profile?.nameBusinessAr ||
                profile?.nameBusinessEn ||
                item?.businessNameAr ||
                item?.businessName ||
                "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">المالك</p>
            <p className="font-semibold">
              {profile?.owner?.fullName || item?.owner?.fullName || "—"}
            </p>
            <p className="text-gray-500" dir="ltr">
              {profile?.owner?.email ||
                item?.owner?.email ||
                profile?.owner?.phone ||
                "—"}
            </p>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="حقول المراجعة">
        <p className="text-sm text-gray-500">
          هذه القيم محسوبة من فحص الجاهزية في النظام.
        </p>
        {missing.length ? (
          <ul className="mt-3 list-disc ps-5 text-sm text-amber-700">
            {missing.map((field) => (
              <li key={field}>{pretty(field)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
            <Check size={16} /> لا توجد حقول ناقصة
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function ProfileTab({ providerId, item, profile, onSaved }) {
  const patch = usePatchProviderManagement(providerId);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  useEffect(() => {
    if (profile)
      setForm({
        fullName: profile.owner?.fullName || "",
        email: profile.owner?.email || "",
        nameBusinessAr: profile.nameBusinessAr || "",
        nameBusinessEn: profile.nameBusinessEn || "",
        descriptionAr: profile.descriptionAr || "",
        descriptionEn: profile.descriptionEn || "",
        registerCommercial: profile.registerCommercial || "",
        addressTitle: profile.address?.title || "",
        addressCity: profile.address?.city || "",
        addressArea: profile.address?.area || "",
        addressStreet: profile.address?.street || "",
        addressBuildingNumber: profile.address?.buildingNumber || "",
        addressLatitude: profile.address?.latitude ?? "",
        addressLongitude: profile.address?.longitude ?? "",
        addressNotes: profile.address?.notes || "",
      });
  }, [profile]);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = () => {
    const payload = Object.fromEntries(
      Object.entries({
        ...form,
        addressLatitude:
          form.addressLatitude === ""
            ? undefined
            : Number(form.addressLatitude),
        addressLongitude:
          form.addressLongitude === ""
            ? undefined
            : Number(form.addressLongitude),
      }).filter(([, value]) => value !== "" && value !== undefined),
    );
    patch.mutate(
      {
        section: {
          profile: {
            ...payload,
            expectedUpdatedAt: profile?.atUpdated || item?.updatedAt,
          },
        },
        files: { logo: files.logo, cover: files.cover },
      },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          setFiles((current) => ({ ...current, logo: null, cover: null }));
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  const selectMediaFile = (field, event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const validationMessage = validateProviderFile(field, selected);
    if (validationMessage) {
      toast.error(validationMessage);
      event.target.value = "";
      return;
    }
    setFiles((current) => ({ ...current, [field]: selected }));
  };
  const cancelMediaSelection = (field) =>
    setFiles((current) => ({ ...current, [field]: null }));
  const verificationMissing = !profile?.files?.verificationDocument;
  const replaceVerificationDocument = () => {
    const file = files.verificationDocument;
    const validationMessage = validateProviderFile(
      "verificationDocument",
      file,
    );
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    patch.mutate(
      {
        section: {
          profile: { expectedUpdatedAt: profile?.atUpdated || item?.updatedAt },
        },
        files: { verificationDocument: file },
      },
      {
        onSuccess: () => {
          toast.success("تم استبدال مستند التحقق بنجاح");
          setFiles((current) => ({ ...current, verificationDocument: null }));
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  const viewVerificationDocument = async () => {
    const document = profile?.files?.verificationDocument;
    if (!document) return;
    try {
      if (!document.mediaId && document.url) {
        window.open(document.url, "_blank", "noopener,noreferrer");
        return;
      }
      const blob = await getProviderVerificationDocument(
        providerId,
        document.mediaId,
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error(managementErrorMessage(error));
    }
  };
  return (
    <div className="space-y-5">
      <SectionCard
        title="Profile details"
        action={
          <BusyButton busy={patch.isPending} onClick={save}>
            <Save size={15} />
            Save profile
          </BusyButton>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Owner full name"
            value={form.fullName}
            onChange={(v) => set("fullName", v)}
          />
          <Field
            label="Owner email"
            value={form.email}
            onChange={(v) => set("email", v)}
            type="email"
          />
          <Field
            label="Business name (Arabic)"
            value={form.nameBusinessAr}
            onChange={(v) => set("nameBusinessAr", v)}
          />
          <Field
            label="Business name (English)"
            value={form.nameBusinessEn}
            onChange={(v) => set("nameBusinessEn", v)}
          />
          <TextArea
            label="Description (Arabic)"
            value={form.descriptionAr}
            onChange={(v) => set("descriptionAr", v)}
          />
          <TextArea
            label="Description (English)"
            value={form.descriptionEn}
            onChange={(v) => set("descriptionEn", v)}
          />
          <Field
            label="Commercial registration"
            value={form.registerCommercial}
            onChange={(v) => set("registerCommercial", v)}
          />
          <Field
            label="Address title"
            value={form.addressTitle}
            onChange={(v) => set("addressTitle", v)}
          />
          <Field
            label="City"
            value={form.addressCity}
            onChange={(v) => set("addressCity", v)}
          />
          <Field
            label="Area"
            value={form.addressArea}
            onChange={(v) => set("addressArea", v)}
          />
          <Field
            label="Street"
            value={form.addressStreet}
            onChange={(v) => set("addressStreet", v)}
          />
          <Field
            label="Building number"
            value={form.addressBuildingNumber}
            onChange={(v) => set("addressBuildingNumber", v)}
          />
          <Field
            label="Latitude"
            value={form.addressLatitude}
            onChange={(v) => set("addressLatitude", v)}
            type="number"
          />
          <Field
            label="Longitude"
            value={form.addressLongitude}
            onChange={(v) => set("addressLongitude", v)}
            type="number"
          />
          <TextArea
            label="Address notes"
            value={form.addressNotes}
            onChange={(v) => set("addressNotes", v)}
          />
        </div>
      </SectionCard>
      <SectionCard title="Provider media">
        <p className="text-xs text-gray-500 mb-3">
          File limits: logo 2 MB, cover 5 MB, verification document 10 MB. The
          API accepts one file per field and at most three files per request.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {["logo", "cover"].map((field) => {
            const existing = profile?.files?.[field];
            const title = field === "logo" ? "Logo" : "Cover";
            const alt =
              field === "logo" ? "شعار مقدم الخدمة" : "غلاف مقدم الخدمة";
            return (
              <div
                key={field}
                className="rounded-lg border border-gray-200 p-4"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Upload size={16} />
                  {title}
                </span>
                {existing && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">
                      Current
                    </p>
                    <MediaImagePreview
                      src={existing.url}
                      alt={alt}
                      mode={field === "cover" ? "cover" : "contain"}
                    />
                    <p className="mt-2 truncate text-xs text-gray-500">
                      Current: {existing.fileName || "Uploaded"}
                    </p>
                    {existing.url && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            existing.url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="mt-2 rounded-lg border px-2 py-1 text-xs font-semibold text-gray-700"
                      >
                        عرض الملف
                      </button>
                    )}
                  </div>
                )}
                {!existing && !files[field] && (
                  <div className="mt-3 flex h-32 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-500">
                    No current {title.toLowerCase()}
                  </div>
                )}
                <LocalFilePreview
                  field={field}
                  file={files[field]}
                  onCancel={() => cancelMediaSelection(field)}
                />
                <label
                  role="button"
                  tabIndex={0}
                  onKeyDown={openFilePickerFromKeyboard}
                  className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <Upload size={12} /> Choose new image
                  <input
                    key={files[field]?.name || "empty"}
                    type="file"
                    accept={createFileRules[field].accept}
                    className="hidden"
                    onChange={(event) => selectMediaFile(field, event)}
                  />
                </label>
              </div>
            );
          })}
          <VerificationMediaCard
            providerId={providerId}
            current={profile?.files?.verificationDocument}
            selected={files.verificationDocument}
            pending={patch.isPending}
            onViewCurrent={viewVerificationDocument}
            onSelect={(event) => selectMediaFile("verificationDocument", event)}
            onCancel={() => cancelMediaSelection("verificationDocument")}
            onSave={replaceVerificationDocument}
          />
        </div>
        {verificationMissing && (
          <p className="mt-3 text-sm text-amber-700">
            لا يوجد مستند تحقق حالي. رفع المستند لا يغيّر حالة الاعتماد أو
            التوفر تلقائيًا.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

function MembersTab({ providerId, item, members, onSaved, ownerUserId }) {
  const patch = usePatchProviderManagement(providerId);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  if (item?.typeProvider !== "COMPANY")
    return (
      <SectionCard title="Members">
        <p className="text-sm text-gray-500">
          Individual providers use the owner/member model; there is no company
          staff editor here.
        </p>
      </SectionCard>
    );
  const rows = members?.items || [];
  const save = () => {
    const action =
      editing.mode === "identity"
        ? "UPDATE_IDENTITY"
        : "UPDATE_OPERATIONAL_PROFILE";
    const payload =
      editing.mode === "identity"
        ? { fullName: form.fullName, phone: form.phone }
        : {
            displayNameAr: form.displayNameAr,
            displayNameEn: form.displayNameEn,
            bioAr: form.bioAr,
            bioEn: form.bioEn,
            avatarUrl: form.avatarUrl,
            publicPhone: form.publicPhone,
            activeIs: form.activeIs,
          };
    patch.mutate(
      {
        section: {
          member: {
            action,
            memberId: editing.id,
            expectedUpdatedAt: editing.updatedAt,
            ...payload,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Member updated.");
          setEditing(null);
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  return (
    <SectionCard title="Existing company members">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b text-xs text-gray-500">
              <th className="px-3 py-2 text-start">Member</th>
              <th className="px-3 py-2 text-start">Status</th>
              <th className="px-3 py-2 text-start">Joined</th>
              <th className="px-3 py-2 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => (
              <tr key={member.id} className="border-b border-gray-50">
                <td className="px-3 py-3">
                  <p className="font-semibold">
                    {member.user?.fullName || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.user?.email || member.user?.phone || "—"}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <Badge variant={statusVariant(member.status?.code)}>
                    {pretty(member.status?.code)}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {dateLabel(member.joinedAt || member.atCreated)}
                </td>
                <td className="px-3 py-3 text-end">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditing({
                          ...member,
                          mode: "identity",
                          updatedAt: member.atUpdated,
                        });
                        setForm({
                          fullName: member.user?.fullName || "",
                          phone: member.user?.phone || "",
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs"
                    >
                      <Pencil size={13} />
                      Identity
                    </button>
                    <button
                      onClick={() => {
                        setEditing({
                          ...member,
                          mode: "operational",
                          updatedAt: member.atUpdated,
                        });
                        setForm({
                          ...member.operationalProfile,
                          activeIs: member.operationalProfile?.activeIs ?? true,
                        });
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-xs"
                    >
                      <Pencil size={13} />
                      Operational
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal
          title={`Edit ${editing.mode} profile`}
          onClose={() => setEditing(null)}
        >
          <div className="space-y-4">
            {editing.mode === "identity" ? (
              <>
                <Field
                  label="Full name"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
              </>
            ) : (
              <>
                <Field
                  label="Display name (Arabic)"
                  value={form.displayNameAr}
                  onChange={(v) => setForm({ ...form, displayNameAr: v })}
                />
                <Field
                  label="Display name (English)"
                  value={form.displayNameEn}
                  onChange={(v) => setForm({ ...form, displayNameEn: v })}
                />
                <TextArea
                  label="Bio (Arabic)"
                  value={form.bioAr}
                  onChange={(v) => setForm({ ...form, bioAr: v })}
                />
                <TextArea
                  label="Bio (English)"
                  value={form.bioEn}
                  onChange={(v) => setForm({ ...form, bioEn: v })}
                />
                <Field
                  label="Public phone"
                  value={form.publicPhone}
                  onChange={(v) => setForm({ ...form, publicPhone: v })}
                />
              </>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <BusyButton busy={patch.isPending} onClick={save}>
                Save
              </BusyButton>
            </div>
          </div>
        </Modal>
      )}
    </SectionCard>
  );
}

function ServicesTab({ providerId, services, onSaved }) {
  const patch = usePatchProviderManagement(providerId);
  const catalog = useQuery({
    queryKey: ["catalog-services"],
    queryFn: getServices,
    staleTime: 60_000,
  });
  const carTypes = useQuery({
    queryKey: ["catalog-car-types"],
    queryFn: getProviderCarTypes,
    staleTime: 60_000,
  });
  const [serviceForm, setServiceForm] = useState({
    serviceId: "",
    availableIs: true,
  });
  const [priceForm, setPriceForm] = useState({
    providerServiceId: "",
    carTypeId: "",
    priceProvider: "",
    minutesDuration: "",
    fromEffective: new Date().toISOString().slice(0, 10),
    toEffective: "",
  });
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceEditAvailable, setServiceEditAvailable] = useState(true);
  const [selectedProviderServiceId, setSelectedProviderServiceId] =
    useState("");
  const [pricesPage, setPricesPage] = useState(1);
  const priceDetail = useProviderManagementDetail(providerId, {
    include: ["servicePrices"],
    providerServiceId: selectedProviderServiceId,
    pricesPage,
    pricesLimit: 20,
    enabled: Boolean(selectedProviderServiceId),
    staleTime: 0,
  });
  const serviceRows = services?.items || [];
  const selectedService = serviceRows.find(
    (service) => service.id === selectedProviderServiceId,
  );
  const selectedServiceName = selectedService
    ? selectedService.service?.nameAr ||
      selectedService.service?.nameEn ||
      selectedService.serviceId
    : "";
  const filteredPrices = priceDetail.data?.included?.servicePrices;
  const priceRows = filteredPrices?.items || [];
  const pricesMeta = filteredPrices?.meta || {
    page: pricesPage,
    limit: 20,
    total: 0,
    totalPages: 1,
  };
  const availableCarTypes = Array.isArray(carTypes.data)
    ? carTypes.data
    : carTypes.data?.items || [];
  const emptyPriceForm = (providerServiceId = "") => ({
    providerServiceId,
    carTypeId: "",
    priceProvider: "",
    minutesDuration: "",
    fromEffective: new Date().toISOString().slice(0, 10),
    toEffective: "",
  });
  const selectServicePrices = (providerServiceId) => {
    setSelectedProviderServiceId(providerServiceId);
    setPricesPage(1);
    setEditingPrice(null);
    setPriceModalOpen(false);
  };
  const closePriceModal = () => {
    setPriceModalOpen(false);
    setEditingPrice(null);
    setPriceForm(emptyPriceForm());
  };
  const openPriceModal = (price = null) => {
    setEditingPrice(price);
    setPriceForm(
      price
        ? {
            providerServiceId: price.providerServiceId,
            carTypeId: price.carTypeId,
            priceProvider: price.priceProvider,
            minutesDuration: price.minutesDuration,
            fromEffective: price.fromEffective?.slice(0, 10) || "",
            toEffective: price.toEffective?.slice(0, 10) || "",
          }
        : emptyPriceForm(selectedProviderServiceId),
    );
    setPriceModalOpen(true);
  };
  const openServiceEditor = (service) => {
    setEditingService(service);
    setServiceEditAvailable(Boolean(service.availableIs));
  };
  const submitServiceEdit = () => {
    if (!editingService) return;
    save({
      service: {
        action: "UPDATE_SERVICE",
        providerServiceId: editingService.id,
        expectedUpdatedAt: editingService.atUpdated,
        availableIs: serviceEditAvailable,
      },
    });
  };
  const save = (section) => {
    patch.mutate(
      { section },
      {
        onSuccess: () => {
          toast.success("Saved.");
          if (section.servicePrice) closePriceModal();
          if (section.service?.action === "UPDATE_SERVICE") {
            setEditingService(null);
          }
          onSaved();
          if (selectedProviderServiceId) priceDetail.refetch();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  const submitPrice = () => {
    if (
      !priceForm.providerServiceId ||
      !priceForm.priceProvider ||
      !priceForm.minutesDuration ||
      !priceForm.fromEffective ||
      (!editingPrice && !priceForm.carTypeId)
    ) {
      toast.error("أكمل بيانات السعر المطلوبة.");
      return;
    }
    const fields = {
      providerServiceId: priceForm.providerServiceId,
      priceProvider: Number(priceForm.priceProvider),
      minutesDuration: Number(priceForm.minutesDuration),
      fromEffective: new Date(priceForm.fromEffective).toISOString(),
      ...(priceForm.toEffective
        ? { toEffective: new Date(priceForm.toEffective).toISOString() }
        : {}),
    };
    save({
      servicePrice: editingPrice
        ? {
            action: "UPDATE_PRICE",
            priceId: editingPrice.id,
            expectedUpdatedAt: editingPrice.atUpdated,
            ...fields,
          }
        : { action: "CREATE_PRICE", carTypeId: priceForm.carTypeId, ...fields },
    });
  };
  return (
    <div className="space-y-5">
      <SectionCard
        title="Provider services"
        action={
          <div className="flex gap-2">
            <select
              value={serviceForm.serviceId}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, serviceId: e.target.value })
              }
              className="rounded-lg border px-2 py-2 text-sm"
            >
              <option value="">Catalog service</option>
              {(Array.isArray(catalog.data)
                ? catalog.data
                : catalog.data?.items || []
              ).map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nameAr || service.nameEn || service.name}
                </option>
              ))}
            </select>
            <BusyButton
              busy={patch.isPending}
              onClick={() =>
                serviceForm.serviceId &&
                save({ service: { action: "CREATE_SERVICE", ...serviceForm } })
              }
            >
              <Plus size={14} />
              Add
            </BusyButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="px-3 py-2 text-start">Catalog service</th>
                <th className="px-3 py-2 text-start">State</th>
                <th className="px-3 py-2 text-start">Prices</th>
                <th className="px-3 py-2 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((service) => (
                <tr key={service.id} className="border-b border-gray-50">
                  <td className="px-3 py-3 font-semibold">
                    {service.service?.nameAr ||
                      service.service?.nameEn ||
                      service.serviceId}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={service.availableIs ? "success" : "default"}
                    >
                      {service.availableIs ? "Available" : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {service._count?.providerServicePrices ?? 0}
                  </td>
                  <td className="px-3 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      {service.availableIs && (
                        <button
                          onClick={() =>
                            save({
                              service: {
                                action: "DEACTIVATE_SERVICE",
                                providerServiceId: service.id,
                                expectedUpdatedAt: service.atUpdated,
                              },
                            })
                          }
                          className="rounded-lg border border-amber-200 px-2 py-1.5 text-xs text-amber-700"
                        >
                          Deactivate
                        </button>
                      )}
                      {!service.availableIs && (
                        <button
                          onClick={() =>
                            save({
                              service: {
                                action: "UPDATE_SERVICE",
                                providerServiceId: service.id,
                                availableIs: true,
                                expectedUpdatedAt: service.atUpdated,
                              },
                            })
                          }
                          className="rounded-lg border px-2 py-1.5 text-xs"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openServiceEditor(service)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        <Pencil size={13} />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => selectServicePrices(service.id)}
                        className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${selectedProviderServiceId === service.id ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 text-gray-700"}`}
                      >
                        إدارة الأسعار
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard
        title="Service prices"
        action={
          <BusyButton
            busy={patch.isPending}
            disabled={!selectedProviderServiceId}
            onClick={() => openPriceModal()}
          >
            <Plus size={14} />
            إضافة سعر
          </BusyButton>
        }
      >
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-900">
            الخدمة الحالية: {selectedServiceName || "لم يتم اختيار خدمة"}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            تعرض القائمة أسعار خدمة مقدم الخدمة المحددة فقط.
          </p>
        </div>
        {priceDetail.isFetching && selectedProviderServiceId && (
          <p className="mb-3 text-sm text-gray-500">جارٍ تحميل أسعار الخدمة…</p>
        )}
        {priceDetail.isError && selectedProviderServiceId && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {managementErrorMessage(priceDetail.error)}
            </p>
            <button
              type="button"
              onClick={() => priceDetail.refetch()}
              className="mt-2 text-xs font-semibold text-blue-600"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="px-3 py-2 text-start">Car type</th>
                <th className="px-3 py-2 text-start">Price</th>
                <th className="px-3 py-2 text-start">Duration</th>
                <th className="px-3 py-2 text-start">Effective</th>
                <th className="px-3 py-2 text-start">State</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!priceDetail.isFetching &&
                !priceDetail.isError &&
                priceRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-sm text-gray-500"
                    >
                      {selectedProviderServiceId
                        ? "لا توجد أسعار لهذه الخدمة."
                        : "اختر إدارة الأسعار من أحد صفوف الخدمات."}
                    </td>
                  </tr>
                )}
              {priceRows.map((price) => (
                <tr key={price.id} className="border-b border-gray-50">
                  <td className="px-3 py-3">
                    {price.carType?.nameAr ||
                      price.carType?.nameEn ||
                      price.carTypeId}
                  </td>
                  <td className="px-3 py-3">{price.priceProvider}</td>
                  <td className="px-3 py-3">{price.minutesDuration} min</td>
                  <td className="px-3 py-3 text-xs">
                    {dateLabel(price.fromEffective)} –{" "}
                    {price.toEffective ? dateLabel(price.toEffective) : "Open"}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={price.activeIs ? "success" : "default"}>
                      {price.activeIs ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      {price.activeIs && (
                        <button
                          onClick={() =>
                            save({
                              servicePrice: {
                                action: "DEACTIVATE_PRICE",
                                providerServiceId: price.providerServiceId,
                                priceId: price.id,
                                expectedUpdatedAt: price.atUpdated,
                              },
                            })
                          }
                          className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-600"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => openPriceModal(price)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedProviderServiceId && !priceDetail.isError && (
          <Pagination
            currentPage={pricesMeta.page || pricesPage}
            totalResults={pricesMeta.total || 0}
            pageSize={pricesMeta.limit || 20}
            onPageChange={setPricesPage}
          />
        )}
      </SectionCard>
      {editingService && (
        <Modal
          title="تعديل خدمة مقدم الخدمة"
          onClose={() => setEditingService(null)}
        >
          <div className="space-y-4">
            <Field
              label="خدمة الكتالوج"
              value={
                editingService.service?.nameAr ||
                editingService.service?.nameEn ||
                editingService.serviceId
              }
              disabled
            />
            <SelectField
              label="التوفر الحالي"
              value={serviceEditAvailable ? "true" : "false"}
              onChange={(value) => setServiceEditAvailable(value === "true")}
            >
              <option value="true">متاح</option>
              <option value="false">غير متاح</option>
            </SelectField>
            <p className="text-xs text-gray-500">
              هوية خدمة الكتالوج للعرض فقط ولا يمكن تغييرها بعد إنشاء الخدمة.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                disabled={patch.isPending}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                إلغاء
              </button>
              <BusyButton busy={patch.isPending} onClick={submitServiceEdit}>
                <Save size={14} />
                حفظ التعديل
              </BusyButton>
            </div>
          </div>
        </Modal>
      )}
      {priceModalOpen && (
        <Modal
          title={editingPrice ? "تعديل سعر الخدمة" : "إضافة سعر للخدمة"}
          onClose={closePriceModal}
          size="lg"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="الخدمة"
              value={priceForm.providerServiceId}
              onChange={(value) =>
                setPriceForm({ ...priceForm, providerServiceId: value })
              }
              disabled
            >
              <option value="">اختر الخدمة</option>
              {serviceRows.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.service?.nameAr ||
                    service.service?.nameEn ||
                    service.id}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="نوع السيارة"
              value={priceForm.carTypeId}
              onChange={(value) =>
                setPriceForm({ ...priceForm, carTypeId: value })
              }
              disabled={Boolean(editingPrice)}
            >
              <option value="">اختر نوع السيارة</option>
              {availableCarTypes.map((carType) => (
                <option key={carType.id} value={carType.id}>
                  {carType.nameAr || carType.nameEn || carType.name}
                </option>
              ))}
            </SelectField>
            <Field
              label="السعر"
              value={priceForm.priceProvider}
              onChange={(value) =>
                setPriceForm({ ...priceForm, priceProvider: value })
              }
              type="number"
            />
            <Field
              label="المدة بالدقائق"
              value={priceForm.minutesDuration}
              onChange={(value) =>
                setPriceForm({ ...priceForm, minutesDuration: value })
              }
              type="number"
            />
            <Field
              label="ساري من"
              value={priceForm.fromEffective}
              onChange={(value) =>
                setPriceForm({ ...priceForm, fromEffective: value })
              }
              type="date"
            />
            <Field
              label="ينتهي في (اختياري)"
              value={priceForm.toEffective}
              onChange={(value) =>
                setPriceForm({ ...priceForm, toEffective: value })
              }
              type="date"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={closePriceModal}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              إلغاء
            </button>
            <BusyButton busy={patch.isPending} onClick={submitPrice}>
              <Save size={14} />
              حفظ السعر
            </BusyButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CoverageTab({ providerId, item, members, coverage, onSaved }) {
  const patch = usePatchProviderManagement(providerId);
  const defaultForm = {
    label: "",
    city: "",
    area: "",
    latitude: "",
    longitude: "",
    radiusMeters: 1000,
    assignmentMode: "ALL_MEMBERS",
    memberIds: [],
  };
  const [form, setForm] = useState(defaultForm);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const rows = coverage?.items || [];
  const model = item?.typeProvider;
  const eligibleMembers = (members?.items || []).filter((member) =>
    isEligibleCompanyFieldMember(member, item?.ownerUserId),
  );
  const memberById = new Map(
    (members?.items || []).map((member) => [member.id, member]),
  );

  const closeZoneModal = () => {
    setZoneModalOpen(false);
    setEditingZone(null);
    setForm(defaultForm);
  };

  const openCreateZone = () => {
    setEditingZone(null);
    setForm(defaultForm);
    setZoneModalOpen(true);
  };

  const editZone = (zone, assignmentOnly = false) => {
    setEditingZone(assignmentOnly ? { ...zone, assignmentOnly: true } : zone);
    setForm({
      label: zone.label || "",
      city: zone.city || "",
      area: zone.area || "",
      latitude: zone.latitude,
      longitude: zone.longitude,
      radiusMeters: zone.radiusMeters,
      assignmentMode: zone.assignmentMode || "ALL_MEMBERS",
      memberIds:
        zone.assignmentMode === "SELECTED_MEMBERS"
          ? (zone.assignments || []).map(
              (assignment) => assignment.providerMemberId,
            )
          : [],
    });
    setZoneModalOpen(true);
  };

  const save = (section) =>
    patch.mutate(
      { section: { coverage: { model, ...section } } },
      {
        onSuccess: () => {
          toast.success("تم حفظ نطاق التغطية.");
          closeZoneModal();
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );

  const submitZone = () => {
    const selectedMembersRequired =
      model === "COMPANY" &&
      (!editingZone || editingZone.assignmentOnly) &&
      form.assignmentMode === "SELECTED_MEMBERS";
    if (selectedMembersRequired && form.memberIds.length === 0) {
      toast.error("اختر عضوًا مؤهلًا واحدًا على الأقل لإكمال التعيين.");
      return;
    }

    if (editingZone?.assignmentOnly) {
      const assignmentDescription =
        form.assignmentMode === "SELECTED_MEMBERS"
          ? `سيتم استبدال مجموعة التعيين الحالية بالكامل بالأعضاء المحددين الآن (${form.memberIds.length}).`
          : "سيتم استبدال التعيين الحالي وتطبيق المنطقة على كل الأعضاء المؤهلين.";
      if (
        !window.confirm(
          `${assignmentDescription}\n\nهل تريد تنفيذ الاستبدال الكامل؟`,
        )
      )
        return;

      save({
        action: "REPLACE_ASSIGNMENTS",
        zoneId: editingZone.id,
        expectedUpdatedAt: editingZone.updatedAt,
        assignmentMode: form.assignmentMode,
        ...(form.assignmentMode === "SELECTED_MEMBERS"
          ? { memberIds: form.memberIds }
          : {}),
      });
      return;
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const radiusMeters = Number(form.radiusMeters);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(radiusMeters) ||
      radiusMeters <= 0
    ) {
      toast.error("حدد موقعًا صحيحًا على الخريطة وأدخل نصف قطر صحيحًا.");
      return;
    }

    const values = {
      label: form.label,
      city: form.city,
      area: form.area,
      latitude,
      longitude,
      radiusMeters,
      ...(model === "COMPANY" && !editingZone
        ? {
            assignmentMode: form.assignmentMode,
            memberIds: form.memberIds,
          }
        : model === "INDIVIDUAL"
          ? { memberId: coverage?.providerMemberId }
          : {}),
    };

    save(
      editingZone
        ? {
            action: "UPDATE_ZONE",
            zoneId: editingZone.id,
            expectedUpdatedAt: editingZone.updatedAt,
            ...values,
          }
        : { action: "CREATE_ZONE", ...values },
    );
  };

  const assignmentFields = model === "COMPANY" &&
    (!editingZone || editingZone.assignmentOnly) && (
      <div className="space-y-3">
        <SelectField
          label="طريقة التعيين"
          value={form.assignmentMode}
          onChange={(value) => setForm({ ...form, assignmentMode: value })}
        >
          <option value="ALL_MEMBERS">كل الأعضاء</option>
          <option value="SELECTED_MEMBERS">أعضاء محددون</option>
        </SelectField>
        {form.assignmentMode === "SELECTED_MEMBERS" && (
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
            <p className="text-xs font-semibold text-gray-500">
              اختر الأعضاء المؤهلين
            </p>
            {eligibleMembers.length === 0 && (
              <p className="text-sm text-amber-700">
                لا يوجد أعضاء ميدانيون مؤهلون للاختيار حاليًا.
              </p>
            )}
            {[
              ...eligibleMembers,
              ...(editingZone?.assignments || [])
                .filter(
                  (assignment) =>
                    !eligibleMembers.some(
                      (member) => member.id === assignment.providerMemberId,
                    ),
                )
                .map((assignment) => ({
                  id: assignment.providerMemberId,
                  user: { fullName: assignment.displayName },
                  persistedAssignment: true,
                })),
            ].map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form.memberIds.includes(member.id)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      memberIds: event.target.checked
                        ? [...form.memberIds, member.id]
                        : form.memberIds.filter((id) => id !== member.id),
                    })
                  }
                />
                {member.user?.fullName ||
                  memberById.get(member.id)?.user?.fullName ||
                  member.id}
                {member.persistedAssignment && (
                  <span className="text-xs text-amber-700">(تعيين محفوظ)</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    );

  return (
    <>
      <SectionCard
        title={
          model === "COMPANY"
            ? "نطاق تغطية الشركة"
            : "نطاق تغطية مقدم الخدمة الفردي"
        }
        action={
          <BusyButton busy={patch.isPending} onClick={openCreateZone}>
            <Plus size={14} />
            إضافة منطقة
          </BusyButton>
        }
      >
        <p className="mb-4 text-xs text-gray-500">
          يتم تحديد مركز منطقة التغطية ونصف قطرها من خلال الخريطة.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="px-3 py-2 text-start">المنطقة</th>
                <th className="px-3 py-2 text-start">الإحداثيات</th>
                <th className="px-3 py-2 text-start">نصف القطر</th>
                <th className="px-3 py-2 text-start">طريقة التعيين</th>
                <th className="px-3 py-2 text-start">الأعضاء المعينون</th>
                <th className="px-3 py-2 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((zone) => (
                <tr key={zone.id} className="border-b border-gray-50">
                  <td className="px-3 py-3">
                    <p className="font-semibold">
                      {zone.label || "منطقة بدون اسم"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[zone.city, zone.area].filter(Boolean).join("، ") || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-xs" dir="ltr">
                    {zone.latitude}, {zone.longitude}
                  </td>
                  <td className="px-3 py-3">{zone.radiusMeters} متر</td>
                  <td className="px-3 py-3 text-xs font-semibold">
                    {model === "COMPANY"
                      ? pretty(zone.assignmentMode)
                      : "عضو المالك"}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {model !== "COMPANY" ? (
                      "عضو المالك"
                    ) : zone.assignmentMode === "ALL_MEMBERS" ? (
                      <span className="font-semibold">كل الأعضاء</span>
                    ) : (
                      <div>
                        <p className="font-semibold">
                          أعضاء محددون ({(zone.assignments || []).length})
                        </p>
                        <div className="mt-1 space-y-0.5 text-gray-600">
                          {(zone.assignments || [])
                            .slice(0, 3)
                            .map((assignment) => (
                              <p key={assignment.providerMemberId}>
                                {assignment.displayName}
                                {assignment.activeIs === false
                                  ? " (غير نشط)"
                                  : ""}
                              </p>
                            ))}
                          {(zone.assignments || []).length > 3 && (
                            <p className="font-semibold text-indigo-700">
                              +{zone.assignments.length - 3} آخرين
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-end">
                    <div className="flex justify-end gap-2">
                      {zone.activeIs && (
                        <button
                          onClick={() => editZone(zone)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1.5 text-xs font-semibold text-blue-700"
                        >
                          <Pencil size={13} />
                          تعديل على الخريطة
                        </button>
                      )}
                      {zone.activeIs && (
                        <button
                          onClick={() =>
                            save({
                              action: "DEACTIVATE_ZONE",
                              zoneId: zone.id,
                              expectedUpdatedAt: zone.updatedAt,
                            })
                          }
                          className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-600"
                        >
                          إيقاف
                        </button>
                      )}
                      {model === "COMPANY" && zone.activeIs && (
                        <button
                          onClick={() => editZone(zone, true)}
                          className="rounded-lg border border-indigo-200 px-2 py-1.5 text-xs text-indigo-700"
                        >
                          تعيين الأعضاء
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {zoneModalOpen && (
        <Modal
          title={
            editingZone?.assignmentOnly
              ? "تعيين أعضاء منطقة التغطية"
              : editingZone
                ? "تعديل منطقة التغطية على الخريطة"
                : "إضافة منطقة تغطية على الخريطة"
          }
          onClose={closeZoneModal}
          size="lg"
        >
          <div className="space-y-5" dir="rtl">
            {!editingZone?.assignmentOnly && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field
                    label="اسم المنطقة"
                    value={form.label}
                    onChange={(value) => setForm({ ...form, label: value })}
                  />
                  <Field
                    label="المدينة"
                    value={form.city}
                    onChange={(value) => setForm({ ...form, city: value })}
                  />
                  <Field
                    label="المنطقة"
                    value={form.area}
                    onChange={(value) => setForm({ ...form, area: value })}
                  />
                  <Field
                    label="نصف القطر بالمتر"
                    value={form.radiusMeters}
                    onChange={(value) =>
                      setForm({ ...form, radiusMeters: value })
                    }
                    type="number"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    اضغط على الخريطة لاختيار مركز منطقة التغطية
                  </p>
                  <CoverageMapPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    radiusMeters={form.radiusMeters}
                    onChange={(latitude, longitude) =>
                      setForm({ ...form, latitude, longitude })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="خط العرض"
                    value={form.latitude}
                    onChange={(value) => setForm({ ...form, latitude: value })}
                    type="number"
                  />
                  <Field
                    label="خط الطول"
                    value={form.longitude}
                    onChange={(value) => setForm({ ...form, longitude: value })}
                    type="number"
                  />
                </div>
              </>
            )}
            {assignmentFields}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeZoneModal}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                إلغاء
              </button>
              <BusyButton
                busy={patch.isPending}
                disabled={
                  model === "COMPANY" &&
                  (!editingZone || editingZone.assignmentOnly) &&
                  form.assignmentMode === "SELECTED_MEMBERS" &&
                  form.memberIds.length === 0
                }
                onClick={submitZone}
              >
                <Save size={14} />
                {editingZone?.assignmentOnly
                  ? "استبدال التعيينات"
                  : editingZone
                    ? "حفظ تعديلات المنطقة"
                    : "إنشاء المنطقة"}
              </BusyButton>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function WeeklyScheduleTab({
  providerId,
  item,
  members,
  schedule,
  onSaved,
  ownerUserId,
  selectedMemberId,
  onSelectedMemberChange,
  isReloading = false,
}) {
  const patch = usePatchProviderManagement(providerId);
  const companySchedule = item?.typeProvider === "COMPANY";
  const eligible = (members?.items || []).filter((member) =>
    isEligibleCompanyFieldMember(member, ownerUserId),
  );
  const memberId = schedule?.providerMemberId || "";
  const loadedTargetIsCurrent =
    !companySchedule || memberId === selectedMemberId;
  const mutationDisabled = isReloading || !memberId || !loadedTargetIsCurrent;
  const [timezone, setTimezone] = useState(schedule?.timezone || "Asia/Riyadh");
  const [periods, setPeriods] = useState(schedule?.periods || []);
  const [exception, setException] = useState({
    type: "UNAVAILABLE",
    startsAt: "",
    endsAt: "",
    reason: "",
  });
  const [clearConfirm, setClearConfirm] = useState(false);
  useEffect(() => {
    if (schedule) {
      setTimezone(schedule.timezone);
      setPeriods(schedule.periods || []);
      setException({
        type: "UNAVAILABLE",
        startsAt: "",
        endsAt: "",
        reason: "",
      });
      setClearConfirm(false);
    }
  }, [schedule]);
  const saveSchedule = () => {
    if (mutationDisabled) {
      toast.error("Select an eligible schedule member first.");
      return;
    }
    if (!periods.length && !clearConfirm) {
      setClearConfirm(true);
      return;
    }
    patch.mutate(
      {
        section: {
          workSchedule: {
            action: "REPLACE_WEEKLY",
            memberId,
            expectedVersion: schedule?.version,
            timezone,
            periods: periods.map(
              ({ dayOfWeek, startMinuteOfDay, endMinuteOfDay }) => ({
                dayOfWeek: Number(dayOfWeek),
                startMinuteOfDay: Number(startMinuteOfDay),
                endMinuteOfDay: Number(endMinuteOfDay),
              }),
            ),
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Weekly schedule replaced.");
          setClearConfirm(false);
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  const addPeriod = () =>
    setPeriods([
      ...periods,
      { dayOfWeek: 1, startMinuteOfDay: 540, endMinuteOfDay: 1020 },
    ]);
  const saveException = () => {
    if (mutationDisabled || !exception.startsAt || !exception.endsAt) {
      toast.error("Select a member and both exception dates.");
      return;
    }
    patch.mutate(
      {
        section: {
          scheduleException: {
            action: "CREATE_EXCEPTION",
            memberId,
            expectedVersion: schedule?.version,
            ...exception,
            startsAt: new Date(exception.startsAt).toISOString(),
            endsAt: new Date(exception.endsAt).toISOString(),
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Exception created.");
          setException({
            type: "UNAVAILABLE",
            startsAt: "",
            endsAt: "",
            reason: "",
          });
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };
  return (
    <div className="space-y-5">
      <SectionCard
        title="Weekly schedule"
        action={
          <BusyButton
            busy={patch.isPending || isReloading}
            disabled={mutationDisabled}
            onClick={saveSchedule}
          >
            <Save size={15} />
            Replace weekly
          </BusyButton>
        }
      >
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {companySchedule ? (
            <SelectField
              label="Schedule member"
              value={selectedMemberId}
              onChange={onSelectedMemberChange}
              disabled={isReloading || patch.isPending}
            >
              {eligible.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.user?.fullName || member.id}
                </option>
              ))}
            </SelectField>
          ) : (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold text-blue-700">
                عضو الجدول المعتمد
              </p>
              <p className="mt-1 text-sm text-blue-950">
                عضو المالك المحدد من النظام
              </p>
            </div>
          )}
          <Field
            label="Timezone"
            value={timezone}
            onChange={setTimezone}
            disabled={mutationDisabled || patch.isPending}
          />
        </div>
        <div className="space-y-2">
          {periods.map((period, index) => (
            <div
              key={`${period.id || "new"}-${index}`}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end rounded-lg bg-gray-50 p-3"
            >
              <SelectField
                label="Day"
                value={period.dayOfWeek}
                disabled={mutationDisabled || patch.isPending}
                onChange={(v) =>
                  setPeriods(
                    periods.map((row, i) =>
                      i === index ? { ...row, dayOfWeek: Number(v) } : row,
                    ),
                  )
                }
              >
                {dayNames.map((name, day) => (
                  <option key={name} value={day}>
                    {name}
                  </option>
                ))}
              </SelectField>
              <Field
                label="وقت البداية"
                value={minutesToTime(period.startMinuteOfDay)}
                onChange={(v) =>
                  setPeriods(
                    periods.map((row, i) =>
                      i === index
                        ? { ...row, startMinuteOfDay: timeToMinutes(v) }
                        : row,
                    ),
                  )
                }
                type="time"
                disabled={mutationDisabled || patch.isPending}
              />
              <Field
                label="وقت النهاية"
                value={minutesToTime(period.endMinuteOfDay)}
                onChange={(v) =>
                  setPeriods(
                    periods.map((row, i) =>
                      i === index
                        ? { ...row, endMinuteOfDay: timeToMinutes(v) }
                        : row,
                    ),
                  )
                }
                type="time"
                disabled={mutationDisabled || patch.isPending}
              />
              <button
                type="button"
                disabled={mutationDisabled || patch.isPending}
                onClick={() =>
                  setPeriods(periods.filter((_, i) => i !== index))
                }
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={mutationDisabled || patch.isPending}
          onClick={addPeriod}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
        >
          <Plus size={14} />
          Add period
        </button>
        <p className="mt-3 text-xs text-gray-500">
          The backend treats this as replace-all. Clearing every period requires
          explicit confirmation.
        </p>
      </SectionCard>
      <SectionCard
        title="Schedule exceptions"
        action={
          <BusyButton
            busy={patch.isPending || isReloading}
            disabled={mutationDisabled}
            onClick={saveException}
          >
            <Plus size={14} />
            Create exception
          </BusyButton>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectField
            label="Type"
            value={exception.type}
            onChange={(v) => setException({ ...exception, type: v })}
            disabled={mutationDisabled || patch.isPending}
          >
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="AVAILABLE_OVERRIDE">Available override</option>
          </SelectField>
          <Field
            label="Starts at"
            value={exception.startsAt}
            onChange={(v) => setException({ ...exception, startsAt: v })}
            type="datetime-local"
            disabled={mutationDisabled || patch.isPending}
          />
          <Field
            label="Ends at"
            value={exception.endsAt}
            onChange={(v) => setException({ ...exception, endsAt: v })}
            type="datetime-local"
            disabled={mutationDisabled || patch.isPending}
          />
          <Field
            label="Reason"
            value={exception.reason}
            onChange={(v) => setException({ ...exception, reason: v })}
            disabled={mutationDisabled || patch.isPending}
          />
        </div>
        <div className="mt-4 space-y-2">
          {(schedule?.exceptions?.items || []).map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <span>
                <Badge variant={row.type === "UNAVAILABLE" ? "danger" : "info"}>
                  {pretty(row.type)}
                </Badge>{" "}
                <span className="text-gray-600">
                  {dateLabel(row.startsAt)} – {dateLabel(row.endsAt)}
                </span>
              </span>
              <button
                type="button"
                disabled={mutationDisabled || patch.isPending}
                onClick={() => {
                  if (window.confirm("Delete this schedule exception?"))
                    patch.mutate(
                      {
                        section: {
                          scheduleException: {
                            action: "DELETE_EXCEPTION",
                            memberId,
                            exceptionId: row.id,
                            expectedUpdatedAt: row.updatedAt,
                          },
                        },
                      },
                      {
                        onSuccess: () => {
                          toast.success("Exception deleted.");
                          onSaved();
                        },
                        onError: (error) =>
                          toast.error(managementErrorMessage(error)),
                      },
                    );
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-600 disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
      {clearConfirm && (
        <Modal
          title="Clear weekly schedule?"
          onClose={() => setClearConfirm(false)}
          size="sm"
        >
          <p className="text-sm text-gray-600">
            This sends an empty replacement and removes all weekly periods.
            Confirm only if that is intentional.
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setClearConfirm(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <BusyButton
              busy={patch.isPending || isReloading}
              disabled={mutationDisabled}
              onClick={saveSchedule}
            >
              Confirm clear
            </BusyButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Edit an existing availability exception with its row-level concurrency token. */
function ScheduleTab(props) {
  const {
    providerId,
    schedule,
    onSaved,
    item,
    selectedMemberId,
    isReloading = false,
  } = props;
  const patch = usePatchProviderManagement(providerId);
  const mutationDisabled =
    isReloading ||
    !schedule?.providerMemberId ||
    (item?.typeProvider === "COMPANY" &&
      schedule.providerMemberId !== selectedMemberId);
  const [editingException, setEditingException] = useState(null);
  const [exception, setException] = useState({
    type: "UNAVAILABLE",
    startsAt: "",
    endsAt: "",
    reason: "",
  });

  const toDateTimeLocal = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  };

  const openExceptionEditor = (row) => {
    setEditingException(row);
    setException({
      type: row.type || "UNAVAILABLE",
      startsAt: toDateTimeLocal(row.startsAt),
      endsAt: toDateTimeLocal(row.endsAt),
      reason: row.reason || "",
    });
  };

  const closeExceptionEditor = () => {
    setEditingException(null);
    setException({ type: "UNAVAILABLE", startsAt: "", endsAt: "", reason: "" });
  };

  const updateException = () => {
    if (
      mutationDisabled ||
      !editingException ||
      !schedule?.providerMemberId ||
      !exception.startsAt ||
      !exception.endsAt
    ) {
      toast.error("يرجى اختيار الاستثناء وإدخال تاريخي البداية والنهاية.");
      return;
    }
    patch.mutate(
      {
        section: {
          scheduleException: {
            action: "UPDATE_EXCEPTION",
            memberId: schedule.providerMemberId,
            exceptionId: editingException.id,
            expectedUpdatedAt: editingException.updatedAt,
            type: exception.type,
            startsAt: new Date(exception.startsAt).toISOString(),
            endsAt: new Date(exception.endsAt).toISOString(),
            reason: exception.reason,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث استثناء الجدول.");
          closeExceptionEditor();
          onSaved();
        },
        onError: (error) => toast.error(managementErrorMessage(error)),
      },
    );
  };

  const rows = schedule?.exceptions?.items || [];
  return (
    <>
      <WeeklyScheduleTab {...props} />
      <SectionCard title="تعديل استثناءات الجدول">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            لا توجد استثناءات محفوظة للتعديل.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={`edit-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
              >
                <div>
                  <Badge
                    variant={row.type === "UNAVAILABLE" ? "danger" : "info"}
                  >
                    {pretty(row.type)}
                  </Badge>
                  <span className="mx-2 text-gray-600">
                    {dateLabel(row.startsAt)} – {dateLabel(row.endsAt)}
                  </span>
                  <span className="text-gray-500">
                    {row.reason || "بدون سبب"}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={mutationDisabled || patch.isPending}
                  onClick={() => openExceptionEditor(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
                >
                  <Pencil size={13} />
                  تعديل
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
      {editingException && (
        <Modal title="تعديل استثناء الجدول" onClose={closeExceptionEditor}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="النوع"
              value={exception.type}
              onChange={(value) => setException({ ...exception, type: value })}
              disabled={mutationDisabled || patch.isPending}
            >
              <option value="UNAVAILABLE">فترة غير متاحة</option>
              <option value="AVAILABLE_OVERRIDE">توافر استثنائي</option>
            </SelectField>
            <Field
              label="السبب"
              value={exception.reason}
              onChange={(value) =>
                setException({ ...exception, reason: value })
              }
              disabled={mutationDisabled || patch.isPending}
            />
            <Field
              label="يبدأ في"
              value={exception.startsAt}
              onChange={(value) =>
                setException({ ...exception, startsAt: value })
              }
              type="datetime-local"
              disabled={mutationDisabled || patch.isPending}
            />
            <Field
              label="ينتهي في"
              value={exception.endsAt}
              onChange={(value) =>
                setException({ ...exception, endsAt: value })
              }
              type="datetime-local"
              disabled={mutationDisabled || patch.isPending}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            يتم إرسال expectedUpdatedAt الخاص بالاستثناء فقط؛ لا يتم إرسال إصدار
            الجدول عند التحديث.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeExceptionEditor}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              إلغاء
            </button>
            <BusyButton
              busy={patch.isPending || isReloading}
              disabled={mutationDisabled}
              onClick={updateException}
            >
              <Save size={14} />
              حفظ التعديل
            </BusyButton>
          </div>
        </Modal>
      )}
    </>
  );
}

function AvailabilityTab({ providerId, item, onSaved }) {
  const patch = usePatchProviderManagement(providerId);
  const [available, setAvailable] = useState(Boolean(item?.availableIs));
  useEffect(
    () => setAvailable(Boolean(item?.availableIs)),
    [item?.availableIs],
  );
  const save = () =>
    patch.mutate(
      {
        section: {
          availability: {
            action: "SET_AVAILABILITY",
            availableIs: available,
            expectedUpdatedAt: item?.updatedAt,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Availability updated.");
          onSaved();
        },
        onError: (error) => {
          toast.error(managementErrorMessage(error));
          onSaved();
        },
      },
    );
  return (
    <SectionCard title="Availability">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">
            {available ? "Available for bookings" : "Unavailable for bookings"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            The backend may reject this command based on approval, lifecycle, or
            financial rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAvailable(!available)}
            className={`relative h-7 w-12 rounded-full transition ${available ? "bg-green-500" : "bg-gray-300"}`}
            aria-label="Toggle availability"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${available ? "left-6" : "left-1"}`}
            />
          </button>
          <BusyButton busy={patch.isPending} onClick={save}>
            <Save size={15} />
            Save
          </BusyButton>
        </div>
      </div>
    </SectionCard>
  );
}

const createFileRules = {
  logo: {
    label: "الشعار",
    accept: "image/jpeg,image/png,image/webp",
    maxSize: 2 * 1024 * 1024,
    maxLabel: "2 MB",
  },
  cover: {
    label: "صورة الغلاف",
    accept: "image/jpeg,image/png,image/webp",
    maxSize: 5 * 1024 * 1024,
    maxLabel: "5 MB",
  },
  verificationDocument: {
    label: "مستند التحقق",
    accept: "application/pdf,image/jpeg,image/png,image/webp",
    maxSize: 10 * 1024 * 1024,
    maxLabel: "10 MB",
  },
};
const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;
const isImageMedia = (media) => {
  const mimeType = media?.type || media?.mimeType || "";
  if (mimeType.startsWith("image/")) return true;
  return /\.(?:jpe?g|png|webp)$/i.test(media?.name || media?.fileName || "");
};
const formatFileSize = (size) => {
  if (!Number.isFinite(Number(size))) return "";
  const megabytes = Number(size) / (1024 * 1024);
  return megabytes >= 0.1
    ? `${megabytes.toFixed(1)} MB`
    : `${Math.max(1, Math.round(Number(size) / 1024))} KB`;
};
const openFilePickerFromKeyboard = (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.querySelector('input[type="file"]')?.click();
};

/** Creates one temporary browser URL and revokes it after replacement/unmount. */
function useLocalObjectUrl(file) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!isBrowserFile(file)) {
      setUrl("");
      return undefined;
    }
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);
  return url;
}

/** Loads private verification images through the authenticated document flow. */
function useCurrentVerificationPreview(providerId, document) {
  const [state, setState] = useState({
    url: "",
    failed: false,
    loading: false,
  });
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setState({
      url: "",
      failed: false,
      loading: Boolean(document && isImageMedia(document)),
    });
    if (!document || !isImageMedia(document)) return undefined;
    if (document.url) {
      setState({ url: document.url, failed: false, loading: false });
      return undefined;
    }
    if (!providerId || !document.mediaId) {
      setState({ url: "", failed: true, loading: false });
      return undefined;
    }
    getProviderVerificationDocument(providerId, document.mediaId)
      .then((blob) => {
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, failed: false, loading: false });
      })
      .catch(() => {
        if (active) setState({ url: "", failed: true, loading: false });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [providerId, document?.mediaId, document?.mimeType, document?.url]);
  return state;
}

/** Resilient image surface shared by current and unsaved media previews. */
function MediaImagePreview({ src, alt, mode = "contain" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 px-3 text-center text-xs text-gray-500">
        تعذر عرض المعاينة
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`h-32 w-full rounded-lg bg-gray-100 ${mode === "cover" ? "object-cover" : "object-contain"}`}
    />
  );
}

/** Preview for a validated local File without changing the File used by submit. */
function LocalFilePreview({ field, file, onCancel }) {
  const objectUrl = useLocalObjectUrl(file);
  if (!isBrowserFile(file)) return null;
  const image = isImageMedia(file);
  const alt =
    field === "logo"
      ? "شعار مقدم الخدمة"
      : field === "cover"
        ? "غلاف مقدم الخدمة"
        : "معاينة مستند التحقق";
  return (
    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2">
      <p className="mb-2 text-xs font-bold text-blue-800">
        ملف جديد - لم يتم الحفظ بعد
      </p>
      {image && !objectUrl ? (
        <div className="flex h-32 items-center justify-center rounded-lg bg-white text-xs text-gray-500">
          جارٍ إعداد المعاينة…
        </div>
      ) : image ? (
        <MediaImagePreview
          src={objectUrl}
          alt={alt}
          mode={field === "cover" ? "cover" : "contain"}
        />
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg bg-white text-gray-600">
          <FileText size={30} />
          <span className="mt-2 text-xs font-bold">PDF</span>
        </div>
      )}
      <p className="mt-2 truncate text-xs font-semibold text-gray-700">
        {file.name}
      </p>
      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {!image && objectUrl && (
          <button
            type="button"
            onClick={() =>
              window.open(objectUrl, "_blank", "noopener,noreferrer")
            }
            className="rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-blue-700"
          >
            معاينة الملف
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700"
        >
          <X size={12} /> إلغاء الاختيار
        </button>
      </div>
    </div>
  );
}

/** Current private verification media plus an explicitly unsaved replacement. */
function VerificationMediaCard({
  providerId,
  current,
  selected,
  pending,
  onViewCurrent,
  onSelect,
  onCancel,
  onSave,
}) {
  const currentPreview = useCurrentVerificationPreview(providerId, current);
  const currentIsImage = isImageMedia(current);
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <FileText size={16} /> Verification document
      </span>
      {current ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">Current</p>
          {currentIsImage ? (
            currentPreview.loading ? (
              <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                جارٍ تحميل المعاينة…
              </div>
            ) : currentPreview.failed ? (
              <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 px-3 text-center text-xs text-gray-500">
                تعذر عرض المعاينة
              </div>
            ) : (
              <MediaImagePreview
                src={currentPreview.url}
                alt="معاينة مستند التحقق"
              />
            )
          ) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg bg-gray-50 text-gray-600">
              <FileText size={30} />
              <span className="mt-2 text-xs font-bold">PDF</span>
            </div>
          )}
          <p className="mt-2 truncate text-xs text-gray-500">
            Current: {current.fileName || "Uploaded document"}
          </p>
          <button
            type="button"
            onClick={onViewCurrent}
            className="mt-2 rounded-lg border px-2 py-1 text-xs font-semibold text-gray-700"
          >
            عرض المستند
          </button>
        </div>
      ) : (
        <div className="mt-3 flex h-32 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-500">
          No current document
        </div>
      )}
      <LocalFilePreview
        field="verificationDocument"
        file={selected}
        onCancel={onCancel}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <label
          role="button"
          tabIndex={0}
          onKeyDown={openFilePickerFromKeyboard}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Upload size={12} /> Replace Document
          <input
            key={selected?.name || "empty"}
            type="file"
            accept={createFileRules.verificationDocument.accept}
            className="hidden"
            onChange={onSelect}
          />
        </label>
        {selected && (
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Save size={12} /> Save Replacement
          </button>
        )}
      </div>
    </div>
  );
}

/** Returns a validation message while keeping Backend-aligned limits central. */
function validateProviderFile(field, file) {
  const rule = createFileRules[field];
  if (!isBrowserFile(file)) return `تعذر قراءة ${rule.label} كملف صالح.`;
  const acceptedTypes = rule.accept.split(",");
  if (
    file.type &&
    file.type !== "application/octet-stream" &&
    !acceptedTypes.includes(file.type)
  ) {
    return `نوع ملف ${rule.label} غير مدعوم.`;
  }
  if (file.size > rule.maxSize) {
    return `يجب ألا يتجاوز ${rule.label} حجم ${rule.maxLabel}.`;
  }
  return "";
}

const emptyCreateForm = {
  typeProvider: "",
  nameBusinessAr: "",
  nameBusinessEn: "",
  descriptionAr: "",
  descriptionEn: "",
  registerCommercial: "",
  addressTitle: "",
  addressCity: "",
  addressArea: "",
  addressStreet: "",
  addressBuildingNumber: "",
  addressLatitude: "",
  addressLongitude: "",
  addressNotes: "",
};

/** File selector for the three backend-supported Provider profile media fields. */
function CreateProfileFileField({ field, file, error, onChange, onClear }) {
  const rule = createFileRules[field];
  const selectFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const validationMessage = validateProviderFile(field, selected);
    if (validationMessage) {
      toast.error(validationMessage);
      event.target.value = "";
      return;
    }
    onChange(selected);
  };
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Upload size={16} />
        {rule.label}
        {field === "verificationDocument" ? " *" : ""}
      </span>
      <span className="block mt-1 text-xs text-gray-500">
        الحد الأقصى {rule.maxLabel}
      </span>
      <LocalFilePreview field={field} file={file} onCancel={onClear} />
      <label
        role="button"
        tabIndex={0}
        onKeyDown={openFilePickerFromKeyboard}
        className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <Upload size={12} /> اختيار ملف
        <input
          key={file?.name || "empty"}
          type="file"
          accept={rule.accept}
          className="hidden"
          onChange={selectFile}
        />
      </label>
      {error && (
        <span className="mt-2 block text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

/** Exact POST form for creating a ProviderProfile for the selected existing User. */
function CompleteRegistrationForm({
  applicant,
  onCancel,
  onCreated,
  onDuplicate,
}) {
  const createProfile = useCreateAdminProviderProfile();
  const [form, setForm] = useState(emptyCreateForm);
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [formError, setFormError] = useState("");
  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    setFormError("");
    setFileErrors({});
    if (
      !form.typeProvider ||
      !form.nameBusinessAr.trim() ||
      !form.nameBusinessEn.trim()
    ) {
      setFormError("نوع مقدم الخدمة واسما النشاط بالعربية والإنجليزية مطلوبة.");
      return;
    }
    if (!isBrowserFile(files.verificationDocument)) {
      const message = "مستند التحقق مطلوب لاستكمال ملف مقدم الخدمة";
      setFileErrors({ verificationDocument: message });
      setFormError(message);
      return;
    }
    const hasLatitude = form.addressLatitude !== "";
    const hasLongitude = form.addressLongitude !== "";
    if (hasLatitude !== hasLongitude) {
      setFormError("يجب إدخال خط العرض وخط الطول معًا.");
      return;
    }
    const latitude = hasLatitude ? Number(form.addressLatitude) : undefined;
    const longitude = hasLongitude ? Number(form.addressLongitude) : undefined;
    if (
      (hasLatitude &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
      (hasLongitude &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    ) {
      setFormError("تحقق من صحة إحداثيات العنوان.");
      return;
    }

    const payload = Object.fromEntries(
      Object.entries({
        ownerUserId: applicant.ownerUserId,
        ...form,
        addressLatitude: latitude,
        addressLongitude: longitude,
      })
        .map(([field, value]) => [
          field,
          typeof value === "string" ? value.trim() : value,
        ])
        .filter(([, value]) => value !== "" && value !== undefined),
    );
    createProfile.mutate(
      { payload, files },
      {
        onSuccess: (response) => onCreated(response),
        onError: async (error) => {
          if (
            error?.response?.data?.code === "PROVIDER_PROFILE_ALREADY_EXISTS"
          ) {
            await onDuplicate();
            return;
          }
          const message = managementErrorMessage(error);
          const verificationMessage = managementFieldErrorMessage(
            error,
            "verificationDocument",
          );
          if (verificationMessage) {
            setFileErrors({ verificationDocument: verificationMessage });
          }
          setFormError(message);
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <SectionCard title="إكمال تسجيل مقدم الخدمة">
        <p className="text-sm text-gray-500 mb-5">
          سيتم إنشاء ملف مقدم خدمة للحساب الحالي ووضعه قيد المراجعة. لن يتم
          اعتماد الملف تلقائيًا.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="معرف حساب المالك"
            value={applicant.ownerUserId}
            disabled
            className="sm:col-span-2"
          />
          <SelectField
            label="نوع مقدم الخدمة *"
            value={form.typeProvider}
            onChange={(value) => set("typeProvider", value)}
          >
            <option value="">اختر النوع</option>
            <option value="INDIVIDUAL">فردي</option>
            <option value="COMPANY">شركة</option>
          </SelectField>
          <div className="hidden sm:block" />
          <Field
            label="اسم النشاط بالعربية *"
            value={form.nameBusinessAr}
            onChange={(value) => set("nameBusinessAr", value)}
          />
          <Field
            label="اسم النشاط بالإنجليزية *"
            value={form.nameBusinessEn}
            onChange={(value) => set("nameBusinessEn", value)}
          />
          <TextArea
            label="الوصف بالعربية"
            value={form.descriptionAr}
            onChange={(value) => set("descriptionAr", value)}
          />
          <TextArea
            label="الوصف بالإنجليزية"
            value={form.descriptionEn}
            onChange={(value) => set("descriptionEn", value)}
          />
          <div
            className={
              form.typeProvider === "COMPANY"
                ? "rounded-lg border border-amber-300 bg-amber-50 p-3 sm:col-span-2"
                : "sm:col-span-2"
            }
          >
            <Field
              label="السجل التجاري"
              value={form.registerCommercial}
              onChange={(value) => set("registerCommercial", value)}
            />
            {form.typeProvider === "COMPANY" && (
              <p className="mt-2 text-xs font-semibold text-amber-800">
                يتطلب فحص جاهزية الشركة في النظام إضافة السجل التجاري. لا يشترطه
                فحص جاهزية مقدم الخدمة الفردي.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="عنوان مقدم الخدمة">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="عنوان العنوان"
            value={form.addressTitle}
            onChange={(value) => set("addressTitle", value)}
          />
          <Field
            label="المدينة"
            value={form.addressCity}
            onChange={(value) => set("addressCity", value)}
          />
          <Field
            label="المنطقة"
            value={form.addressArea}
            onChange={(value) => set("addressArea", value)}
          />
          <Field
            label="الشارع"
            value={form.addressStreet}
            onChange={(value) => set("addressStreet", value)}
          />
          <Field
            label="رقم المبنى"
            value={form.addressBuildingNumber}
            onChange={(value) => set("addressBuildingNumber", value)}
          />
          <div className="hidden sm:block" />
          <Field
            label="خط العرض"
            value={form.addressLatitude}
            onChange={(value) => set("addressLatitude", value)}
            type="number"
            min="-90"
            max="90"
            step="any"
          />
          <Field
            label="خط الطول"
            value={form.addressLongitude}
            onChange={(value) => set("addressLongitude", value)}
            type="number"
            min="-180"
            max="180"
            step="any"
          />
          <div className="sm:col-span-2">
            <TextArea
              label="ملاحظات العنوان"
              value={form.addressNotes}
              onChange={(value) => set("addressNotes", value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="وسائط مقدم الخدمة">
        <p className="text-xs text-gray-500 mb-3">
          الصور: JPEG أو PNG أو WEBP. مستند التحقق: PDF أو أحد أنواع الصور
          المدعومة. يقبل النظام ملفًا واحدًا لكل حقل.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.keys(createFileRules).map((field) => (
            <CreateProfileFileField
              key={field}
              field={field}
              file={files[field]}
              error={fileErrors[field]}
              onChange={(file) => {
                setFiles((current) => ({ ...current, [field]: file }));
                setFileErrors((current) => ({ ...current, [field]: "" }));
              }}
              onClear={() => {
                setFiles((current) => ({ ...current, [field]: null }));
                setFileErrors((current) => ({ ...current, [field]: "" }));
              }}
            />
          ))}
        </div>
      </SectionCard>

      {formError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={createProfile.isPending}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          إلغاء
        </button>
        <BusyButton type="submit" busy={createProfile.isPending}>
          <Save size={15} />
          إنشاء ملف مقدم الخدمة
        </BusyButton>
      </div>
    </form>
  );
}

/** Registered-only account detail; intentionally never requests Provider includes. */
function RegisteredProviderDetail({ ownerUserId, canUpdate }) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const detail = useRegisteredProviderApplicant(ownerUserId);
  const item = detail.data?.items?.[0];

  useEffect(() => {
    if (item?.profileExists && item?.providerId) {
      navigate(`/admin/provider-management/${item.providerId}`, {
        replace: true,
      });
    }
  }, [item?.profileExists, item?.providerId, navigate]);

  if (detail.isLoading) {
    return (
      <div className="p-6 text-gray-500">جارٍ تحميل حساب مقدم الخدمة…</div>
    );
  }
  if (detail.isError || !item) {
    return (
      <div className="p-6">
        <SectionCard title="تعذر تحميل الحساب">
          <p className="text-sm text-red-600">
            {managementErrorMessage(detail.error)}
          </p>
          <button
            type="button"
            onClick={() => detail.refetch()}
            className="mt-3 text-sm font-semibold text-blue-600"
          >
            إعادة المحاولة
          </button>
        </SectionCard>
      </div>
    );
  }

  const inactive = item.owner?.status === "INACTIVE";
  const canComplete =
    item.registrationStage === "REGISTERED_ONLY" && !item.profileExists;
  const completeRegistration = (response) => {
    if (!response?.providerId) {
      toast.error("تم إنشاء الملف لكن لم يُرجع النظام معرف مقدم الخدمة.");
      detail.refetch();
      return;
    }
    toast.success("تم إنشاء ملف مقدم الخدمة بنجاح وهو الآن قيد المراجعة.");
    navigate(`/admin/provider-management/${response.providerId}`, {
      replace: true,
    });
  };
  const handleDuplicate = async () => {
    toast.error("تم إنشاء ملف مقدم الخدمة بالفعل. سيتم تحميل أحدث البيانات.");
    const refreshed = await detail.refetch();
    const current = refreshed.data?.items?.[0];
    if (current?.profileExists && current?.providerId) {
      navigate(`/admin/provider-management/${current.providerId}`, {
        replace: true,
      });
    }
  };

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-full" dir="rtl">
      <button
        type="button"
        onClick={() => navigate("/admin/provider-management")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        العودة إلى إدارة مقدمي الخدمة
      </button>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {item.owner?.fullName || "حساب مقدم خدمة"}
              </h1>
              <Badge variant="warning">التسجيل غير مكتمل</Badge>
              <Badge variant={statusVariant(item.owner?.status)}>
                {pretty(item.owner?.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2" dir="ltr">
              {item.owner?.email || "—"} · {item.owner?.phone || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => detail.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={15} />
            تحديث
          </button>
        </div>
      </div>

      <SectionCard title="بيانات الحساب المسجل">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            ["الاسم الكامل", item.owner?.fullName || "—"],
            ["رقم الهاتف", item.owner?.phone || "—"],
            ["البريد الإلكتروني", item.owner?.email || "—"],
            ["حالة الحساب", pretty(item.owner?.status)],
            ["مرحلة التسجيل", "التسجيل غير مكتمل"],
            ["الملف", "لم يتم إنشاء الملف"],
            ["تاريخ إنشاء الحساب", dateLabel(item.createdAt)],
            ["آخر تحديث", dateLabel(item.updatedAt)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 font-semibold text-gray-900 break-all">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-800">الحقول الناقصة</p>
          <p className="mt-1 text-sm text-amber-900">
            {(item.missingFields || []).map(pretty).join("، ") || "—"}
          </p>
        </div>
      </SectionCard>

      {inactive && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          يجب أن يكون الحساب نشطًا قبل إكمال ملف مقدم الخدمة.
        </p>
      )}
      {!canUpdate && (
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          يمكنك عرض الحساب، لكن إكمال التسجيل يتطلب صلاحية تحديث إدارة مقدمي
          الخدمة.
        </p>
      )}
      {canComplete && !showForm && (
        <BusyButton
          busy={false}
          disabled={inactive || !canUpdate}
          onClick={() => setShowForm(true)}
        >
          <Plus size={15} />
          إكمال تسجيل مقدم الخدمة
        </BusyButton>
      )}
      {canComplete && showForm && canUpdate && !inactive && (
        <CompleteRegistrationForm
          applicant={item}
          onCancel={() => setShowForm(false)}
          onCreated={completeRegistration}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
}

function ProviderDetail({ providerId, canUpdate }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const base = useProviderManagementDetail(providerId, {
    include: ["profile", "members", "services"],
  });
  const item = base.data?.items?.[0];
  const included = base.data?.included || {};
  const profile = included.profile;
  const members = included.members;
  const eligible = useMemo(
    () =>
      (members?.items || []).filter((member) =>
        isEligibleCompanyFieldMember(member, item?.ownerUserId),
      ),
    [members, item?.ownerUserId],
  );
  const companyProvider = item?.typeProvider === "COMPANY";
  const selectedMemberIsEligible = eligible.some(
    (member) => member.id === selectedMemberId,
  );
  const scheduleTargetMemberId = companyProvider
    ? selectedMemberIsEligible
      ? selectedMemberId
      : eligible[0]?.id || ""
    : undefined;

  useEffect(() => {
    if (companyProvider && selectedMemberId !== scheduleTargetMemberId) {
      setSelectedMemberId(scheduleTargetMemberId);
    } else if (!companyProvider && selectedMemberId) {
      setSelectedMemberId("");
    }
  }, [companyProvider, scheduleTargetMemberId, selectedMemberId]);

  // Coverage is independent from the Company schedule worker target.
  const coverageDetail = useProviderManagementDetail(providerId, {
    include: ["coverage"],
    enabled: Boolean(item),
  });
  // Company schedule reads are keyed by the selected eligible member.
  // Individual reads omit targetMemberId and trust the canonical backend target.
  const scheduleDetail = useProviderManagementDetail(providerId, {
    include: ["schedule"],
    targetMemberId: companyProvider ? scheduleTargetMemberId : undefined,
    enabled:
      Boolean(item) && (!companyProvider || Boolean(scheduleTargetMemberId)),
    staleTime: 0,
  });
  const coverage = coverageDetail.data?.included?.coverage;
  const schedule = scheduleDetail.data?.included?.schedule;
  const refresh = () => {
    base.refetch();
    coverageDetail.refetch();
    if (!companyProvider || scheduleTargetMemberId) scheduleDetail.refetch();
  };
  if (base.isLoading)
    return (
      <div className="p-6 text-gray-500">Loading provider management…</div>
    );
  if (base.isError || !item)
    return (
      <div className="p-6">
        <SectionCard title="Provider unavailable">
          <p className="text-sm text-red-600">Unable to load this provider.</p>
          <button
            onClick={() => base.refetch()}
            className="mt-3 text-sm text-blue-600"
          >
            Retry
          </button>
        </SectionCard>
      </div>
    );
  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-full">
      <button
        onClick={() => navigate("/admin/provider-management")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Provider Management
      </button>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.nameBusinessEn ||
                  profile?.nameBusinessAr ||
                  item.businessName ||
                  "Unnamed provider"}
              </h1>
              <Badge variant="info">{item.typeProvider}</Badge>
              <Badge variant={statusVariant(item.approvalStatus)}>
                {pretty(item.approvalStatus)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {item.owner?.fullName || "—"} ·{" "}
              {item.owner?.email || item.owner?.phone || "—"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {item.approvalStatus === "PENDING_REVIEW" && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/providers/pending/${providerId}`)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <Check size={15} />
                اتخاذ قرار المراجعة
              </button>
            )}
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`whitespace-nowrap px-3 py-3 text-sm font-semibold border-b-2 ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!canUpdate && (
        <p className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          وضع العرض فقط: تتطلب التغييرات صلاحية تحديث إدارة مقدمي الخدمة.
        </p>
      )}
      <fieldset disabled={!canUpdate} className="contents">
        {tab === "overview" && (
          <Overview item={item} profile={profile} included={included} />
        )}
        {tab === "profile" && (
          <ProfileTab
            providerId={providerId}
            item={item}
            profile={profile}
            onSaved={refresh}
          />
        )}
        {tab === "members" && (
          <MembersTab
            providerId={providerId}
            item={item}
            members={members}
            ownerUserId={item.ownerUserId}
            onSaved={refresh}
          />
        )}
        {tab === "services" && (
          <ServicesTab
            providerId={providerId}
            services={included.services}
            onSaved={refresh}
          />
        )}
        {tab === "coverage" &&
          (coverageDetail.isLoading || coverageDetail.isFetching ? (
            <SectionCard title="Coverage">
              <p className="text-sm text-gray-500">Loading coverage…</p>
            </SectionCard>
          ) : coverageDetail.isError || !coverage ? (
            <SectionCard title="Coverage">
              <p className="text-sm text-red-600">تعذر تحميل نطاق التغطية.</p>
              <button
                type="button"
                onClick={() => coverageDetail.refetch()}
                className="mt-3 text-sm font-semibold text-blue-600"
              >
                إعادة المحاولة
              </button>
            </SectionCard>
          ) : (
            <CoverageTab
              providerId={providerId}
              item={item}
              members={members}
              coverage={coverage}
              onSaved={() => coverageDetail.refetch()}
            />
          ))}
        {tab === "schedule" &&
          (companyProvider && eligible.length === 0 ? (
            <SectionCard title="Work schedule">
              <p className="font-semibold text-gray-800">
                لا يوجد عمال مؤهلون لجدول العمل.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                يمكنك الاستمرار في عرض وإدارة نطاق تغطية الشركة دون إضافة هدف
                للجدول.
              </p>
            </SectionCard>
          ) : scheduleDetail.isLoading || scheduleDetail.isFetching ? (
            <SectionCard title="Work schedule">
              <p className="text-sm text-gray-500">Loading schedule…</p>
            </SectionCard>
          ) : scheduleDetail.isError ||
            !schedule?.providerMemberId ||
            (companyProvider &&
              schedule.providerMemberId !== scheduleTargetMemberId) ? (
            <SectionCard title="Work schedule">
              <p className="text-sm text-red-600">تعذر تحميل جدول العمل.</p>
              {companyProvider &&
                schedule?.providerMemberId &&
                schedule.providerMemberId !== scheduleTargetMemberId && (
                  <p className="mt-2 text-xs text-red-500">
                    هدف الجدول العائد لا يطابق العضو المحدد، لذلك تم تعطيل جميع
                    عمليات التعديل.
                  </p>
                )}
              <button
                type="button"
                onClick={() => scheduleDetail.refetch()}
                className="mt-3 text-sm font-semibold text-blue-600"
              >
                إعادة المحاولة
              </button>
            </SectionCard>
          ) : (
            <ScheduleTab
              key={schedule.providerMemberId}
              providerId={providerId}
              item={item}
              members={members}
              ownerUserId={item.ownerUserId}
              selectedMemberId={scheduleTargetMemberId}
              onSelectedMemberChange={setSelectedMemberId}
              schedule={schedule}
              isReloading={scheduleDetail.isFetching}
              onSaved={() => scheduleDetail.refetch()}
            />
          ))}
        {tab === "availability" && (
          <AvailabilityTab
            providerId={providerId}
            item={item}
            onSaved={refresh}
          />
        )}
      </fieldset>
    </div>
  );
}

/** Super Admin provider management list/detail experience. */
export default function ProviderManagementPage() {
  const { providerId, ownerUserId } = useParams();
  const user = useAuthStore((state) => state.user);
  const roleNames = (user?.roles || []).map((role) =>
    (typeof role === "string" ? role : role?.name)?.toLowerCase(),
  );
  const directRole = (user?.role || "").toLowerCase();
  const permissionSource = user?.permissions ?? user?.permissionNames;
  const permissions = Array.isArray(permissionSource) ? permissionSource : [];
  const permissionNames = permissions
    .map((permission) =>
      typeof permission === "string" ? permission : permission?.name,
    )
    .filter(Boolean);
  const canManage =
    ["superadmin", "super_admin", "platform"].includes(directRole) ||
    roleNames.some((role) =>
      ["superadmin", "super_admin", "platform"].includes(role),
    ) ||
    permissionNames.includes("admin.providers.management.read");
  const canUpdate =
    permissionNames.includes("admin.providers.management.update") ||
    (permissionSource == null &&
      (["superadmin", "super_admin", "platform"].includes(directRole) ||
        roleNames.some((role) =>
          ["superadmin", "super_admin", "platform"].includes(role),
        )));
  if (!canManage)
    return (
      <div className="p-6">
        <SectionCard title="Access restricted">
          <p className="text-sm text-gray-600">
            Provider Management is available to Super Admin users with the
            management read permission.
          </p>
        </SectionCard>
      </div>
    );
  return (
    <div dir="rtl" className="contents">
      {ownerUserId ? (
        <RegisteredProviderDetail
          ownerUserId={ownerUserId}
          canUpdate={canUpdate}
        />
      ) : providerId ? (
        <ProviderDetail providerId={providerId} canUpdate={canUpdate} />
      ) : (
        <ProviderList />
      )}
    </div>
  );
}
