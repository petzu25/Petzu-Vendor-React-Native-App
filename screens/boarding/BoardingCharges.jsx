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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';

const CATEGORIES = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Others'];
const AC_OPTIONS = ['AC', 'Non-AC'];
const FOOD_OPTIONS = ['With food', 'Without food'];

export default function BoardingCharges() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Dog',
    petWeight: '',
    price: '',
    foodType: 'Without food',
    foodDetails: '',
    acType: 'Non-AC',
    details: '',
  });

  // Dropdown states for form modal
  const [activeDropdown, setActiveDropdown] = useState(null); // 'category' | 'acType' | 'foodType'

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/petboarding/entries');
      setEntries(res.data || []);
    } catch (error) {
      console.error('Error fetching boarding entries:', error);
      Alert.alert('Error', 'Failed to load boarding charges database.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: 'Dog',
      petWeight: '',
      price: '',
      foodType: 'Without food',
      foodDetails: '',
      acType: 'Non-AC',
      details: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      category: entry.category || 'Dog',
      petWeight: entry.petWeight || entry.petType || '',
      price: entry.price?.toString() || '',
      foodType: entry.foodType || 'Without food',
      foodDetails: entry.foodDetails || '',
      acType: entry.acType || 'Non-AC',
      details: entry.details || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this boarding charges entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`/petboarding/entries/${id}`);
              Alert.alert('Success', 'Boarding package deleted successfully.');
              fetchEntries();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.petWeight || !formData.price) {
      Alert.alert('Validation Error', 'Category, Weight/Size, and Price are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category: formData.category,
        petWeight: formData.petWeight,
        petType: formData.petWeight, // match backend fallback key
        price: parseFloat(formData.price),
        foodType: formData.foodType,
        foodDetails: formData.foodDetails,
        acType: formData.acType,
        details: formData.details,
      };

      if (editingId) {
        await axios.put(`/petboarding/entries/${editingId}`, payload);
        Alert.alert('Success', 'Boarding package updated successfully.');
      } else {
        await axios.post('/petboarding/entries', payload);
        Alert.alert('Success', 'New boarding package added.');
      }

      setShowModal(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving boarding entry:', error);
      const msg = error.response?.data?.message || 'Failed to save boarding package.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const renderEntryItem = ({ item }) => {
    const isAC = item.acType === 'AC';
    const hasFood = item.foodType === 'With food' || item.foodType === 'Yes';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{item.category}</Text>
            <Text style={styles.cardSubtitle}>
              Weight/Size: {item.petWeight || item.petType || 'All sizes'}
            </Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{item.price?.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>/ Day</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.tagsContainer}>
            <View style={[styles.badgeTag, isAC ? styles.badgeAC : styles.badgeNonAC]}>
              <Feather name="wind" size={10} color={isAC ? '#0369a1' : '#475569'} />
              <Text style={[styles.badgeTagText, { color: isAC ? '#0369a1' : '#475569' }]}>
                {item.acType || 'Non-AC'}
              </Text>
            </View>
            <View style={[styles.badgeTag, hasFood ? styles.badgeFood : styles.badgeNoFood]}>
              <Feather name="coffee" size={10} color={hasFood ? '#047857' : '#475569'} />
              <Text style={[styles.badgeTagText, { color: hasFood ? '#047857' : '#475569' }]}>
                {item.foodType || 'Without food'}
              </Text>
            </View>
          </View>

          {item.foodDetails ? (
            <Text style={styles.detailsText} numberOfLines={1}>
              Food: {item.foodDetails}
            </Text>
          ) : null}

          {item.details ? (
            <Text style={styles.detailsText} numberOfLines={2}>
              {item.details}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => handleOpenEdit(item)}>
            <Feather name="edit" size={14} color="#059669" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item._id)}>
            <Feather name="trash-2" size={14} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8d6e63', '#5d4037']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Boarding Charges</Text>
            <Text style={styles.heroSubtitle}>Manage your cage packages & daily pricing</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Feather name="plus" size={16} color="#8d6e63" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8d6e63" />
          <Text style={styles.loadingText}>Fetching packages database...</Text>
        </View>
      ) : entries.length > 0 ? (
        <FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="package" size={32} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyTitle}>No Packages Configured</Text>
          <Text style={styles.emptySubtitle}>
            Create your first boarding service package to define cages, sizes, and pricing per day.
          </Text>
        </View>
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Boarding Package' : 'New Boarding Package'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowModal(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pet Category *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'category' ? null : 'category')
                  }>
                  <Text style={styles.dropdownTriggerText}>{formData.category}</Text>
                  <Feather
                    name={activeDropdown === 'category' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748b"
                  />
                </TouchableOpacity>

                {activeDropdown === 'category' && (
                  <View style={styles.dropdownOptions}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({ ...formData, category: cat });
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Weight/Size input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight / Size Description *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.petWeight}
                  onChangeText={(text) => setFormData({ ...formData, petWeight: text })}
                  placeholder="e.g. 0-5 kg, Medium size, Cage large"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price per Day (INR) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="e.g. 500"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>

              {/* AC Type Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>AC Status *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setActiveDropdown(activeDropdown === 'acType' ? null : 'acType')}>
                  <Text style={styles.dropdownTriggerText}>{formData.acType}</Text>
                  <Feather
                    name={activeDropdown === 'acType' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748b"
                  />
                </TouchableOpacity>

                {activeDropdown === 'acType' && (
                  <View style={styles.dropdownOptions}>
                    {AC_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({ ...formData, acType: opt });
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Food Option Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Food Details Status *</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setActiveDropdown(activeDropdown === 'foodType' ? null : 'foodType')
                  }>
                  <Text style={styles.dropdownTriggerText}>{formData.foodType}</Text>
                  <Feather
                    name={activeDropdown === 'foodType' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#64748b"
                  />
                </TouchableOpacity>

                {activeDropdown === 'foodType' && (
                  <View style={styles.dropdownOptions}>
                    {FOOD_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFormData({ ...formData, foodType: opt });
                          setActiveDropdown(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Food Details input */}
              {formData.foodType === 'With food' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Food Specification / Details</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.foodDetails}
                    onChangeText={(text) => setFormData({ ...formData, foodDetails: text })}
                    placeholder="e.g. Royal Canin Starter twice daily"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              )}

              {/* Additional Details */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Additional Details / Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.details}
                  onChangeText={(text) => setFormData({ ...formData, details: text })}
                  placeholder="e.g. Toy breeds, clean cages, camera feed support"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Submit button */}
              <TouchableOpacity onPress={handleSubmit} disabled={saving} style={styles.saveBtn}>
                <LinearGradient
                  colors={['#8d6e63', '#5d4037']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtnGradient}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>
                      {editingId ? 'Update Package' : 'Create Package'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
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
    backgroundColor: '#f8fafc',
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  addBtnText: {
    color: '#8d6e63',
    fontWeight: '800',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  priceBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#fdfbf7',
    borderWidth: 1,
    borderColor: '#eedec7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#8d6e63',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  cardBody: {
    marginVertical: 12,
    gap: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  badgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeAC: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  badgeNonAC: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  badgeFood: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeNoFood: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: '750',
  },
  detailsText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  editBtn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  editBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    minHeight: 250,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Form modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  dropdownOptions: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  dropdownOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
