import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BookingHeader from "./components/BookingHeader";
import CustomerVehicleCard from "./components/CustomerVehicleCard";
import LocationCard from "./components/LocationCard";
import InvoiceTable from "./components/InvoiceTable";
import ScheduleAssignmentCard from "./components/ScheduleAssignmentCard";
import SupportActionsSidebar from "./components/SupportActionsSidebar";
import { getProviderBookingById } from "../../../api/endpoints/providerBookings.api";

export default function ProviderBookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-booking', id],
    queryFn: () => getProviderBookingById(id),
  });

  console.log(data);

  if (isLoading) {
    return (
      <div className="p-6 text-gray-500 text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        جارٍ تحميل تفاصيل الحجز...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center py-10">
        <p className="text-red-500 mb-4">حدث خطأ أثناء تحميل تفاصيل الحجز.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingHeader 
        id={id}
        booking={data?.booking} 
        requestStatus={data?.requestStatus} 
        onBack={() => navigate(-1)} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Columns (Span 2) */}
        <div className="xl:col-span-2 space-y-6">
          <CustomerVehicleCard 
            customer={data.booking?.customer} 
            car={data.booking?.car} 
          />
          <LocationCard 
            location={data.booking?.location} 
          />
          <InvoiceTable 
            items={data.booking?.items} 
          />
        </div>

        {/* Right Column (Span 1) */}
        <div className="xl:col-span-1 space-y-6">
          <ScheduleAssignmentCard 
            scheduledAt={data?.booking?.scheduledAt}
            bookingTimeMode={data?.booking?.bookingTimeMode}
            targetedProviderMember={data?.targetedProviderMember}
          />
          <SupportActionsSidebar />
        </div>

      </div>
    </div>
  );
}
