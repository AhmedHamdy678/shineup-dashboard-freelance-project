import providerAxiosClient from './providerAxiosClient';

const MOCK_CAR_TYPES = [
  { id: 'f8672a21-6663-45b9-b7ef-0b866522ea12', name: 'Sedan', description: 'Standard sedan passenger car.', activeIs: true },
  { id: 'bf634fd6-6caf-4cd0-8d74-d906210ba7af', name: 'SUV', description: 'Sport utility vehicle or crossover.', activeIs: true },
  { id: 'ae614b6c-12a9-459e-8aff-e9b32083a987', name: 'Small Car', description: 'Compact hatchback or small city car.', activeIs: true },
];

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function fetchCarTypes() {
  if (useMock) {
    return Promise.resolve([...MOCK_CAR_TYPES]);
  }
  const { data } = await providerAxiosClient.get('/catalog/car-types');
  return Array.isArray(data) ? data : [];
}
