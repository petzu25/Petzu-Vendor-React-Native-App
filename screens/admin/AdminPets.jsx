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
import theme from '../../constants/theme';

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
      const res = await axiosInstance.get('/adminallpets');
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (res.data?.salePets && Array.isArray(res.data.salePets)) data = res.data.salePets;
      else if (res.data?.pets && Array.isArray(res.data.pets)) data = res.data.pets;
      else if (res.data?.data && Array.isArray(res.data.data)) data = res.data.data;
      else if (res.data?.data?.pets && Array.isArray(res.data.data.pets)) data = res.data.data.pets;
      else if (res.data?.data?.data && Array.isArray(res.data.data.data)) data = res.data.data.data;
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
    if (t.includes('dog')) return theme.COLORS.primary;
    if (t.includes('cat')) return '#d97706';
    if (t.includes('bird')) return '#0ea5e9';
    if (t.includes('fish')) return theme.COLORS.success;
    return theme.COLORS.textSecondary;
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
            <Feather name="package" size={48} color={theme.COLORS.primaryLight} />
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
                <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
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
                    <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
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
                          <Feather name={icon} size={15} color={theme.COLORS.primary} />
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
  container: { flex: 1, backgroundColor: theme.COLORS.canvas },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: theme.COLORS.canvas },
  loadingText: { ...theme.TEXT.bodySecondary },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, paddingHorizontal: theme.SIZES.md, paddingTop: theme.SIZES.md },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.sm,
    height: theme.SIZES.inputHeight,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, ...theme.TEXT.body },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countLabel: { fontSize: 12, color: theme.COLORS.textSecondary, fontWeight: theme.FONTS.semiBold, marginBottom: 10, paddingHorizontal: theme.SIZES.md },

  list: { gap: 12, paddingBottom: 30, paddingHorizontal: theme.SIZES.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.md,
    ...theme.SHADOWS.md,
  },
  petIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardName: { ...theme.TEXT.body, fontWeight: theme.FONTS.bold },
  cardSub: { ...theme.TEXT.label, color: theme.COLORS.textSecondary, marginTop: 2 },
  cardAge: { fontSize: 11, color: theme.COLORS.textSecondary, marginTop: 2 },
  genderBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.RADIUS.sm },
  genderText: { fontSize: 11, fontWeight: theme.FONTS.bold },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { ...theme.TEXT.h3 },
  emptyText: { ...theme.TEXT.bodySecondary, textAlign: 'center' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    padding: theme.SIZES.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.SIZES.md,
  },
  modalTitle: { ...theme.TEXT.h2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petIconLg: {
    width: 64,
    height: 64,
    borderRadius: theme.RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalName: { ...theme.TEXT.h2, marginBottom: 18 },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.SIZES.md },
  modalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: theme.RADIUS.sm,
    backgroundColor: theme.COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  modalLabel: { ...theme.TEXT.label },
  modalValue: { ...theme.TEXT.body, fontWeight: theme.FONTS.semiBold, marginTop: 1 },

  // Form
  formField: { marginBottom: theme.SIZES.md },
  formLabel: {
    ...theme.TEXT.label,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  formInputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
    paddingVertical: 14,
    marginTop: theme.SIZES.md,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold, fontSize: 15 },
});
