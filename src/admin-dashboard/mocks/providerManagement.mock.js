const now = new Date().toISOString();
const mockLogoUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" rx="36" fill="#2563eb"/><text x="120" y="138" text-anchor="middle" font-size="72" fill="white">S</text></svg>',
)}`;
const mockCoverUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240"><rect width="640" height="240" fill="#0f172a"/><circle cx="500" cy="80" r="120" fill="#38bdf8" opacity=".7"/><text x="48" y="142" font-size="54" fill="white">ShineUp</text></svg>',
)}`;

const existingProviderId = "00000000-0000-4000-8000-000000000001";
const existingOwnerId = "00000000-0000-4000-8000-000000000011";
const pendingProviderId = "00000000-0000-4000-8000-000000000002";
const rejectedProviderId = "00000000-0000-4000-8000-000000000003";
const companyProviderId = "00000000-0000-4000-8000-000000000004";
const companyOwnerId = "00000000-0000-4000-8000-000000000044";

/** Mutable mock population used to mirror the GET/POST management lifecycle. */
export const mockProviderManagement = {
  items: [
    {
      providerId: existingProviderId,
      typeProvider: "INDIVIDUAL",
      ownerUserId: existingOwnerId,
      registrationStage: "PROFILE_CREATED",
      profileExists: true,
      owner: {
        id: existingOwnerId,
        fullName: "Demo Owner",
        phone: "0500000000",
        email: "demo@example.com",
        status: "ACTIVE",
      },
      businessName: "Demo ShineUp",
      businessNameAr: "مغسلة تجريبية",
      businessNameEn: "Demo ShineUp",
      approvalStatus: "APPROVED",
      availableIs: true,
      lifecycleStatus: "ACTIVE",
      hasAddress: true,
      hasVerificationDocument: true,
      readyForReview: true,
      missingFields: [],
      membersCount: 1,
      servicesCount: 2,
      averageRating: 4.8,
      reviewsCount: 12,
      atApproved: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      providerId: null,
      typeProvider: null,
      ownerUserId: "00000000-0000-4000-8000-000000000022",
      registrationStage: "REGISTERED_ONLY",
      profileExists: false,
      owner: {
        id: "00000000-0000-4000-8000-000000000022",
        fullName: "سارة المتقدمة",
        phone: "0500000000",
        email: "sara.applicant@example.com",
        status: "ACTIVE",
      },
      businessName: null,
      businessNameAr: null,
      businessNameEn: null,
      approvalStatus: null,
      availableIs: null,
      lifecycleStatus: null,
      hasAddress: false,
      hasVerificationDocument: false,
      readyForReview: false,
      missingFields: ["providerProfile"],
      membersCount: 0,
      servicesCount: 0,
      averageRating: 0,
      reviewsCount: 0,
      atApproved: null,
      createdAt: "2026-08-10T09:00:00.000Z",
      updatedAt: now,
    },
    {
      providerId: null,
      typeProvider: null,
      ownerUserId: "00000000-0000-4000-8000-000000000033",
      registrationStage: "REGISTERED_ONLY",
      profileExists: false,
      owner: {
        id: "00000000-0000-4000-8000-000000000033",
        fullName: "Inactive Applicant",
        phone: "0500000000",
        email: "inactive.applicant@example.com",
        status: "INACTIVE",
      },
      businessName: null,
      businessNameAr: null,
      businessNameEn: null,
      approvalStatus: null,
      availableIs: null,
      lifecycleStatus: null,
      hasAddress: false,
      hasVerificationDocument: false,
      readyForReview: false,
      missingFields: ["providerProfile"],
      membersCount: 0,
      servicesCount: 0,
      averageRating: 0,
      reviewsCount: 0,
      atApproved: null,
      createdAt: "2026-07-10T09:00:00.000Z",
      updatedAt: now,
    },
    ...[
      [
        pendingProviderId,
        "00000000-0000-4000-8000-000000000012",
        "PENDING_REVIEW",
        "Pending Provider",
      ],
      [
        rejectedProviderId,
        "00000000-0000-4000-8000-000000000013",
        "REJECTED",
        "Rejected Provider",
      ],
      [companyProviderId, companyOwnerId, "APPROVED", "Riyadh Wash Company"],
    ].map(([providerId, ownerUserId, approvalStatus, businessName]) => ({
      providerId,
      typeProvider: providerId === companyProviderId ? "COMPANY" : "INDIVIDUAL",
      ownerUserId,
      registrationStage: "PROFILE_CREATED",
      profileExists: true,
      owner: {
        id: ownerUserId,
        fullName: `${businessName} Owner`,
        phone: providerId === companyProviderId ? "0550000044" : "0550000012",
        email: `${providerId.slice(-1)}@example.com`,
        status: "ACTIVE",
      },
      businessName,
      businessNameAr: businessName,
      businessNameEn: businessName,
      approvalStatus,
      availableIs: approvalStatus === "APPROVED",
      lifecycleStatus: "ACTIVE",
      hasAddress: true,
      hasVerificationDocument: true,
      readyForReview: true,
      missingFields: [],
      membersCount: providerId === companyProviderId ? 4 : 1,
      servicesCount: 1,
      averageRating: 4.5,
      reviewsCount: 5,
      atApproved: approvalStatus === "APPROVED" ? now : null,
      createdAt:
        providerId === pendingProviderId ? "2026-08-15T10:00:00.000Z" : now,
      updatedAt: now,
    })),
  ],
  meta: { page: 1, limit: 20, total: 6, totalPages: 1 },
};

