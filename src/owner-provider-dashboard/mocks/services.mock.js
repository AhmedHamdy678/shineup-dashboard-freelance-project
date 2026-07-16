export let mockCatalogServices = [
  { id: "c1", name: "Express Wash", description: "Quick exterior wash using high-pressure water and foam." },
  { id: "c2", name: "Full Detail", description: "Complete deep cleaning of interior and exterior surfaces." },
  { id: "c3", name: "Engine Polish", description: "Deep cleaning, degreasing and polishing of the engine bay." },
  { id: "c4", name: "Wax & Polish", description: "Premium exterior paint wax protection and polishing." },
  { id: "c5", name: "Ceramic Coating", description: "Ultra-hard protective coating with hydrophobic gloss finish." },
  { id: "c6", name: "Headlight Restoration", description: "Polishing and oxidation removal from vehicle headlights." }
];

const SEDAN_ID = 'f8672a21-6663-45b9-b7ef-0b866522ea12';
const SUV_ID = 'bf634fd6-6caf-4cd0-8d74-d906210ba7af';
const SMALL_CAR_ID = 'ae614b6c-12a9-459e-8aff-e9b32083a987';

export let mockProviderServices = [
  {
    id: "ps1",
    catalogServiceId: "c1",
    serviceId: "c1",
    name: "Express Wash",
    description: "Quick exterior wash using high-pressure water and foam.",
    prices: [
      { priceProvider: 100, minutesDuration: 20, carType: { id: SEDAN_ID, name: "Sedan" } },
      { priceProvider: 150, minutesDuration: 30, carType: { id: SUV_ID, name: "SUV" } },
      { priceProvider: 200, minutesDuration: 40, carType: { id: SMALL_CAR_ID, name: "Small Car" } },
    ],
    isActive: true,
    availableIs: true
  },
  {
    id: "ps2",
    catalogServiceId: "c2",
    serviceId: "c2",
    name: "Full Detail",
    description: "Complete deep cleaning of interior and exterior surfaces.",
    prices: [
      { priceProvider: 350, minutesDuration: 75, carType: { id: SEDAN_ID, name: "Sedan" } },
      { priceProvider: 450, minutesDuration: 90, carType: { id: SUV_ID, name: "SUV" } },
      { priceProvider: 600, minutesDuration: 120, carType: { id: SMALL_CAR_ID, name: "Small Car" } },
    ],
    isActive: true,
    availableIs: true
  },
  {
    id: "ps3",
    catalogServiceId: "c4",
    serviceId: "c4",
    name: "Wax & Polish",
    description: "Premium exterior paint wax protection and polishing.",
    prices: [
      { priceProvider: 250, minutesDuration: 45, carType: { id: SEDAN_ID, name: "Sedan" } },
      { priceProvider: 300, minutesDuration: 60, carType: { id: SUV_ID, name: "SUV" } },
      { priceProvider: 400, minutesDuration: 80, carType: { id: SMALL_CAR_ID, name: "Small Car" } },
    ],
    isActive: false,
    availableIs: false
  }
];

export const getMockCatalogServices = () => {
  return [...mockCatalogServices];
};

export const getMockProviderServices = () => {
  return [...mockProviderServices];
};

export const addMockProviderService = (payload) => {
  const serviceId = payload.serviceId || payload.catalogServiceId;
  const catalogItem = mockCatalogServices.find((c) => c.id === serviceId);
  const availableIs = payload.availableIs !== undefined ? Boolean(payload.availableIs) : true;
  const newMapping = {
    id: `ps_${Date.now()}`,
    catalogServiceId: serviceId,
    serviceId,
    name: catalogItem ? catalogItem.name : "Custom Service",
    description: catalogItem ? catalogItem.description : "",
    prices: payload.prices || [],
    isActive: availableIs,
    availableIs
  };
  mockProviderServices = [...mockProviderServices, newMapping];
  return newMapping;
};

export const updateMockProviderService = (id, payload) => {
  mockProviderServices = mockProviderServices.map((s) => {
    if (s.id === id) {
      const resolvedActive =
        payload.availableIs !== undefined ? Boolean(payload.availableIs) :
        payload.isActive !== undefined ? Boolean(payload.isActive) :
        s.isActive;
      return {
        ...s,
        serviceId: payload.serviceId || s.serviceId,
        prices: payload.prices !== undefined ? payload.prices : s.prices,
        isActive: resolvedActive,
        availableIs: resolvedActive
      };
    }
    return s;
  });
  return mockProviderServices.find((s) => s.id === id);
};

export const deleteMockProviderService = (id) => {
  mockProviderServices = mockProviderServices.filter((s) => s.id !== id);
  return { success: true };
};
