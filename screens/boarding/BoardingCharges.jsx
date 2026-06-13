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
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';
import theme from '../../constants/theme';

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
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Boarding Charges</Text>
            <Text style={styles.heroSubtitle}>Manage your cage packages & daily pricing</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
            <Feather name="plus" size={16} color={theme.COLORS.primary} />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

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
                <View style={styles.saveBtnGradient}>
                  {saving ? (
                    <ActivityIndicator size="small" color={theme.COLORS.surface} />
                  ) : (
                    <Text style={styles.saveBtnText}>
                      {editingId ? 'Update Package' : 'Create Package'}
                    </Text>
                  )}
                </View>
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
    backgroundColor: theme.COLORS.canvas,
  },
  heroCard: {
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.xxl,
    overflow: 'hidden',
    marginBottom: theme.SIZES.lg,
    ...theme.SHADOWS.md,
  },
  heroContent: {
    padding: theme.SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    ...theme.TEXT.h2,
    color: theme.COLORS.surface,
  },
  heroSubtitle: {
    ...theme.TEXT.bodySecondary,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: theme.COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...theme.SHADOWS.sm,
  },
  addBtnText: {
    color: theme.COLORS.primary,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.bodySecondary.fontSize,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SIZES.lg,
  },
  loadingText: {
    marginTop: theme.SIZES.sm,
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.md,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    ...theme.TEXT.h3,
  },
  cardSubtitle: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    marginTop: 2,
  },
  priceBadge: {
    alignItems: 'flex-end',
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.RADIUS.md,
  },
  priceText: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
    color: theme.COLORS.primary,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: theme.FONTS.bold,
    color: theme.COLORS.textSecondary,
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
    borderRadius: theme.RADIUS.sm,
    borderWidth: 1,
  },
  badgeAC: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  badgeNonAC: {
    backgroundColor: theme.COLORS.canvas,
    borderColor: theme.COLORS.border,
  },
  badgeFood: {
    backgroundColor: theme.COLORS.success + '20',
    borderColor: theme.COLORS.success + '40',
  },
  badgeNoFood: {
    backgroundColor: theme.COLORS.canvas,
    borderColor: theme.COLORS.border,
  },
  badgeTagText: {
    fontSize: 10,
    fontWeight: theme.FONTS.bold,
  },
  detailsText: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    lineHeight: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.COLORS.borderLight,
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
    borderRadius: theme.RADIUS.sm,
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: theme.COLORS.success + '20',
    borderColor: theme.COLORS.success + '40',
  },
  editBtnText: {
    color: theme.COLORS.success,
    fontSize: theme.TEXT.label.fontSize,
    fontWeight: theme.FONTS.bold,
  },
  deleteBtn: {
    backgroundColor: theme.COLORS.error + '20',
    borderColor: theme.COLORS.error + '40',
  },
  deleteBtnText: {
    color: theme.COLORS.error,
    fontSize: theme.TEXT.label.fontSize,
    fontWeight: theme.FONTS.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xxl,
    minHeight: 250,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...theme.TEXT.h3,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...theme.TEXT.bodySecondary,
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
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    height: '85%',
    paddingTop: 20,
    ...theme.SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  modalTitle: {
    ...theme.TEXT.h3,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  label: {
    ...theme.TEXT.label,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: theme.SIZES.md,
  },
  input: {
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: theme.SIZES.sm,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
  },
  dropdownTriggerText: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.semiBold,
  },
  dropdownOptions: {
    marginTop: 4,
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  dropdownOptionText: {
    ...theme.TEXT.body,
  },
  saveBtn: {
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
    marginTop: 10,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
  },
  saveBtnText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
});