const mockProfiles = new Map([
  [
    existingProviderId,
    {
      id: existingProviderId,
      ownerUserId: existingOwnerId,
      typeProvider: "INDIVIDUAL",
      nameBusinessAr: "مغسلة تجريبية",
      nameBusinessEn: "Demo ShineUp",
      descriptionAr: "وصف تجريبي",
      descriptionEn: "Demo description",
      registerCommercial: null,
      approvalStatus: "APPROVED",
      availableIs: true,
      lifecycleStatus: "ACTIVE",
      owner: mockProviderManagement.items[0].owner,
      address: null,
      files: {
        logo: {
          fileName: "shineup-logo.png",
          mimeType: "image/png",
          sizeBytes: 1024,
          url: mockLogoUrl,
        },
        cover: {
          fileName: "shineup-cover.png",
          mimeType: "image/png",
          sizeBytes: 2048,
          url: mockCoverUrl,
        },
        verificationDocument: {
          mediaId: "document-1",
          fileName: "verification.pdf",
          mimeType: "application/pdf",
          sizeBytes: 4096,
          downloadUrl: `/admin/providers/${existingProviderId}/verification-documents/document-1`,
        },
      },
      atApproved: now,
      atCreated: now,
      atUpdated: now,
    },
  ],
  ...[pendingProviderId, rejectedProviderId, companyProviderId].map(
    (providerId) => {
      const item = mockProviderManagement.items.find(
        (row) => row.providerId === providerId,
      );
      return [
        providerId,
        {
          id: providerId,
          ownerUserId: item.ownerUserId,
          typeProvider: item.typeProvider,
          nameBusinessAr: item.businessNameAr,
          nameBusinessEn: item.businessNameEn,
          descriptionAr: "وصف تجريبي",
          descriptionEn: "Mock provider description",
          registerCommercial:
            item.typeProvider === "COMPANY" ? "CR-10004" : null,
          approvalStatus: item.approvalStatus,
          availableIs: item.availableIs,
          lifecycleStatus: "ACTIVE",
          owner: item.owner,
          address: null,
          files: {
            logo:
              providerId === companyProviderId
                ? {
                    fileName: "company-logo.png",
                    mimeType: "image/png",
                    sizeBytes: 1024,
                    url: mockLogoUrl,
                  }
                : null,
            cover:
              providerId === companyProviderId
                ? {
                    fileName: "company-cover.png",
                    mimeType: "image/png",
                    sizeBytes: 2048,
                    url: mockCoverUrl,
                  }
                : null,
            verificationDocument: {
              mediaId: `document-${providerId.slice(-1)}`,
              fileName:
                providerId === rejectedProviderId
                  ? "rejected-verification.png"
                  : `${item.approvalStatus.toLowerCase()}-verification.pdf`,
              mimeType:
                providerId === rejectedProviderId
                  ? "image/png"
                  : "application/pdf",
              sizeBytes: 2048,
              downloadUrl: `/admin/providers/${providerId}/verification-documents/document-${providerId.slice(-1)}`,
            },
          },
          atApproved: item.atApproved,
          atCreated: item.createdAt,
          atUpdated: item.updatedAt,
        },
      ];
    },
  ),
]);

