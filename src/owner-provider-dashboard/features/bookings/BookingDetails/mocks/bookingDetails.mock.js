export const mockBookingData = {
  "id": "61313b58-4be7-498f-ba86-1681c3022859",
  "requestStatus": {
      "context": "BOOKING_PROVIDER_REQUEST",
      "code": "ACCEPTED",
      "label": "مقبول"
  },
  "atSent": "2026-07-04T14:21:30.397Z",
  "expiresAt": "2026-07-04T14:31:27.687Z",
  "atResponded": "2026-07-04T14:22:16.249Z",
  "reasonRejection": null,
  "targetedProviderMember": {
      "id": "1fd821c3-1412-4cf1-b5db-e5b5d2dc7a7e",
      "name": "Demo Technician"
  },
  "booking": {
      "id": "35b43d7e-cc7c-4b16-8ddb-936558c5edb1",
      "codeBooking": "SHN-20260704-871417",
      "bookingTimeMode": "NOW",
      "scheduledAt": "2026-07-04T14:21:27.687Z",
      "notes": null,
      "bookingStatus": {
          "context": "BOOKING",
          "code": "CONFIRMED",
          "label": "مؤكد"
      },
      "customer": {
          "id": "1cad80c3-bba9-4c8f-80e8-aa22f4e41587",
          "fullName": "Demo Customer",
          "phone": "0500000011"
      },
      "car": {
          "id": "d0fb2f4e-c00c-4d7e-aa18-c6d682da153c",
          "brand": "Toyota",
          "model": "Camry",
          "year": 2024,
          "color": "White",
          "plateNumber": "DEMO-CAR-001"
      },
      "location": {
          "labelLocation": "Demo Riyadh Address",
          "city": "Riyadh",
          "area": "Al Olaya",
          "textAddress": "King Fahd Road, Building 120, Al Olaya, Riyadh",
          "latitude": 24.7136,
          "longitude": 46.6753,
          "instructions": "Primary demo customer address in Riyadh."
      },
      "items": [
          {
              "id": "eb7b27df-a667-4921-99fc-b0c878dc78ca",
              "serviceName": "غسيل خارجي أساسي",
              "carTypeName": "سيدان",
              "priceTotalCustomer": 85,
              "currency": "SAR",
              "durationMinutes": 30
          }
      ]
  }
};
