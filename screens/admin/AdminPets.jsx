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
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axiosInstance from '../../lib/axios';

const EMPTY_FORM = {
  petName: '',
  petType: '',
  petBreed: '',
  petAge: '',
  petGender: '',
  petColor: '',
  petWeight: '',
  description: '',
};

export default function AdminPets() {
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axiosInstance.get('/aboutpet/getAllAboutPet');
      const data = Array.isArray(res.data) ? res.data : res.data?.pets || res.data?.data || [];
      setPets(data);
      setFiltered(data);
    } catch (err) {
      console.error('AdminPets fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(pets);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        pets.filter(
          (p) =>
            (p.petName || '').toLowerCase().includes(q) ||
            (p.petType || '').toLowerCase().includes(q) ||
            (p.petBreed || '').toLowerCase().includes(q) ||
            (p.petColor || '').toLowerCase().includes(q)
        )
      );
    }
  }, [search, pets]);

  const handleCreate = async () => {
    if (!form.petName.trim() || !form.petType.trim()) {
      Alert.alert('Required', 'Pet Name and Pet Type are required.');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post('/aboutpet/createAbout', form);
      Alert.alert('Success', 'Pet listing created successfully!');
      setCreateVisible(false);
      setForm(EMPTY_FORM);
      fetchPets(true);
    } catch (err) {
      console.error('Create pet error:', err.message);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create pet listing.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (pet) => {
    setSelectedPet(pet);
    setDetailVisible(true);
  };

  const petTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('dog')) return 'heart';
    if (t.includes('cat')) return 'star';
    if (t.includes('bird')) return 'feather';
    if (t.includes('fish')) return 'droplet';
    return 'package';
  };

  const petTypeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('dog')) return '#7c3aed';
    if (t.includes('cat')) return '#d97706';
    if (t.includes('bird')) return '#0ea5e9';
    if (t.includes('fish')) return '#16a34a';
    return '#64748b';
  };

  const renderPet = ({ item, index }) => {
    const color = petTypeColor(item.petType);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.82}
        onPress={() => openDetail(item)}
        testID={`pet-card-${index}`}>
        <View style={[styles.petIcon, { backgroundColor: color + '18' }]}>
          <Feather name={petTypeIcon(item.petType)} size={22} color={color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{item.petName || 'Unnamed Pet'}</Text>
          <Text style={styles.cardSub}>
            {[item.petBreed, item.petType].filter(Boolean).join(' · ') || '—'}
          </Text>
          {item.petAge ? <Text style={styles.cardAge}>Age: {item.petAge}</Text> : null}
        </View>
        <View>
          {item.petGender ? (
            <View
              style={[
                styles.genderBadge,
                {
                  backgroundColor: item.petGender?.toLowerCase() === 'male' ? '#dbeafe' : '#fce7f3',
                },
              ]}>
              <Text
                style={[
                  styles.genderText,
                  { color: item.petGender?.toLowerCase() === 'male' ? '#1d4ed8' : '#be185d' },
                ]}>
                {item.petGender}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const FormField = ({ label, field, placeholder, multiline }) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline ? styles.formInputMulti : null]}
        placeholder={placeholder || label}
        placeholderTextColor="#94a3b8"
        value={form[field]}
        onChangeText={(v) => setForm((prev) => ({ ...prev, [field]: v }))}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading Pet Listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pets by name, breed, type…"
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreateVisible(true)}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.countLabel}>
        {filtered.length} pet{filtered.length !== 1 ? 's' : ''} found
      </Text>

      {/* Pet List */}
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item._id || item.id || i)}
        renderItem={renderPet}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPets(true)}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="package" size={48} color="#c4b5fd" />
            <Text style={styles.emptyTitle}>No Pet Listings</Text>
            <Text style={styles.emptyText}>
              {search
                ? 'No pets match your search.'
                : 'Tap the + button to add the first pet listing.'}
            </Text>
          </View>
        }
      />

      {/* Create Pet Modal */}
      <Modal
        visible={createVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Pet Listing</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setCreateVisible(false);
                  setForm(EMPTY_FORM);
                }}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}>
              <FormField label="Pet Name *" field="petName" placeholder="e.g. Buddy" />
              <FormField label="Pet Type *" field="petType" placeholder="e.g. Dog, Cat, Bird" />
              <FormField label="Breed" field="petBreed" placeholder="e.g. Labrador" />
              <FormField label="Age" field="petAge" placeholder="e.g. 2 years" />
              <FormField label="Gender" field="petGender" placeholder="e.g. Male, Female" />
              <FormField
                label="Color / Coat"
                field="petColor"
                placeholder="e.g. Golden, Black & White"
              />
              <FormField label="Weight" field="petWeight" placeholder="e.g. 12 kg" />
              <FormField
                label="Description"
                field="description"
                placeholder="Any additional details…"
                multiline
              />
            </ScrollView>
            <TouchableOpacity
              style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
              onPress={handleCreate}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="plus-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Create Pet Listing</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {selectedPet && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.petIconLg,
                      { backgroundColor: petTypeColor(selectedPet.petType) + '20' },
                    ]}>
                    <Feather
                      name={petTypeIcon(selectedPet.petType)}
                      size={30}
                      color={petTypeColor(selectedPet.petType)}
                    />
                  </View>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailVisible(false)}>
                    <Feather name="x" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalName}>{selectedPet.petName || 'Pet'}</Text>
                  {[
                    { icon: 'tag', label: 'Type', value: selectedPet.petType },
                    { icon: 'layers', label: 'Breed', value: selectedPet.petBreed },
                    { icon: 'clock', label: 'Age', value: selectedPet.petAge },
                    { icon: 'user', label: 'Gender', value: selectedPet.petGender },
                    { icon: 'droplet', label: 'Color / Coat', value: selectedPet.petColor },
                    { icon: 'activity', label: 'Weight', value: selectedPet.petWeight },
                    { icon: 'file-text', label: 'Description', value: selectedPet.description },
                    {
                      icon: 'calendar',
                      label: 'Created',
                      value: selectedPet.createdAt
                        ? new Date(selectedPet.createdAt).toDateString()
                        : null,
                    },
                    { icon: 'hash', label: 'ID', value: selectedPet._id || selectedPet.id },
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
                </ScrollView>
              </>
            )}
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

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 10 },

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
  petIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1e1b4b' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardAge: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  genderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  genderText: { fontSize: 11, fontWeight: '700' },

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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1e1b4b' },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petIconLg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalName: { fontSize: 20, fontWeight: '800', color: '#1e1b4b', marginBottom: 18 },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  modalLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },
  modalValue: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 1 },

  // Form
  formField: { marginBottom: 14 },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  formInputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
