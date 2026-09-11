import React, { useState, useEffect } from 'react';
import ServiceZonesList from './components/ServiceZonesList';
import ServiceZonesMap from './components/ServiceZonesMap';
import ZoneForm from './components/ZoneForm';
import ZoneDetails from './components/ZoneDetails';
import { MapPin, Plus } from 'lucide-react';
import providerAxiosClient from '../../api/providerAxiosClient';
import { getApiErrorMessage } from '../../../admin-dashboard/api/axiosClient';

export default function ServiceZonesPage() {
  const [zones, setZones] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editingZoneData, setEditingZoneData] = useState(null);
  const [newZoneLocation, setNewZoneLocation] = useState({ lat: 24.71144, lng: 46.67441, radiusKm: 5 });
  
  const [members, setMembers] = useState([]);

  const fetchZones = async (page) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await providerAxiosClient.get(`/providers/me/service-zones?page=${page}&limit=20`);
      
      const { items, pagination: paginationData } = response.data;
      setZones(items || []);
      setPagination(paginationData || { page, limit: 20, totalPages: 1, totalItems: 0 });
    } catch (err) {
      console.error('Failed to fetch service zones:', err);
      setError(getApiErrorMessage(err, 'حدث خطأ أثناء جلب مناطق التغطية.'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await providerAxiosClient.get('/providers/me/members');
      setMembers(response.data.items || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  useEffect(() => {
    fetchZones(1);
    fetchMembers();
  }, []);

  const handlePageChange = (newPage) => {
    fetchZones(newPage);
  };

  const handleCreateZone = () => {
    setEditingZoneId(null);
    setEditingZoneData(null);
    setSelectedZoneId(null);
    setNewZoneLocation({ lat: 24.71144, lng: 46.67441, radiusKm: 5 });
    setIsFormOpen(true);
  };

  const handleEditZone = async (id) => {
    try {
      setIsLoading(true);
      const response = await providerAxiosClient.get(`/providers/me/service-zones/${id}`);
      const data = response.data.item || response.data;
      
      setEditingZoneId(id);
      setEditingZoneData(data);
      setNewZoneLocation({ 
        lat: data.latitude || 24.71144, 
        lng: data.longitude || 46.67441, 
        radiusKm: data.radiusMeters ? data.radiusMeters / 1000 : 5 
      });
      setIsFormOpen(true);
    } catch (err) {
      console.error('Failed to fetch zone details:', err);
      // Optional: show error toast or set error state
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            مناطق التغطية
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة مناطق تقديم الخدمة الخاصة بك على الخريطة.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={handleCreateZone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة منطقة جديدة
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Column (List/Form) */}
        <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isFormOpen ? (
            <ZoneForm
              initialData={editingZoneData}
              newZoneLocation={newZoneLocation}
              setNewZoneLocation={setNewZoneLocation}
              members={members}
              onCancel={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                fetchZones(1);
              }}
            />
          ) : selectedZoneId ? (
            <ZoneDetails
              zoneId={selectedZoneId}
              onBack={() => setSelectedZoneId(null)}
              onEdit={(id) => {
                setSelectedZoneId(null);
                handleEditZone(id);
              }}
              onDeleteSuccess={() => {
                setSelectedZoneId(null);
                fetchZones(1);
              }}
            />
          ) : (
            <ServiceZonesList 
              zones={zones}
              pagination={pagination}
              isLoading={isLoading}
              error={error}
              onPageChange={handlePageChange}
              onRetry={() => fetchZones(pagination.page)}
              onEditZone={handleEditZone}
              onViewZone={(id) => setSelectedZoneId(id)}
            />
          )}
        </div>

        <div className="lg:col-span-2 h-full bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <ServiceZonesMap 
            zones={zones} 
            isCreatingMode={isFormOpen}
            newZoneLocation={newZoneLocation}
            onLocationSelect={(lat, lng) => setNewZoneLocation(prev => ({ ...prev, lat, lng }))}
            selectedZone={zones.find(z => z.id === selectedZoneId)}
          />
        </div>
      </div>
    </div>
  );
}
