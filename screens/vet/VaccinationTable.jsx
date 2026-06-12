import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';

const PET_CATEGORIES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Others'];
const AVAILABILITY_OPTIONS = ['Available', 'Out of Stock'];

export default function VaccinationTable() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    petCategory: 'Dog',
    validationMonths: '',
    price: '',
    description: '',
    availabilityStatus: 'Available',
  });

  // Dropdown controls for Modal Form
  const [activeDropdown, setActiveDropdown] = useState(null); // 'petCategory' | 'availabilityStatus'

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/vet/vaccinations');
      // If server returns an array, use it; otherwise fallback
      const data = res.data?.data || res.data || [];
      setVaccinations(data);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      Alert.alert('Error', 'Failed to load vaccinations database.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      petCategory: 'Dog',
      validationMonths: '',
      price: '',
      description: '',
      availabilityStatus: 'Available',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || '',
      petCategory: item.petCategory || 'Dog',
      validationMonths: item.validationMonths?.toString() || '',
      price: item.price?.toString() || '',
      description: item.description || '',
      availabilityStatus: item.availabilityStatus || 'Available',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this vaccine entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/vet/vaccinations/${id}`);
              Alert.alert('Success', 'Vaccine entry deleted successfully.');
              fetchVaccinations();
            } catch (error) {
              console.error('Error deleting vaccine:', error);
              Alert.alert('Error', 'Failed to delete vaccine entry.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.petCategory || !formData.price) {
      Alert.alert('Validation Error', 'Vaccine Name, Pet Category, and Price are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        petCategory: formData.petCategory,
        validationMonths: formData.validationMonths ? parseInt(formData.validationMonths) : 12,
        price: parseFloat(formData.price),
        description: formData.description,
        availabilityStatus: formData.availabilityStatus,
        category: 'Vaccination', // ensure backend category matches
      };

      if (editingId) {
        await axios.put(`/vet/vaccinations/${editingId}`, payload);
        Alert.alert('Success', 'Vaccine entry updated successfully.');
      } else {
        await axios.post('/vet/vaccinations', payload);
        Alert.alert('Success', 'New vaccine entry added successfully.');
      }

      setShowModal(false);
      fetchVaccinations();
    } catch (error) {
      console.error('Error saving vaccine entry:', error);
      const msg = error.response?.data?.message || 'Failed to save vaccine details.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading vaccinations database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info Banner */}
      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Vaccination Records</Text>
            <Text style={styles.heroSubtitle}>
              Configure vaccines, rates, and schedule validity
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Feather name="plus" size={18} color="#6366f1" />
            <Text style={styles.addBtnText}>Add Vaccine</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Vaccine Records List Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {/* Header row */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.colHeader, styles.colSno]}>S.No</Text>
              <Text style={[styles.colHeader, styles.colPetCategory]}>Pet Type</Text>
              <Text style={[styles.colHeader, styles.colName]}>Vaccine Name</Text>
              <Text style={[styles.colHeader, styles.colValidity]}>Validity</Text>
              <Text style={[styles.colHeader, styles.colPrice]}>Rate</Text>
              <Text style={[styles.colHeader, styles.colStatus]}>Status</Text>
              <Text style={[styles.colHeader, styles.colActions]}>Actions</Text>
            </View>

            {/* Records rows */}
            {vaccinations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="folder-open" size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>No vaccinations registered yet.</Text>
              </View>
            ) : (
              vaccinations.map((item, index) => (
                <View key={item._id} style={styles.tableRow}>
                  <Text style={[styles.colCell, styles.colSno]}>{index + 1}</Text>
                  <View style={[styles.colCell, styles.colPetCategory]}>
                    <View style={styles.petBadge}>
                      <Text style={styles.petBadgeText}>{item.petCategory || 'Dog'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.colCell, styles.colName, styles.boldCell]}>{item.name}</Text>
                  <Text style={[styles.colCell, styles.colValidity]}>
                    {item.validationMonths ? `${item.validationMonths} Months` : 'N/A'}
                  </Text>
                  <Text style={[styles.colCell, styles.colPrice, styles.priceText]}>
                    ₹{item.price?.toFixed(2)}
                  </Text>
                  <View style={[styles.colCell, styles.colStatus]}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.availabilityStatus === 'Out of Stock'
                          ? styles.statusInactive
                          : styles.statusActive,
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.availabilityStatus === 'Out of Stock'
                            ? styles.statusInactiveText
                            : styles.statusActiveText,
                        ]}>
                        {item.availabilityStatus || 'Available'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.colCell, styles.colActions, styles.actionsWrapper]}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleOpenEdit(item)}>
                      <Feather name="edit-2" size={14} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleDelete(item._id)}>
                      <Feather name="trash-2" size={14} color="#b91c1c" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Edit / Add Modal Form */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Vaccine Record' : 'Add Vaccine Record'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}>
              {/* Vaccine Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vaccine Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="e.g. DHPPi + L2 vaccine"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Pet Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pet Type *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'petCategory' ? null : 'petCategory')
                  }>
                  <Text style={formData.petCategory ? styles.dropdownText : styles.placeholderText}>
                    {formData.petCategory || 'Select Pet Type'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#6366f1" />
                </TouchableOpacity>

                {activeDropdown === 'petCategory' && (
                  <View style={styles.dropdownOptions}>
                    {PET_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, petCategory: cat }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Validation Months */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Validity / Validation Period (Months)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.validationMonths}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, validationMonths: text }))
                  }
                  placeholder="e.g. 12"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vaccine Rate / Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                  placeholder="e.g. 750"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>

              {/* Availability Status Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Availability Status *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(
                      activeDropdown === 'availabilityStatus' ? null : 'availabilityStatus'
                    )
                  }>
                  <Text style={styles.dropdownText}>{formData.availabilityStatus}</Text>
                  <Feather name="chevron-down" size={18} color="#6366f1" />
                </TouchableOpacity>

                {activeDropdown === 'availabilityStatus' && (
                  <View style={styles.dropdownOptions}>
                    {AVAILABILITY_OPTIONS.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, availabilityStatus: status }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes / Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                  placeholder="Add details, target weights, dose number..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionWrapper}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {editingId ? 'Update Record' : 'Add Record'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '750',
    marginLeft: 6,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableContainer: {
    minWidth: 620,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  colCell: {
    fontSize: 13,
    color: '#334155',
  },
  boldCell: {
    fontWeight: '700',
    color: '#1e293b',
  },
  colSno: { width: 45 },
  colPetCategory: { width: 90 },
  colName: { width: 160 },
  colValidity: { width: 90 },
  colPrice: { width: 80 },
  colStatus: { width: 100 },
  colActions: { width: 80 },
  petBadge: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  petBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
  },
  priceText: {
    fontWeight: '800',
    color: '#6366f1',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#065f46',
  },
  statusInactiveText: {
    color: '#991b1b',
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 6,
    marginRight: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '550',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalScroll: {
    paddingBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '550',
  },
  placeholderText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  dropdownOptions: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#334155',
  },
  modalActionWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelBtn: {
    width: '48%',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    width: '48%',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
