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

const CATEGORIES = ['Dog', 'Cat', 'Others'];
const SERVICE_NAMES = [
  'Bath',
  'Haircut',
  'Nail Trim',
  'Ear Cleaning',
  'Teeth Cleaning',
  'Full Grooming',
  'Other',
  'Combined Package',
];
const WEIGHT_OPTIONS = [
  'All Sizes',
  'Small (0-10 kg)',
  'Medium (10-20 kg)',
  'Large (20-40 kg)',
  'Extra Large (40 kg+)',
];
const STATUS_OPTIONS = ['Active', 'Inactive'];

export default function GroomingCharges() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    serviceName: '',
    customServiceName: '',
    petWeight: 'All Sizes',
    price: '',
    timeRequired: '',
    details: '',
    status: 'Active',
  });

  // Dropdown controls for Modal Form
  const [activeDropdown, setActiveDropdown] = useState(null); // 'category' | 'serviceName' | 'petWeight' | 'status'

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/petgrooming/services');
      setServices(res.data || []);
    } catch (error) {
      console.error('Error fetching grooming services:', error);
      Alert.alert('Error', 'Failed to load grooming services list.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: '',
      serviceName: '',
      customServiceName: '',
      petWeight: 'All Sizes',
      price: '',
      timeRequired: '',
      details: '',
      status: 'Active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (service) => {
    setEditingId(service._id);
    const isPredefined = SERVICE_NAMES.includes(service.serviceName);
    setFormData({
      category: service.category || '',
      serviceName: isPredefined ? service.serviceName : 'Other',
      customServiceName: isPredefined ? '' : service.serviceName || '',
      petWeight: service.petWeight || 'All Sizes',
      price: service.price?.toString() || '',
      timeRequired: service.timeRequired || '',
      details: service.details || '',
      status: service.status || 'Active',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this grooming service charges entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/petgrooming/services/${id}`);
              Alert.alert('Success', 'Service charges deleted.');
              fetchServices();
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.serviceName || !formData.price) {
      Alert.alert('Validation Error', 'Category, Service Name, and Price are required.');
      return;
    }

    const finalServiceName =
      formData.serviceName === 'Other' || formData.serviceName === 'Combined Package'
        ? formData.customServiceName
        : formData.serviceName;

    if (!finalServiceName) {
      Alert.alert('Validation Error', 'Please enter a name for the custom service/package.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category: formData.category,
        serviceName: finalServiceName,
        petWeight: formData.petWeight,
        price: parseFloat(formData.price),
        timeRequired: formData.timeRequired,
        details: formData.details,
        status: formData.status,
      };

      if (editingId) {
        await axios.put(`/petgrooming/services/${editingId}`, payload);
        Alert.alert('Success', 'Service charges updated.');
      } else {
        await axios.post('/petgrooming/services', payload);
        Alert.alert('Success', 'New service charges added.');
      }

      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service charges:', error);
      const msg = error.response?.data?.message || 'Failed to save service charges.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading charges database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Overview */}
      <LinearGradient colors={['#7c3aed', '#2563eb']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Grooming Services</Text>
            <Text style={styles.heroSubtitle}>Manage your grooming price lists and packages</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Feather name="plus" size={18} color="#7c3aed" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Charges Table */}
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.colHeader, styles.colSno]}>S.No</Text>
              <Text style={[styles.colHeader, styles.colCategory]}>Category</Text>
              <Text style={[styles.colHeader, styles.colService]}>Service</Text>
              <Text style={[styles.colHeader, styles.colSize]}>Size/Weight</Text>
              <Text style={[styles.colHeader, styles.colDuration]}>Duration</Text>
              <Text style={[styles.colHeader, styles.colPrice]}>Price</Text>
              <Text style={[styles.colHeader, styles.colStatus]}>Status</Text>
              <Text style={[styles.colHeader, styles.colActions]}>Actions</Text>
            </View>

            {/* Table Body */}
            {services.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="folder-open" size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>No services registered.</Text>
              </View>
            ) : (
              services.map((item, index) => (
                <View key={item._id} style={styles.tableRow}>
                  <Text style={[styles.colCell, styles.colSno]}>{index + 1}</Text>
                  <View style={[styles.colCell, styles.colCategory]}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                  </View>
                  <Text style={[styles.colCell, styles.colService, styles.boldCell]}>
                    {item.serviceName}
                  </Text>
                  <Text style={[styles.colCell, styles.colSize]}>
                    {item.petWeight || 'All Sizes'}
                  </Text>
                  <Text style={[styles.colCell, styles.colDuration]}>
                    {item.timeRequired || '-'}
                  </Text>
                  <Text style={[styles.colCell, styles.colPrice, styles.priceText]}>
                    ₹{item.price?.toFixed(2)}
                  </Text>
                  <View style={[styles.colCell, styles.colStatus]}>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'Inactive' ? styles.statusInactive : styles.statusActive,
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          item.status === 'Inactive'
                            ? styles.statusInactiveText
                            : styles.statusActiveText,
                        ]}>
                        {item.status || 'Active'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.colCell, styles.colActions, styles.actionsWrapper]}>
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleOpenEdit(item)}>
                      <Feather name="edit-2" size={14} color="#7c3aed" />
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

      {/* Edit / Add Modal */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Grooming Service' : 'Add Grooming Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'category' ? null : 'category')
                  }>
                  <Text style={formData.category ? styles.dropdownText : styles.placeholderText}>
                    {formData.category || 'Select Category'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#7c3aed" />
                </TouchableOpacity>

                {activeDropdown === 'category' && (
                  <View style={styles.dropdownOptions}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, category: cat }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Service Name Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Name *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'serviceName' ? null : 'serviceName')
                  }>
                  <Text style={formData.serviceName ? styles.dropdownText : styles.placeholderText}>
                    {formData.serviceName || 'Select Service'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#7c3aed" />
                </TouchableOpacity>

                {activeDropdown === 'serviceName' && (
                  <View style={styles.dropdownOptions}>
                    {SERVICE_NAMES.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, serviceName: name }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Custom Service Name */}
              {(formData.serviceName === 'Other' ||
                formData.serviceName === 'Combined Package') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {formData.serviceName === 'Combined Package'
                      ? 'Package Name *'
                      : 'Custom Service Name *'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.customServiceName}
                    onChangeText={(text) => handleTextChange('customServiceName', text)}
                    placeholder="Enter custom service name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              )}

              {/* Pet Weight Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pet Size / Weight *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'petWeight' ? null : 'petWeight')
                  }>
                  <Text style={styles.dropdownText}>{formData.petWeight}</Text>
                  <Feather name="chevron-down" size={18} color="#7c3aed" />
                </TouchableOpacity>

                {activeDropdown === 'petWeight' && (
                  <View style={styles.dropdownOptions}>
                    {WEIGHT_OPTIONS.map((w) => (
                      <TouchableOpacity
                        key={w}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, petWeight: w }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{w}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => handleTextChange('price', text)}
                  placeholder="e.g. 500"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>

              {/* Duration / Time Required */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration / Time Required</Text>
                <TextInput
                  style={styles.input}
                  value={formData.timeRequired}
                  onChangeText={(text) => handleTextChange('timeRequired', text)}
                  placeholder="e.g. 45 mins"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Status Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}>
                  <Text style={styles.dropdownText}>{formData.status}</Text>
                  <Feather name="chevron-down" size={18} color="#7c3aed" />
                </TouchableOpacity>

                {activeDropdown === 'status' && (
                  <View style={styles.dropdownOptions}>
                    {STATUS_OPTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, status: s }));
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Details */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Details / Inclusions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.details}
                  onChangeText={(text) => handleTextChange('details', text)}
                  placeholder="Add details about what is included in this service..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Buttons inside Modal */}
              <View style={styles.modalActionWrapper}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {editingId ? 'Update Service' : 'Add Service'}
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

  function handleTextChange(key, val) {
    setFormData((prev) => ({ ...prev, [key]: val }));
  }
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
    color: '#7c3aed',
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
  },
  tableContainer: {
    minWidth: 700,
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
  colCategory: { width: 90 },
  colService: { width: 150 },
  colSize: { width: 120 },
  colDuration: { width: 90 },
  colPrice: { width: 80 },
  colStatus: { width: 85 },
  colActions: { width: 80 },
  categoryBadge: {
    backgroundColor: '#f3e8ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  priceText: {
    fontWeight: '800',
    color: '#7c3aed',
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
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#065f46',
  },
  statusInactiveText: {
    color: '#64748b',
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
  inputGroup: {
    marginBottom: 16,
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
    backgroundColor: '#7c3aed',
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
