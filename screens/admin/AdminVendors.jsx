import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axiosInstance from '../../lib/axios';

const VENDOR_TYPES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'grooming', label: 'Grooming', icon: 'scissors' },
  { id: 'vet', label: 'Vet Clinic', icon: 'activity' },
  { id: 'trainer', label: 'Trainers', icon: 'award' },
  { id: 'boarding', label: 'Boarding', icon: 'home' },
  { id: 'breeder', label: 'Breeders', icon: 'heart' },
];

// Map filter type to role keywords (adjust as your API returns)
const ROLE_MAP = {
  grooming: ['pet grooming shop', 'grooming'],
  vet: ['vet hospital', 'doctor', 'vet clinic'],
  trainer: ['pet trainer', 'trainer'],
  boarding: ['pet boarding shop', 'boarding'],
  breeder: ['vendor', 'breeder'],
};

const TYPE_COLORS = {
  grooming: '#d97706',
  vet: '#0ea5e9',
  trainer: '#16a34a',
  boarding: '#7c3aed',
  breeder: '#db2777',
  unknown: '#64748b',
};

function detectType(vendor) {
  const r = (vendor.role || vendor.vendorType || vendor.type || '').toLowerCase();
  for (const [key, keywords] of Object.entries(ROLE_MAP)) {
    if (keywords.some((k) => r.includes(k))) return key;
  }
  return 'unknown';
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchVendors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [vRes, dRes, tRes, gRes, bRes] = await Promise.all([
        axiosInstance.get('/adminvendors').catch(() => ({ data: [] })),
        axiosInstance.get('/adminvendors/doctors').catch(() => ({ data: [] })),
        axiosInstance.get('/adminvendors/pettrainers').catch(() => ({ data: [] })),
        axiosInstance.get('/adminvendors/petgroomers').catch(() => ({ data: [] })),
        axiosInstance.get('/adminvendors/petboardings').catch(() => ({ data: [] }))
      ]);

      const vendors = Array.isArray(vRes.data) ? vRes.data : vRes.data?.vendors || [];
      const doctors = Array.isArray(dRes.data) ? dRes.data : dRes.data?.doctors || [];
      const trainers = Array.isArray(tRes.data) ? tRes.data : tRes.data?.trainers || [];
      const groomers = Array.isArray(gRes.data) ? gRes.data : gRes.data?.groomers || [];
      const boardings = Array.isArray(bRes.data) ? bRes.data : bRes.data?.boardings || [];

      const combined = [
        ...vendors.map(v => ({ ...v, role: v.role || 'breeder' })),
        ...doctors.map(d => ({ ...d, role: d.role || 'vet clinic' })),
        ...trainers.map(t => ({ ...t, role: t.role || 'trainer' })),
        ...groomers.map(g => ({ ...g, role: g.role || 'grooming shop' })),
        ...boardings.map(b => ({ ...b, role: b.role || 'boarding shop' }))
      ];

      setVendors(combined);
    } catch (err) {
      console.error('AdminVendors fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    let result = vendors;
    if (typeFilter !== 'all') {
      result = result.filter((v) => detectType(v) === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          (v.username || v.name || v.fullName || '').toLowerCase().includes(q) ||
          (v.email || '').toLowerCase().includes(q) ||
          (v.vendorShopName || v.shopName || v.clinicName || '').toLowerCase().includes(q) ||
          (v.role || '').toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, typeFilter, vendors]);

  const getInitials = (v) => {
    const name = v.username || v.name || v.fullName || '?';
    return name.slice(0, 2).toUpperCase();
  };

  const getEndpointBase = (type) => {
    if (type === 'breeder' || type === 'vendor') return '/adminvendors';
    if (type === 'boarding') return '/adminvendors/petboardings';
    if (type === 'grooming') return '/adminvendors/petgroomers';
    if (type === 'vet') return '/adminvendors/doctors';
    if (type === 'trainer') return '/adminvendors/pettrainers';
    return '/adminvendors';
  };

  const handleApprove = (id, type) => {
    Alert.alert('Confirm', 'Approve this account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
          try {
            await axiosInstance.patch(`${getEndpointBase(type)}/approve/${id}`);
            fetchVendors(true);
            setModalVisible(false);
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to approve.');
          }
      }}
    ]);
  };

  const handleReject = (id, type) => {
    Alert.alert('Confirm', 'Reject this account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', onPress: async () => {
          try {
            await axiosInstance.patch(`${getEndpointBase(type)}/reject/${id}`);
            fetchVendors(true);
            setModalVisible(false);
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to reject.');
          }
      }}
    ]);
  };

  const handleDelete = (id, type) => {
    Alert.alert('Confirm Delete', 'Delete this account? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axiosInstance.delete(`${getEndpointBase(type)}/${id}`);
            fetchVendors(true);
            setModalVisible(false);
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete.');
          }
      }}
    ]);
  };

  const handleToggleBlock = (id, isBlocked) => {
    const action = isBlocked ? "Unblock" : "Block";
    Alert.alert('Confirm', `${action} this account?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: isBlocked ? 'default' : 'destructive', onPress: async () => {
          try {
            await axiosInstance.patch(`/adminvendors/toggle-block/${id}`);
            fetchVendors(true);
            setModalVisible(false);
          } catch (e) {
            console.error(e);
            Alert.alert('Error', `Failed to ${action.toLowerCase()}.`);
          }
      }}
    ]);
  };

  const openDetail = (vendor) => {
    setSelectedVendor(vendor);
    setModalVisible(false);
    setTimeout(() => setModalVisible(true), 50);
  };

  const approvalColor = (v) => {
    if (v.verificationStatus === 'approved' || v.isApproved === true || v.approved === true) return '#16a34a';
    if (v.verificationStatus === 'rejected' || v.isApproved === false || v.approved === false) return '#dc2626';
    return '#d97706';
  };

  const approvalLabel = (v) => {
    if (v.verificationStatus === 'approved' || v.isApproved === true || v.approved === true) return 'Approved';
    if (v.verificationStatus === 'rejected' || v.isApproved === false || v.approved === false) return 'Rejected';
    return 'Pending';
  };

  const renderVendor = ({ item, index }) => {
    const type = detectType(item);
    const color = TYPE_COLORS[type] || TYPE_COLORS.unknown;
    const aColor = approvalColor(item);
    const aLabel = approvalLabel(item);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.82}
        onPress={() => openDetail(item)}
        testID={`vendor-card-${index}`}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{getInitials(item)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>
            {item.username || item.name || item.fullName || 'Unnamed Vendor'}
          </Text>
          <Text style={styles.cardShop}>
            {item.vendorShopName || item.shopName || item.clinicName || '—'}
          </Text>
          <View style={styles.roleChipRow}>
            <View style={[styles.roleChip, { backgroundColor: color + '20' }]}>
              <Text style={[styles.roleChipText, { color }]}>
                {item.role || item.vendorType || type}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.approvalBadge, { backgroundColor: aColor + '18' }]}>
          <Text style={[styles.approvalText, { color: aColor }]}>{aLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading Vendors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendors, shops, roles…"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {/* Type filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeTabsScroll}
        contentContainerStyle={styles.typeTabsContent}>
        {VENDOR_TYPES.map((t) => {
          const isActive = typeFilter === t.id;
          const color = TYPE_COLORS[t.id] || '#7c3aed';
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeTab,
                isActive ? { backgroundColor: color, borderColor: color } : null,
              ]}
              onPress={() => setTypeFilter(t.id)}>
              <Feather
                name={t.icon}
                size={13}
                color={isActive ? '#fff' : '#64748b'}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.typeTabLabel, isActive ? styles.typeTabLabelActive : null]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Vendor List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item._id || item.id || i)}
        renderItem={renderVendor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchVendors(true)}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="briefcase" size={48} color="#c4b5fd" />
            <Text style={styles.emptyTitle}>No Vendors Found</Text>
            <Text style={styles.emptyText}>
              {search || typeFilter !== 'all'
                ? 'No vendors match your current filter.'
                : 'No vendor records are available yet.'}
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {selectedVendor &&
              (() => {
                const type = detectType(selectedVendor);
                const color = TYPE_COLORS[type] || '#7c3aed';
                return (
                  <>
                    <View style={styles.modalHeader}>
                      <View style={[styles.avatarLg, { backgroundColor: color }]}>
                        <Text style={styles.avatarTextLg}>{getInitials(selectedVendor)}</Text>
                      </View>
                      <View>
                        <View style={[styles.typeChip, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.typeChipText, { color }]}>
                            {selectedVendor.role || type}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setModalVisible(false)}>
                        <Feather name="x" size={20} color="#64748b" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.modalName}>
                        {selectedVendor.username ||
                          selectedVendor.name ||
                          selectedVendor.fullName ||
                          'Vendor'}
                      </Text>
                      {selectedVendor.vendorShopName ||
                      selectedVendor.shopName ||
                      selectedVendor.clinicName ? (
                        <Text style={styles.modalShop}>
                          {selectedVendor.vendorShopName ||
                            selectedVendor.shopName ||
                            selectedVendor.clinicName}
                        </Text>
                      ) : null}

                      {/* Approval status */}
                      <View
                        style={[
                          styles.approvalRow,
                          {
                            borderColor: approvalColor(selectedVendor) + '40',
                            backgroundColor: approvalColor(selectedVendor) + '10',
                          },
                        ]}>
                        <Feather name="shield" size={15} color={approvalColor(selectedVendor)} />
                        <Text
                          style={[
                            styles.approvalRowText,
                            { color: approvalColor(selectedVendor) },
                          ]}>
                          {approvalLabel(selectedVendor)}
                        </Text>
                      </View>

                      {[
                        { icon: 'mail', label: 'Email', value: selectedVendor.email },
                        {
                          icon: 'phone',
                          label: 'Phone',
                          value: selectedVendor.phoneNumber || selectedVendor.phone,
                        },
                        {
                          icon: 'map-pin',
                          label: 'City / Location',
                          value: selectedVendor.city || selectedVendor.location,
                        },
                        {
                          icon: 'credit-card',
                          label: 'License No.',
                          value: selectedVendor.licenseNumber || selectedVendor.license,
                        },
                        {
                          icon: 'clock',
                          label: 'Business Hours',
                          value: selectedVendor.businessHours || selectedVendor.workingHours,
                        },
                        {
                          icon: 'calendar',
                          label: 'Joined',
                          value: selectedVendor.createdAt
                            ? new Date(selectedVendor.createdAt).toDateString()
                            : null,
                        },
                        {
                          icon: 'hash',
                          label: 'ID',
                          value: selectedVendor._id || selectedVendor.id,
                        },
                      ].map(({ icon, label, value }) =>
                        value ? (
                          <View key={label} style={styles.modalRow}>
                            <View style={styles.modalIconWrap}>
                              <Feather name={icon} size={15} color="#7c3aed" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.modalLabel}>{label}</Text>
                              <Text style={styles.modalValue}>{String(value)}</Text>
                            </View>
                          </View>
                        ) : null
                      )}

                      <View style={styles.actionButtonsContainer}>
                        {(selectedVendor.verificationStatus !== 'approved' && selectedVendor.isApproved !== true && selectedVendor.approved !== true) && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#10b981', shadowColor: '#10b981' }]} 
                            activeOpacity={0.8}
                            onPress={() => handleApprove(selectedVendor._id || selectedVendor.id, type)}
                          >
                            <Feather name="check-circle" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Approve</Text>
                          </TouchableOpacity>
                        )}
                        {(selectedVendor.verificationStatus !== 'rejected' && selectedVendor.isApproved !== false && selectedVendor.approved !== false) && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: '#f59e0b', shadowColor: '#f59e0b' }]} 
                            activeOpacity={0.8}
                            onPress={() => handleReject(selectedVendor._id || selectedVendor.id, type)}
                          >
                            <Feather name="x-circle" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Reject</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: selectedVendor.isBlocked ? '#10b981' : '#8b5cf6', shadowColor: selectedVendor.isBlocked ? '#10b981' : '#8b5cf6' }]} 
                          activeOpacity={0.8}
                          onPress={() => handleToggleBlock(selectedVendor._id || selectedVendor.id, selectedVendor.isBlocked)}
                        >
                          <Feather name={selectedVendor.isBlocked ? "unlock" : "lock"} size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>{selectedVendor.isBlocked ? "Unblock" : "Block"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: '#ef4444', shadowColor: '#ef4444' }]} 
                          activeOpacity={0.8}
                          onPress={() => handleDelete(selectedVendor._id || selectedVendor.id, type)}
                        >
                          <Feather name="trash-2" size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </>
                );
              })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b', fontWeight: '500' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  countBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  typeTabsScroll: { marginBottom: 12 },
  typeTabsContent: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  typeTabLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  typeTabLabelActive: { color: '#ffffff' },

  list: { gap: 10, paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1e1b4b' },
  cardShop: { fontSize: 12, color: '#64748b', marginTop: 2 },
  roleChipRow: { marginTop: 5 },
  roleChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  roleChipText: { fontSize: 10, fontWeight: '700' },
  approvalBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  approvalText: { fontSize: 11, fontWeight: '700' },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  avatarLg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLg: { color: '#fff', fontWeight: '800', fontSize: 20 },
  typeChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  typeChipText: { fontSize: 11, fontWeight: '700' },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  modalName: { fontSize: 20, fontWeight: '800', color: '#1e1b4b', marginBottom: 4 },
  modalShop: { fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 14 },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  approvalRowText: { fontWeight: '700', fontSize: 13 },
  modalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  modalValue: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 1 },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 24,
    paddingBottom: 10,
    justifyContent: 'space-between'
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3
  }
});
