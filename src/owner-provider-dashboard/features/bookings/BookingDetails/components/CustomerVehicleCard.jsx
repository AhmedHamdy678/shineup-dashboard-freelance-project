import { User, Car } from "lucide-react";

export default function CustomerVehicleCard({ customer, car }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100">
        
        {/* Customer Info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">العميل</h3>
            <p className="text-lg font-semibold text-gray-900">{customer?.fullName}</p>
            <p className="text-sm text-gray-500 mt-1" dir="ltr">{customer?.phone}</p>
          </div>
        </div>
        
        {/* Vehicle Info */}
        <div className="flex items-start gap-4 md:px-6 pt-6 md:pt-0">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-500 mb-1">السيارة</h3>
            <p className="text-lg font-bold text-gray-900">{car?.brand} {car?.model}</p>
            <p className="text-sm text-gray-500 mt-1">{car?.year} • {car?.color}</p>
            
            <div className="mt-4 inline-block border border-gray-300 rounded bg-gray-50 px-3 py-1.5 shadow-sm">
              <p className="text-sm font-mono font-bold tracking-widest text-gray-800" dir="ltr">
                {car?.plateNumber}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
