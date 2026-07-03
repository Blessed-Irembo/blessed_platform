'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { useRequireAdmin } from '@/lib/adminAuthHooks';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LicensedPharmacy {
  id: string;
  registrationNumber: string;
  name: string;
  councilTechnician?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  licenseExpiryDate?: string;
  isRegistered: boolean;
  registeredUid?: string;
  createdAt?: any;
  seededAt?: any;
}

export default function LicensedPharmaciesPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAdmin();

  const [licenses, setLicenses] = useState<LicensedPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'unregistered'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<LicensedPharmacy | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    registrationNumber: '',
    name: '',
    councilTechnician: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    licenseExpiryDate: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    councilTechnician: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    licenseExpiryDate: '',
    isRegistered: false,
    registeredUid: '',
  });

  useEffect(() => {
    if (authLoading) return;

    const unsub = onSnapshot(collection(db, 'licensed_pharmacies'), (snapshot) => {
      const list = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          registrationNumber: data.registrationNumber || docSnap.id.replace('_', '/'),
          name: data.name || '',
          councilTechnician: data.councilTechnician || '',
          province: data.province || '',
          district: data.district || '',
          sector: data.sector || '',
          cell: data.cell || '',
          licenseExpiryDate: data.licenseExpiryDate || '',
          isRegistered: data.isRegistered || false,
          registeredUid: data.registeredUid || '',
          ...data,
        };
      }) as LicensedPharmacy[];

      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setLicenses(list);
      setLoading(false);
    });

    return () => unsub();
  }, [authLoading]);

  // Handlers
  const handleAddLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const npc = addForm.registrationNumber.toUpperCase().trim();
    
    // NPC Format Validation
    if (!npc.match(/^NPC\/A\d{4}$/)) {
      alert('NPC format must match NPC/A0000');
      return;
    }

    // Check for duplicates locally
    const exists = licenses.some(
      (l) => l.registrationNumber.toUpperCase() === npc || l.id.toUpperCase() === npc.replace('/', '_')
    );
    if (exists) {
      alert(`License for ${npc} already exists in the registry.`);
      return;
    }

    setActionLoading(true);
    try {
      const docId = npc.replace('/', '_');
      const licenseRef = doc(db, 'licensed_pharmacies', docId);

      await setDoc(licenseRef, {
        registrationNumber: npc,
        name: addForm.name.toUpperCase().trim(),
        councilTechnician: addForm.councilTechnician.trim(),
        province: addForm.province.trim(),
        district: addForm.district.trim(),
        sector: addForm.sector.trim(),
        cell: addForm.cell.trim(),
        licenseExpiryDate: addForm.licenseExpiryDate,
        isRegistered: false,
        registeredUid: '',
        createdAt: serverTimestamp(),
      });

      setShowAddModal(false);
      setAddForm({
        registrationNumber: '',
        name: '',
        councilTechnician: '',
        province: '',
        district: '',
        sector: '',
        cell: '',
        licenseExpiryDate: '',
      });
      alert(`License ${npc} added successfully.`);
    } catch (err: any) {
      console.error('Error adding license:', err);
      alert(`Failed to add license: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = (license: LicensedPharmacy) => {
    setSelectedLicense(license);
    setEditForm({
      name: license.name || '',
      councilTechnician: license.councilTechnician || '',
      province: license.province || '',
      district: license.district || '',
      sector: license.sector || '',
      cell: license.cell || '',
      licenseExpiryDate: license.licenseExpiryDate || '',
      isRegistered: license.isRegistered || false,
      registeredUid: license.registeredUid || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) return;

    setActionLoading(true);
    try {
      const licenseRef = doc(db, 'licensed_pharmacies', selectedLicense.id);
      
      const updatedData = {
        name: editForm.name.toUpperCase().trim(),
        councilTechnician: editForm.councilTechnician.trim(),
        province: editForm.province.trim(),
        district: editForm.district.trim(),
        sector: editForm.sector.trim(),
        cell: editForm.cell.trim(),
        licenseExpiryDate: editForm.licenseExpiryDate,
        isRegistered: editForm.isRegistered,
        registeredUid: editForm.isRegistered ? editForm.registeredUid.trim() : '',
      };

      await updateDoc(licenseRef, updatedData);
      setShowEditModal(false);
      setSelectedLicense(null);
      alert('Registry license updated successfully.');
    } catch (err: any) {
      console.error('Error updating license:', err);
      alert(`Failed to update license: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLicense = async (license: LicensedPharmacy) => {
    if (!confirm(`⚠️ WARNING: Are you sure you want to delete "${license.registrationNumber}" from the licensed registry?\n\nThis will prevent them from registering on the app under this NPC number.`)) {
      return;
    }
    if (license.isRegistered && !confirm(`This license is currently registered to a user account (UID: ${license.registeredUid}). Deleting it will unlink their registration. Proceed?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const licenseRef = doc(db, 'licensed_pharmacies', license.id);
      await deleteDoc(licenseRef);
      alert(`License ${license.registrationNumber} deleted successfully.`);
    } catch (err: any) {
      console.error('Error deleting license:', err);
      alert(`Failed to delete license: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter list based on inputs
  const filteredLicenses = licenses.filter((license) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'registered' && license.isRegistered) ||
      (statusFilter === 'unregistered' && !license.isRegistered);

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      license.registrationNumber.toLowerCase().includes(query) ||
      license.name.toLowerCase().includes(query) ||
      (license.district && license.district.toLowerCase().includes(query)) ||
      (license.registeredUid && license.registeredUid.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const totalCount = licenses.length;
  const registeredCount = licenses.filter((l) => l.isRegistered).length;
  const unregisteredCount = totalCount - registeredCount;

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 w-full p-4 sm:p-8 pb-20 sm:pb-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Licensed Pharmacy Registry</h1>
              <p className="text-gray-600">Add, edit, or remove Rwanda FDA permitted NPC numbers and manage their registration associations.</p>
            </div>
            <div>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New License
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium mb-3">Total Licensed NPCs</h3>
              <div className="text-4xl font-bold text-gray-900 mb-1">{loading ? '-' : totalCount}</div>
              <p className="text-xs text-gray-400 font-medium">Permitted in database</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium mb-3">Registered Listings</h3>
              <div className="text-4xl font-bold text-teal-600 mb-1">{loading ? '-' : registeredCount}</div>
              <p className="text-xs text-gray-400 font-medium">Active platform accounts</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-gray-500 text-sm font-medium mb-3">Available Registry Slots</h3>
              <div className="text-4xl font-bold text-amber-600 mb-1">{loading ? '-' : unregisteredCount}</div>
              <p className="text-xs text-gray-400 font-medium">NPCs waiting to sign up</p>
            </div>
          </div>

          {/* Search, Filter & Table Block */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Field */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by NPC license, name, district, or registered UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400 font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-56">
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-semibold"
                >
                  <option value="all">All Registrations</option>
                  <option value="registered">Registered Only</option>
                  <option value="unregistered">Available Only</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search criteria or register filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NPC Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pharmacy Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">District / Address</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                        {/* NPC Code */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900 font-mono bg-gray-100 px-2.5 py-1 border border-gray-200 rounded uppercase">
                            {license.registrationNumber}
                          </span>
                        </td>
                        
                        {/* Name */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 uppercase truncate max-w-xs">{license.name}</div>
                          {license.councilTechnician && (
                            <div className="text-xs text-gray-500 mt-0.5">Technician: {license.councilTechnician}</div>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-800">{license.district || '—'}</div>
                          {license.province && (
                            <div className="text-xs text-gray-400 font-semibold">{license.province} Province</div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {license.isRegistered ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1.5 self-start bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                Registered
                              </span>
                              {license.registeredUid && (
                                <span className="text-[10px] text-gray-400 font-mono mt-1 select-all" title="Registered User UID">
                                  UID: {license.registeredUid.slice(0, 8)}…
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Available
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <div className="flex justify-end items-center gap-3">
                            <button
                              onClick={() => handleStartEdit(license)}
                              className="text-teal-600 hover:text-teal-900 px-3 py-1.5 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLicense(license)}
                              className="text-red-600 hover:text-red-900 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* --- ADD NEW LICENSE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Add Certified NPC License</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddLicense} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Registration number */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">NPC Reg Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="NPC/A0000"
                    value={addForm.registrationNumber}
                    onChange={(e) => setAddForm({ ...addForm, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Format: NPC/A followed by 4 digits</p>
                </div>

                {/* Pharmacy Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Pharmacy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter pharmacy name"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Council Technician */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Council Technician Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={addForm.councilTechnician}
                    onChange={(e) => setAddForm({ ...addForm, councilTechnician: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Expiry Date */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    value={addForm.licenseExpiryDate}
                    onChange={(e) => setAddForm({ ...addForm, licenseExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Province */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Province</label>
                  <input
                    type="text"
                    placeholder="Kigali City"
                    value={addForm.province}
                    onChange={(e) => setAddForm({ ...addForm, province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* District */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">District</label>
                  <input
                    type="text"
                    placeholder="Gasabo"
                    value={addForm.district}
                    onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Sector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Sector</label>
                  <input
                    type="text"
                    placeholder="Kimironko"
                    value={addForm.sector}
                    onChange={(e) => setAddForm({ ...addForm, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Cell */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Cell</label>
                  <input
                    type="text"
                    placeholder="Kibagabaga"
                    value={addForm.cell}
                    onChange={(e) => setAddForm({ ...addForm, cell: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  Save NPC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LICENSE MODAL --- */}
      {showEditModal && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Edit License Details</h2>
                <span className="font-mono bg-gray-200 text-gray-800 text-sm font-semibold px-2 py-0.5 border rounded">
                  {selectedLicense.registrationNumber}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedLicense(null);
                }}
                className="text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Pharmacy Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Pharmacy Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Council Technician */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Council Technician Name</label>
                  <input
                    type="text"
                    value={editForm.councilTechnician}
                    onChange={(e) => setEditForm({ ...editForm, councilTechnician: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Expiry Date */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editForm.licenseExpiryDate}
                    onChange={(e) => setEditForm({ ...editForm, licenseExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Province */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Province</label>
                  <input
                    type="text"
                    value={editForm.province}
                    onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* District */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Sector */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Sector</label>
                  <input
                    type="text"
                    value={editForm.sector}
                    onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Cell */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Cell</label>
                  <input
                    type="text"
                    value={editForm.cell}
                    onChange={(e) => setEditForm({ ...editForm, cell: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Registration Linkage */}
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="editIsRegistered"
                      checked={editForm.isRegistered}
                      onChange={(e) => setEditForm({ ...editForm, isRegistered: e.target.checked })}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="editIsRegistered" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                      Mark as Registered
                    </label>
                  </div>

                  {editForm.isRegistered && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Registered User ID (registeredUid)</label>
                      <input
                        type="text"
                        required
                        placeholder="Paste Firebase Auth UID"
                        value={editForm.registeredUid}
                        onChange={(e) => setEditForm({ ...editForm, registeredUid: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">This links this license registry record to the pharmacy profile UID in Firebase Auth.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLicense(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
