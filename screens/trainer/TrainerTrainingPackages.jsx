import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import theme from '../../constants/theme';

const INITIAL_PACKAGES = [
  {
    id: '1',
    name: 'Basic Obedience',
    duration: '4 Weeks',
    sessions: '8 Sessions',
    price: '₹3,500',
    description: 'Sit, Stay, Come, Leash manners for new pet owners.',
    color: '#16a34a',
  },
  {
    id: '2',
    name: 'Advanced Training',
    duration: '8 Weeks',
    sessions: '16 Sessions',
    price: '₹6,500',
    description: 'Advanced commands, off-leash control, agility basics.',
    color: '#0ea5e9',
  },
  {
    id: '3',
    name: 'Puppy Socialisation',
    duration: '2 Weeks',
    sessions: '4 Sessions',
    price: '₹1,800',
    description: 'Ideal for puppies under 6 months. Socialization & bite inhibition.',
    color: '#d97706',
  },
];

const EMPTY_FORM = {
  name: '',
  duration: '',
  sessions: '',
  price: '',
  description: '',
};

const COLORS = ['#16a34a', '#0ea5e9', '#d97706', '#7c3aed', '#db2777', '#dc2626'];

export default function TrainerTrainingPackages() {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedColor(COLORS[0]);
    setModalVisible(true);
  };

  const openEdit = (pkg) => {
    setDetailVisible(false);
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      duration: pkg.duration,
      sessions: pkg.sessions,
      price: pkg.price,
      description: pkg.description,
    });
    setSelectedColor(pkg.color || COLORS[0]);
    setModalVisible(true);
  };

  const openDetail = (pkg) => {
    setSelectedPkg(pkg);
    setDetailVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Package', 'Are you sure you want to remove this training package?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPackages((prev) => prev.filter((p) => p.id !== id));
          setDetailVisible(false);
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Required', 'Package Name and Price are required.');
      return;
    }
    setSaving(true);
    // Simulate async save (replace with real API call when backend is ready)
    await new Promise((r) => setTimeout(r, 600));
    if (editingId) {
      setPackages((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...form, color: selectedColor } : p))
      );
    } else {
      setPackages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...form,
          color: selectedColor,
        },
      ]);
    }
    setSaving(false);
    setModalVisible(false);
    setForm(EMPTY_FORM);
  };

  const FormField = ({ label, field, placeholder, multiline, keyboard }) => (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline ? styles.formInputMulti : null]}
        placeholder={placeholder || label}
        placeholderTextColor={theme.COLORS.textSecondary}
        value={form[field]}
        onChangeText={(v) => setForm((prev) => ({ ...prev, [field]: v }))}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboard || 'default'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.topTitle}>Training Packages</Text>
          <Text style={styles.topSub}>
            {packages.length} package{packages.length !== 1 ? 's' : ''} listed
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={18} color={theme.COLORS.surface} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Package list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {packages.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="award" size={48} color={theme.COLORS.primary + '40'} />
            <Text style={styles.emptyTitle}>No Packages Yet</Text>
            <Text style={styles.emptyText}>
              Tap the + Add button to create your first training package.
            </Text>
          </View>
        ) : (
          packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.card}
              activeOpacity={0.82}
              onPress={() => openDetail(pkg)}>
              <View style={[styles.cardAccent, { backgroundColor: pkg.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{pkg.name}</Text>
                  <Text style={[styles.cardPrice, { color: pkg.color }]}>{pkg.price}</Text>
                </View>
                <View style={styles.cardMeta}>
                  {pkg.duration ? (
                    <View style={styles.metaChip}>
                      <Feather name="clock" size={11} color="#64748b" />
                      <Text style={styles.metaText}>{pkg.duration}</Text>
                    </View>
                  ) : null}
                  {pkg.sessions ? (
                    <View style={styles.metaChip}>
                      <Feather name="repeat" size={11} color="#64748b" />
                      <Text style={styles.metaText}>{pkg.sessions}</Text>
                    </View>
                  ) : null}
                </View>
                {pkg.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {pkg.description}
                  </Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={18} color={theme.COLORS.textTertiary} />
            </TouchableOpacity>
          ))
        )}

        {/* Tip box */}
        <View style={styles.tipBox}>
          <Feather name="zap" size={15} color={theme.COLORS.success} style={{ marginRight: 8 }} />
          <Text style={styles.tipText}>
            Keep your packages up to date to attract more clients. Include duration, sessions and a
            clear price.
          </Text>
        </View>
      </ScrollView>

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Package' : 'New Training Package'}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setModalVisible(false);
                  setForm(EMPTY_FORM);
                }}>
                <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}>
              <FormField label="Package Name *" field="name" placeholder="e.g. Basic Obedience" />
              <FormField label="Price *" field="price" placeholder="e.g. ₹3,500" />
              <FormField label="Duration" field="duration" placeholder="e.g. 4 Weeks" />
              <FormField label="Sessions" field="sessions" placeholder="e.g. 8 Sessions" />
              <FormField
                label="Description"
                field="description"
                placeholder="What's included in this package…"
                multiline
              />

              {/* Colour picker */}
              <Text style={styles.formLabel}>Accent Color</Text>
              <View style={styles.colorRow}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      selectedColor === c ? styles.colorDotSelected : null,
                    ]}
                    onPress={() => setSelectedColor(c)}>
                    {selectedColor === c && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                saving ? styles.saveBtnDisabled : null,
                { backgroundColor: selectedColor },
              ]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={theme.COLORS.surface} />
              ) : (
                <>
                  <Feather
                    name={editingId ? 'save' : 'plus-circle'}
                    size={18}
                    color={theme.COLORS.surface}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveBtnText}>
                    {editingId ? 'Save Changes' : 'Create Package'}
                  </Text>
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
            {selectedPkg && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.pkgIcon, { backgroundColor: selectedPkg.color + '20' }]}>
                    <Feather name="award" size={22} color={selectedPkg.color} />
                  </View>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailVisible(false)}>
                    <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[styles.detailName, { color: selectedPkg.color }]}>
                    {selectedPkg.name}
                  </Text>
                  <Text style={styles.detailPrice}>{selectedPkg.price}</Text>

                  {[
                    { icon: 'clock', label: 'Duration', value: selectedPkg.duration },
                    { icon: 'repeat', label: 'Sessions', value: selectedPkg.sessions },
                    { icon: 'file-text', label: 'Description', value: selectedPkg.description },
                  ].map(({ icon, label, value }) =>
                    value ? (
                      <View key={label} style={styles.detailRow}>
                        <View
                          style={[
                            styles.detailIcon,
                            { backgroundColor: selectedPkg.color + '18' },
                          ]}>
                          <Feather name={icon} size={14} color={selectedPkg.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>{label}</Text>
                          <Text style={styles.detailValue}>{value}</Text>
                        </View>
                      </View>
                    ) : null
                  )}
                </ScrollView>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: theme.COLORS.borderDark }]}
                    onPress={() => handleDelete(selectedPkg.id)}>
                    <Feather name="trash-2" size={16} color={theme.COLORS.error} />
                    <Text style={[styles.actionBtnText, { color: theme.COLORS.error }]}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: selectedPkg.color, borderColor: selectedPkg.color },
                    ]}
                    onPress={() => openEdit(selectedPkg)}>
                    <Feather name="edit-2" size={16} color={theme.COLORS.surface} />
                    <Text style={[styles.actionBtnText, { color: theme.COLORS.surface }]}>Edit Package</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.canvas, paddingHorizontal: theme.SIZES.md, paddingTop: theme.SIZES.md },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  topTitle: { ...theme.TEXT.h2 },
  topSub: { ...theme.TEXT.bodySecondary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold, fontSize: 13 },

  list: { gap: 12, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    overflow: 'hidden',
    ...theme.SHADOWS.sm,
  },
  cardAccent: { width: 5, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardName: { ...theme.TEXT.h3, flex: 1, marginRight: 8 },
  cardPrice: { ...theme.TEXT.body, fontWeight: theme.FONTS.black },
  cardMeta: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.COLORS.canvas,
    borderRadius: theme.RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaText: { ...theme.TEXT.label, color: theme.COLORS.textSecondary },
  cardDesc: { ...theme.TEXT.bodySecondary, fontSize: 12, lineHeight: 17 },

  emptyBox: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyTitle: { ...theme.TEXT.h2 },
  emptyText: { ...theme.TEXT.bodySecondary, textAlign: 'center' },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.COLORS.success + '15',
    borderRadius: theme.RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.COLORS.success + '30',
    marginTop: 4,
  },
  tipText: { flex: 1, ...theme.TEXT.bodySecondary, color: theme.COLORS.success, lineHeight: 17, fontWeight: theme.FONTS.medium },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    padding: theme.SIZES.lg,
    maxHeight: '90%',
    ...theme.SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { ...theme.TEXT.h2 },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formField: { marginBottom: 14 },
  formLabel: {
    ...theme.TEXT.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.medium,
  },
  formInputMulti: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16, marginTop: 6 },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: theme.COLORS.surface,
    ...theme.SHADOWS.sm,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.RADIUS.lg,
    paddingVertical: 14,
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold, fontSize: 15 },

  // Detail modal
  pkgIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailName: { ...theme.TEXT.h2, marginBottom: 4 },
  detailPrice: { ...theme.TEXT.h1, color: theme.COLORS.text, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  detailLabel: { ...theme.TEXT.label, color: theme.COLORS.textSecondary, textTransform: 'uppercase' },
  detailValue: { ...theme.TEXT.body, fontWeight: theme.FONTS.semiBold, marginTop: 1 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
  },
  actionBtnText: { fontWeight: theme.FONTS.bold, fontSize: 14 },
});