const mockError = (status, code, message) => {
  const error = new Error(message);
  error.response = { status, data: { code, message } };
  return error;
};

const matchesSearch = (item, search) => {
  const term = String(search || "")
    .trim()
    .toLocaleLowerCase();
  if (!term) return true;
  return [
    item.businessName,
    item.businessNameAr,
    item.businessNameEn,
    item.owner?.fullName,
    item.owner?.phone,
    item.owner?.email,
  ].some((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .includes(term),
  );
};

const mockCompanyMembers = [
  ["10000000-0000-4000-8000-000000000001", "Ahmed Ali"],
  ["10000000-0000-4000-8000-000000000002", "Mohamed Hassan"],
  ["10000000-0000-4000-8000-000000000003", "Khaled Salem"],
  ["10000000-0000-4000-8000-000000000004", "Mahmoud Adel"],
].map(([id, fullName]) => ({
  id,
  userId: id,
  joinedAt: "2026-07-01T00:00:00.000Z",
  leftAt: null,
  status: { code: "ACTIVE" },
  user: { id, fullName, isActive: true },
  operationalProfile: { activeIs: true, displayNameEn: fullName },
  atUpdated: now,
}));

const mockCompanyCoverage = {
  model: "COMPANY",
  items: [
    {
      id: "20000000-0000-4000-8000-000000000001",
      providerId: companyProviderId,
      label: "شمال الرياض",
      city: "الرياض",
      area: "الشمال",
      latitude: 24.774265,
      longitude: 46.738586,
      radiusMeters: 5000,
      assignmentMode: "ALL_MEMBERS",
      selectedMemberCount: 0,
      assignments: [],
      activeIs: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      providerId: companyProviderId,
      label: "شرق الرياض",
      city: "الرياض",
      area: "الشرق",
      latitude: 24.713552,
      longitude: 46.80038,
      radiusMeters: 3500,
      assignmentMode: "SELECTED_MEMBERS",
      selectedMemberCount: 3,
      assignments: mockCompanyMembers.slice(0, 3).map((member) => ({
        providerMemberId: member.id,
        displayName: member.user.fullName,
        activeIs: true,
      })),
      activeIs: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

const buildIncluded = (item) => ({
  profile: mockProfiles.get(item.providerId),
  members:
    item.providerId === companyProviderId
      ? {
          items: mockCompanyMembers,
          meta: { page: 1, limit: 20, total: 4, totalPages: 1 },
        }
      : { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } },
  services: {
    items: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
  },
  servicePrices: {
    items: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
  },
  coverage:
    item.providerId === companyProviderId
      ? mockCompanyCoverage
      : {
          model: item.typeProvider,
          items: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
        },
  schedule: {
    providerId: item.providerId,
    providerMemberId: item.ownerUserId,
    timezone: "Asia/Riyadh",
    version: "demo-version",
    periods: [],
    exceptions: {
      items: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    },
  },
});

/** Applies the same server-side filters used by the real management GET. */
export function getMockProviderManagement(query = {}) {
  let items = [...mockProviderManagement.items];
  if (query.providerId)
    items = items.filter((item) => item.providerId === query.providerId);
  if (query.ownerUserId)
    items = items.filter((item) => item.ownerUserId === query.ownerUserId);
  if (query.registrationStage)
    items = items.filter(
      (item) => item.registrationStage === query.registrationStage,
    );
  if (query.typeProvider)
    items = items.filter((item) => item.typeProvider === query.typeProvider);
  if (query.approvalStatus)
    items = items.filter(
      (item) => item.approvalStatus === query.approvalStatus,
    );
  if (query.userStatus)
    items = items.filter((item) => item.owner?.status === query.userStatus);
  if (query.availableIs !== undefined && query.availableIs !== "") {
    const available =
      query.availableIs === true || query.availableIs === "true";
    items = items.filter((item) => item.availableIs === available);
  }
  if (query.lifecycleStatus)
    items = items.filter(
      (item) => item.lifecycleStatus === query.lifecycleStatus,
    );
  if (query.readiness === "READY")
    items = items.filter((item) => item.readyForReview);
  if (query.readiness === "NOT_READY")
    items = items.filter((item) => !item.readyForReview);
  if (query.search)
    items = items.filter((item) => matchesSearch(item, query.search));
  if (query.createdFrom) {
    const boundary = new Date(query.createdFrom).getTime();
    items = items.filter(
      (item) => new Date(item.createdAt).getTime() >= boundary,
    );
  }
  if (query.createdTo) {
    const boundary = new Date(query.createdTo).getTime();
    items = items.filter(
      (item) => new Date(item.createdAt).getTime() <= boundary,
    );
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const pageItems = items.slice((page - 1) * limit, page * limit);
  const response = {
    items: pageItems,
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
  const detailItem = query.providerId ? pageItems[0] : null;
  return detailItem && query.include?.length
    ? { ...response, included: buildIncluded(detailItem) }
    : response;
}

/** Simulates POST creation and transitions one applicant to PROFILE_CREATED. */
export function createMockProviderManagement(payload, files = {}) {
  if (!files.verificationDocument) {
    throw mockError(
      400,
      "ADMIN_PROVIDER_VERIFICATION_DOCUMENT_REQUIRED",
      "verificationDocument is required for admin-assisted Provider creation.",
    );
  }
  const existing = mockProviderManagement.items.find(
    (item) => item.ownerUserId === payload.ownerUserId && item.profileExists,
  );
  if (existing) {
    throw mockError(
      409,
      "PROVIDER_PROFILE_ALREADY_EXISTS",
      "A ProviderProfile already exists for this User.",
    );
  }
  const index = mockProviderManagement.items.findIndex(
    (item) => item.ownerUserId === payload.ownerUserId,
  );
  const applicant = mockProviderManagement.items[index];
  if (!applicant) {
    throw mockError(
      404,
      "USER_ACCOUNT_NOT_FOUND",
      "The Provider applicant was not found.",
    );
  }
  if (applicant.owner?.status !== "ACTIVE") {
    throw mockError(403, "USER_INACTIVE", "The User account is inactive.");
  }
  if (
    !payload.typeProvider ||
    !payload.nameBusinessAr ||
    !payload.nameBusinessEn
  ) {
    throw mockError(
      400,
      "VALIDATION_FAILED",
      "The required Provider profile fields are missing.",
    );
  }

  const providerId =
    globalThis.crypto?.randomUUID?.() || `mock-provider-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const missingFields = [
    ...(payload.typeProvider === "COMPANY" && !payload.registerCommercial
      ? ["registerCommercial"]
      : []),
  ];
  const createdItem = {
    ...applicant,
    providerId,
    typeProvider: payload.typeProvider,
    registrationStage: "PROFILE_CREATED",
    profileExists: true,
    businessName: payload.nameBusinessEn,
    businessNameAr: payload.nameBusinessAr,
    businessNameEn: payload.nameBusinessEn,
    approvalStatus: "PENDING_REVIEW",
    availableIs: false,
    lifecycleStatus: "ACTIVE",
    hasAddress: Boolean(
      payload.addressTitle ||
      payload.addressCity ||
      payload.addressArea ||
      payload.addressStreet,
    ),
    hasVerificationDocument: Boolean(files.verificationDocument),
    readyForReview: missingFields.length === 0,
    missingFields,
    atApproved: null,
    createdAt,
    updatedAt: createdAt,
  };
  const addressFields = [
    "addressTitle",
    "addressCity",
    "addressArea",
    "addressStreet",
    "addressBuildingNumber",
    "addressLatitude",
    "addressLongitude",
    "addressNotes",
  ];
  const address = Object.fromEntries(
    addressFields
      .filter((field) => payload[field] !== undefined && payload[field] !== "")
      .map((field) => [
        field
          .replace("address", "")
          .replace(/^./, (value) => value.toLowerCase()),
        payload[field],
      ]),
  );
  const profile = {
    id: providerId,
    ownerUserId: payload.ownerUserId,
    typeProvider: payload.typeProvider,
    nameBusinessAr: payload.nameBusinessAr,
    nameBusinessEn: payload.nameBusinessEn,
    descriptionAr: payload.descriptionAr || null,
    descriptionEn: payload.descriptionEn || null,
    registerCommercial: payload.registerCommercial || null,
    approvalStatus: "PENDING_REVIEW",
    availableIs: false,
    lifecycleStatus: "ACTIVE",
    owner: applicant.owner,
    address: Object.keys(address).length ? address : null,
    files: Object.fromEntries(
      ["logo", "cover", "verificationDocument"].map((field) => [
        field,
        files[field]
          ? {
              fileName: files[field].name,
              mimeType: files[field].type,
              sizeBytes: files[field].size,
            }
          : null,
      ]),
    ),
    atApproved: null,
    atCreated: createdAt,
    atUpdated: createdAt,
  };
  mockProviderManagement.items.splice(index, 1, createdItem);
  mockProfiles.set(providerId, profile);
  mockProviderManagement.meta.total = mockProviderManagement.items.length;

  return {
    providerId,
    ownerUserId: payload.ownerUserId,
    registrationStage: "PROFILE_CREATED",
    profileExists: true,
    readyForReview: missingFields.length === 0,
    missingFields,
    profile,
  };
}

/** Applies the V1.2 mock mutations that require an authoritative refetch. */
export function patchMockProviderManagement(providerId, section, files = {}) {
  const profile = mockProfiles.get(providerId);
  const item = mockProviderManagement.items.find(
    (row) => row.providerId === providerId,
  );
  if (!profile || !item) {
    throw mockError(404, "PROVIDER_NOT_FOUND", "Provider was not found.");
  }
  const nowUpdated = new Date().toISOString();
  if (section.profile) {
    if (files.verificationDocument) {
      profile.files.verificationDocument = {
        mediaId: `mock-document-${Date.now()}`,
        fileName: files.verificationDocument.name,
        mimeType: files.verificationDocument.type,
        sizeBytes: files.verificationDocument.size,
        downloadUrl: `/admin/providers/${providerId}/verification-documents/mock-document`,
      };
      item.hasVerificationDocument = true;
    }
    profile.atUpdated = nowUpdated;
    item.updatedAt = nowUpdated;
  }
  if (
    providerId === companyProviderId &&
    section.coverage?.action === "REPLACE_ASSIGNMENTS"
  ) {
    const zone = mockCompanyCoverage.items.find(
      (row) => row.id === section.coverage.zoneId,
    );
    if (!zone) {
      throw mockError(
        404,
        "SERVICE_ZONE_NOT_FOUND",
        "Coverage zone was not found.",
      );
    }
    zone.assignmentMode = section.coverage.assignmentMode;
    zone.assignments =
      section.coverage.assignmentMode === "SELECTED_MEMBERS"
        ? (section.coverage.memberIds || []).map((memberId) => {
            const member = mockCompanyMembers.find(
              (row) => row.id === memberId,
            );
            return {
              providerMemberId: memberId,
              displayName: member?.user?.fullName || memberId,
              activeIs: true,
            };
          })
        : [];
    zone.selectedMemberCount = zone.assignments.length;
    zone.updatedAt = nowUpdated;
  }
  return { providerId, command: Object.keys(section)[0], result: section };
}
