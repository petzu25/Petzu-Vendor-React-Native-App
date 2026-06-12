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

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchClients = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axiosInstance.get('/vendors/get-all-clients');
      const data = Array.isArray(res.data) ? res.data : res.data?.clients || res.data?.data || [];
      setClients(data);
      setFiltered(data);
    } catch (err) {
      console.error('AdminClients fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(clients);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        clients.filter(
          (c) =>
            (c.username || c.name || c.fullName || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phoneNumber || c.phone || '').toLowerCase().includes(q)
        )
      );
    }
  }, [search, clients]);

  const openDetail = (client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  const getInitials = (client) => {
    const name = client.username || client.name || client.fullName || '?';
    return name.slice(0, 2).toUpperCase();
  };

  const avatarColors = ['#7c3aed', '#0ea5e9', '#d97706', '#16a34a', '#dc2626', '#db2777'];
  const getColor = (client) => {
    const name = client.username || client.name || '';
    return avatarColors[name.charCodeAt(0) % avatarColors.length] || '#7c3aed';
  };

  const renderClient = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => openDetail(item)}
      testID={`client-card-${index}`}>
      <View style={[styles.avatar, { backgroundColor: getColor(item) }]}>
        <Text style={styles.avatarText}>{getInitials(item)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>
          {item.username || item.name || item.fullName || 'Unnamed Client'}
        </Text>
        <Text style={styles.cardSub}>{item.email || '—'}</Text>
        {item.phoneNumber || item.phone ? (
          <Text style={styles.cardPhone}>{item.phoneNumber || item.phone}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.statusBadge,
          item.isActive !== false ? styles.badgeActive : styles.badgeInactive,
        ]}>
        <Text
          style={[
            styles.statusText,
            item.isActive !== false ? styles.statusTextActive : styles.statusTextInactive,
          ]}>
          {item.isActive !== false ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading Clients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email or phone…"
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item._id || item.id || i)}
        renderItem={renderClient}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchClients(true)}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="users" size={48} color="#c4b5fd" />
            <Text style={styles.emptyTitle}>No Clients Found</Text>
            <Text style={styles.emptyText}>
              {search ? 'Try a different search term.' : 'No client records are available yet.'}
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
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.avatarLg,
                  { backgroundColor: selectedClient ? getColor(selectedClient) : '#7c3aed' },
                ]}>
                <Text style={styles.avatarTextLg}>
                  {selectedClient ? getInitials(selectedClient) : ''}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalName}>
                {selectedClient?.username ||
                  selectedClient?.name ||
                  selectedClient?.fullName ||
                  'Client'}
              </Text>
              {[
                { icon: 'mail', label: 'Email', value: selectedClient?.email },
                {
                  icon: 'phone',
                  label: 'Phone',
                  value: selectedClient?.phoneNumber || selectedClient?.phone,
                },
                {
                  icon: 'map-pin',
                  label: 'City',
                  value: selectedClient?.city || selectedClient?.location,
                },
                {
                  icon: 'calendar',
                  label: 'Joined',
                  value: selectedClient?.createdAt
                    ? new Date(selectedClient.createdAt).toDateString()
                    : null,
                },
                { icon: 'hash', label: 'ID', value: selectedClient?._id || selectedClient?.id },
              ].map(({ icon, label, value }) =>
                value ? (
                  <View key={label} style={styles.modalRow}>
                    <View style={styles.modalIconWrap}>
                      <Feather name={icon} size={15} color="#7c3aed" />
                    </View>
                    <View>
                      <Text style={styles.modalLabel}>{label}</Text>
                      <Text style={styles.modalValue}>{value}</Text>
                    </View>
                  </View>
                ) : null
              )}
            </ScrollView>
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

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
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
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardPhone: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeInactive: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#16a34a' },
  statusTextInactive: { color: '#dc2626' },

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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLg: { color: '#fff', fontWeight: '800', fontSize: 22 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalName: { fontSize: 20, fontWeight: '800', color: '#1e1b4b', marginBottom: 18 },
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
});
