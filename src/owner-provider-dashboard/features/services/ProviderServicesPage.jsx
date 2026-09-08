import { useState } from "react";
import { toast } from "react-hot-toast";
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';
import { Plus, Edit, Trash2, LayoutList, Grid3X3, Clock, Coins, ChevronDown } from "lucide-react";
import {
  useProviderServices,
  useAddProviderService,
  useUpdateProviderService,
  useUpdateProviderServicePrices,
  useDeleteProviderService
} from "./useProviderServices";
import Card from "../../../shared/components/ui/Card";
import Toggle from "../../../shared/components/ui/Toggle";
import Modal from "../../../shared/components/ui/Modal";
import ServiceModal from "./ServiceModal";

export default function ProviderServicesPage() {
  const [filter, setFilter] = useState("ALL"); // "ALL", "ACTIVE", "INACTIVE"
  const availableIs = filter === "ALL" ? undefined : filter === "ACTIVE";

  const { data: services = [], isLoading } = useProviderServices(availableIs);
  const { mutateAsync: addService, isPending: addingService } = useAddProviderService();
  const { mutateAsync: updateServiceAsync, mutate: updateService, isPending: updatingService } = useUpdateProviderService();
  const { mutateAsync: updatePricesAsync, isPending: updatingPrices } = useUpdateProviderServicePrices();
  const { mutateAsync: deleteServiceAsync, isPending: isDeleting } = useDeleteProviderService();


  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const handleToggleActive = (serviceItem) => {
    const current = serviceItem.availableIs;
    updateService({
      id: serviceItem.id,
      availableIs: !current
    });
  };

  const handleDeleteService = (serviceItem) => {
    setServiceToDelete(serviceItem);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteServiceAsync(serviceToDelete.id);
      toast.success("تم حذف الخدمة بنجاح");
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error(getApiErrorMessage(error, 'فشل حذف الخدمة'));
    } finally {
      setServiceToDelete(null);
    }
  };

  const handleSaveService = async (formData) => {
    try {
      if (editingService) {
        const { serviceId, ...updateData } = formData;
        const payload = { id: editingService.id, ...updateData };
        await updateServiceAsync(payload);
        setEditingService(null);
        toast.success("تم تعديل الخدمة بنجاح");
      } else {
        await addService(formData);
        setShowAddModal(false);
        toast.success("تم اضافة الخدمة بنجاح");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'فشل حفظ الخدمة'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الخدمات</h1>
          <p className="text-gray-500 mt-1 font-medium">ادارة الخدمات المقدمة من قبل الورشة</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Service
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("ACTIVE")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === "ACTIVE" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("INACTIVE")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === "INACTIVE" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Inactive
        </button>
      </div>

      {/* Services Grid or Empty State */}
      {services.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 px-4 text-center border-dashed border-2 border-gray-200">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <LayoutList className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No services activated yet</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-sm">
            Click 'New Service' to build your service menu and customize prices/durations.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Service
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Card key={s.id} className="relative flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                {/* Top header row of card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                    <Grid3X3 className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const active = s.availableIs;
                      return (
                        <>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            active
                              ? "bg-green-50 text-green-700 border border-green-150"
                              : "bg-gray-50 text-gray-400 border border-gray-150"
                          }`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                          <Toggle
                            value={active}
                            onChange={() => handleToggleActive(s)}
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Service Details */}
                {s.service?.category?.name && (
                  <div className="text-[10px] font-bold text-blue-600 mb-1.5 uppercase tracking-wide">
                    {s.service.category.name}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                  {s.overrideNameDisplay || s.service?.name || ""}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {s.overrideDescription || s.service?.description || ""}
                </p>
              </div>

              {/* Pricing, Duration and Actions section */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {(() => {
                  const prices = s.prices || [];
                  const minPrice = prices.length > 0 ? Math.min(...prices.map(p => p.priceProvider)) : 0;
                  const minDuration = prices.length > 0 ? Math.min(...prices.map(p => p.minutesDuration)) : 0;
                  const isExpanded = expandedCards[s.id] || false;
                  const toggleCard = () => setExpandedCards(prev => ({ ...prev, [s.id]: !prev[s.id] }));

                  return (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                          <Coins className="w-4 h-4" />
                          <span>{prices.length > 0 ? `Starts from ${minPrice} SAR` : "0 SAR"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{minDuration > 0 ? `${minDuration} min` : "—"}</span>
                        </div>
                      </div>

                      <button
                        onClick={toggleCard}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 bg-gray-50/50 hover:bg-gray-100 rounded-md transition-colors mb-3"
                      >
                        {isExpanded ? "Hide Prices" : "View Prices"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="bg-gray-50 rounded-md px-3 py-2 space-y-1.5 mb-3">
                          {prices.length > 0 ? (
                            prices.map((price, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 font-medium">{price.carType.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {price.minutesDuration} min
                                  </span>
                                  <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                                    <Coins className="w-3.5 h-3.5" />
                                    {price.priceProvider} SAR
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 text-center py-1">No prices available</p>
                          )}
                        </div>
                      )}

                      {/* Actions row */}
                      <div className="flex items-center justify-end gap-2 border-t border-gray-50 pt-3">
                        <button
                          onClick={() => setEditingService(s)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(s)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-650 hover:text-white hover:bg-red-600 border border-red-205 hover:border-transparent rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || editingService) && (
        <ServiceModal
          service={editingService}
          existingServices={services}
          onClose={() => {
            setShowAddModal(false);
            setEditingService(null);
          }}
          onSave={handleSaveService}
          isSaving={addingService || updatingService || updatingPrices}
        />
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <Modal
          title="Delete Service"
          onClose={() => !isDeleting && setServiceToDelete(null)}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              هل انت متاكد من حذف <span className="font-semibold text-gray-900">{serviceToDelete.overrideNameDisplay || serviceToDelete.name}</span> من قائمة الخدمات؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
              الغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteService}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                {isDeleting ? "جاري الحذف..." : "حذف الخدمة"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
