import axiosClient, { extractBackendValidationMessage } from "../axiosClient";
import {
  createMockProviderManagement,
  getMockProviderManagement,
  patchMockProviderManagement,
} from "../../mocks/providerManagement.mock";

const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
const providerFileFields = ["logo", "cover", "verificationDocument"];
const isActualFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

/** Serializes only supported management query fields for the facade. */
export async function getProviderManagement(query = {}) {
  if (useMock) return getMockProviderManagement(query);
  const params = {};
  const scalarKeys = [
    "providerId",
    "page",
    "limit",
    "search",
    "typeProvider",
    "approvalStatus",
    "userStatus",
    "availableIs",
    "lifecycleStatus",
    "ownerUserId",
    "registrationStage",
    "readiness",
    "createdFrom",
    "createdTo",
    "sortBy",
    "sortOrder",
    "membersPage",
    "membersLimit",
    "servicesPage",
    "servicesLimit",
    "pricesPage",
    "pricesLimit",
    "providerServiceId",
    "coveragePage",
    "coverageLimit",
    "targetMemberId",
    "exceptionsPage",
    "exceptionsLimit",
  ];
  scalarKeys.forEach((key) => {
    if (query[key] !== undefined && query[key] !== "" && query[key] !== null)
      params[key] = query[key];
  });
  if (query.include?.length)
    params.include = Array.isArray(query.include)
      ? query.include.join(",")
      : query.include;
  const { data } = await axiosClient.get("/admin/providers/management", {
    params,
  });
  return data;
}

/** Creates a ProviderProfile for an existing registered Provider applicant. */
export async function createProviderManagement(payload, files = {}) {
  if (!payload?.ownerUserId) {
    throw new Error(
      "ownerUserId is required to complete Provider registration.",
    );
  }
  if (!isActualFile(files.verificationDocument)) {
    const error = new Error("verificationDocument is required.");
    error.response = {
      status: 400,
      data: {
        code: "ADMIN_PROVIDER_VERIFICATION_DOCUMENT_REQUIRED",
        message: "مستند التحقق مطلوب لاستكمال ملف مقدم الخدمة",
      },
    };
    throw error;
  }
  if (useMock) return createMockProviderManagement(payload, files);

  // V1.2 requires verificationDocument for every admin-assisted creation.
  // Always use multipart so the request shape is deterministic and the
  // backend can enforce the required upload.
  const form = new FormData();
  Object.entries(payload).forEach(([field, value]) => {
    if (
      !providerFileFields.includes(field) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      form.append(field, String(value));
    }
  });
  providerFileFields.forEach((field) => {
    const file = files[field];
    if (file !== undefined && file !== null && !isActualFile(file)) {
      throw new TypeError(`${field} must be a browser File.`);
    }
    if (file) form.append(field, file, file.name);
  });
  const { data } = await axiosClient.post("/admin/providers/management", form);
  return data;
}

/** Loads the authoritative catalog car types used by price commands. */
export async function getProviderCarTypes() {
  if (useMock)
    return [
      { id: "f8672a21-6663-45b9-b7ef-0b866522ea12", name: "Sedan" },
      { id: "bf634fd6-6caf-4cd0-8d74-d906210ba7af", name: "SUV" },
    ];
  const { data } = await axiosClient.get("/catalog/car-types");
  return Array.isArray(data) ? data : data?.items || [];
}

/** Downloads the protected verification document through the authenticated client. */
export async function getProviderVerificationDocument(providerId, mediaId) {
  if (useMock)
    return new Blob(
      [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320"><rect width="480" height="320" fill="#f8fafc"/><text x="240" y="150" text-anchor="middle" font-size="24" fill="#0f172a">Verification document</text><text x="240" y="190" text-anchor="middle" font-size="14" fill="#64748b">${providerId}/${mediaId}</text></svg>`,
      ],
      { type: "image/svg+xml" },
    );
  const { data } = await axiosClient.get(
    `/admin/providers/${providerId}/verification-documents/${mediaId}`,
    { responseType: "blob" },
  );
  return data;
}

/** Sends one and only one management command section. Profile files use the exact multipart field names. */
export async function patchProviderManagement(providerId, section, files = {}) {
  if (!providerId || !section || Object.keys(section).length !== 1) {
    throw new Error(
      "A providerId and exactly one management command section are required.",
    );
  }
  if (useMock) return patchMockProviderManagement(providerId, section, files);
  const sectionName = Object.keys(section)[0];
  const value = section[sectionName];
  const hasFile = Object.values(files).some(Boolean);
  if (!hasFile) {
    const { data } = await axiosClient.patch(
      `/admin/providers/${providerId}/management`,
      section,
    );
    return data;
  }
  const form = new FormData();
  form.append(sectionName, JSON.stringify(value));
  providerFileFields.forEach((field) => {
    const file = files[field];
    if (file !== undefined && file !== null && !isActualFile(file)) {
      throw new TypeError(`${field} must be a browser File.`);
    }
    if (file) form.append(field, file, file.name);
  });
  const { data } = await axiosClient.patch(
    `/admin/providers/${providerId}/management`,
    form,
  );
  return data;
}

export const managementErrorMessage = (error) => {
  const status = error?.response?.status;
  const backend = error?.response?.data;
  const code = backend?.code;
  const validationMessage = extractBackendValidationMessage(backend?.errors);
  if (code === "PROVIDER_MANAGEMENT_STALE_WRITE") {
    return "تغيرت بيانات مقدم الخدمة منذ تحميل الصفحة. تمت إعادة تحميل أحدث البيانات؛ راجع التعديلات وحاول مرة أخرى.";
  }
  if (code === "PROVIDER_PROFILE_ALREADY_EXISTS") {
    return "تم إنشاء ملف مقدم الخدمة بالفعل. سيتم تحميل أحدث البيانات.";
  }
  if (status === 409) {
    return (
      error?.response?.data?.message ||
      "يتعارض الطلب مع الحالة الحالية لمقدم الخدمة."
    );
  }
  if (status === 403) return "ليس لديك صلاحية لإدارة مقدمي الخدمة.";
  if (status === 401) return "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.";
  if (status === 404) return "لم يتم العثور على مقدم الخدمة أو مورد الإدارة.";
  if (status === 400 || status === 422) {
    if (validationMessage) return validationMessage;
    if (typeof backend?.message === "string" && backend.message.trim()) {
      return backend.message;
    }
    return "تحقق من القيم وأعد المحاولة.";
  }
  return "تعذر إكمال طلب الإدارة. تحقق من الاتصال وحاول مرة أخرى.";
};

/** Returns a readable validation message for a specific Backend field. */
export const managementFieldErrorMessage = (error, field) => {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return "";
  const match = errors.find((entry) => entry?.field === field);
  return extractBackendValidationMessage(match ? [match] : []);
};
