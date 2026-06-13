import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import axiosInstance from '../../lib/axios';
import theme from '../../constants/theme';

export default function TrainerProfile() {
  const { authUser } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    location: '',
    aadharNumber: '',
  });

  const fetchProfile = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const id = authUser?.id || authUser?._id;
        if (!id) throw new Error('No trainer ID found');
        const res = await axiosInstance.post('/vendors/get-user', { id });
        const data = res.data;
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          location: data.location || '',
          aadharNumber: data.aadharNumber || '',
        });
      } catch (err) {
        console.error('TrainerProfile fetch error:', err.message);
        // Fallback to authUser data
        const fallback = authUser || {};
        setProfile(fallback);
        setForm({
          fullName: fallback.fullName || '',
          phoneNumber: fallback.phoneNumber || '',
          location: fallback.location || '',
          aadharNumber: fallback.aadharNumber || '',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authUser]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      Alert.alert('Required', 'Full name is required.');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put('/vendors/profile/update', {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        location: form.location.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
      fetchProfile(true);
    } catch (err) {
      console.error('TrainerProfile save error:', err.message);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status) => {
    if (status === 'approved') return '#16a34a';
    if (status === 'rejected') return '#dc2626';
    return '#d97706';
  };

  const statusBg = (status) => {
    if (status === 'approved') return '#dcfce7';
    if (status === 'rejected') return '#fee2e2';
    return '#fef3c7';
  };

  const statusLabel = (status) => {
    if (status === 'approved') return 'Approved ✓';
    if (status === 'rejected') return 'Rejected';
    return 'Pending Review';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.COLORS.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const initials = (profile?.fullName || profile?.username || 'T').slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchProfile(true)}
          tintColor={theme.COLORS.primary}
        />
      }>
      {/* Avatar Header */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{profile?.fullName || 'Pet Trainer'}</Text>
        <Text style={styles.profileUsername}>@{profile?.username || '—'}</Text>

        {/* Verification Status */}
        <View
          style={[styles.statusBadge, { backgroundColor: statusBg(profile?.verificationStatus) }]}>
          <Feather
            name={profile?.verificationStatus === 'approved' ? 'check-circle' : 'clock'}
            size={13}
            color={statusColor(profile?.verificationStatus)}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.statusText, { color: statusColor(profile?.verificationStatus) }]}>
            {statusLabel(profile?.verificationStatus)}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={14} color={theme.COLORS.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View style={styles.editForm}>
            {[
              {
                label: 'Full Name *',
                field: 'fullName',
                icon: 'user',
                placeholder: 'Enter full name',
                keyboard: 'default',
              },
              {
                label: 'Phone Number',
                field: 'phoneNumber',
                icon: 'phone',
                placeholder: '10-digit mobile number',
                keyboard: 'phone-pad',
              },
              {
                label: 'Location / City',
                field: 'location',
                icon: 'map-pin',
                placeholder: 'City, State',
                keyboard: 'default',
              },
            ].map(({ label, field, icon, placeholder, keyboard }) => (
              <View key={field} style={styles.editField}>
                <Text style={styles.editLabel}>{label}</Text>
                <View style={styles.editInputRow}>
                  <Feather name={icon} size={15} color={theme.COLORS.primary} style={styles.editIcon} />
                  <TextInput
                    style={styles.editInput}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    value={form[field]}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, [field]: v }))}
                    keyboardType={keyboard}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditing(false);
                }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="save" size={15} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoList}>
            {[
              { icon: 'user', label: 'Full Name', value: profile?.fullName },
              { icon: 'at-sign', label: 'Username', value: profile?.username },
              { icon: 'mail', label: 'Email', value: profile?.email },
              { icon: 'phone', label: 'Phone', value: profile?.phoneNumber },
              { icon: 'map-pin', label: 'Location', value: profile?.location },
              {
                icon: 'credit-card',
                label: 'Aadhar Number',
                value: profile?.aadharNumber
                  ? '••••' + String(profile.aadharNumber).slice(-4)
                  : null,
              },
              { icon: 'hash', label: 'Trainer ID', value: profile?.petTrainerId },
              {
                icon: 'calendar',
                label: 'Member Since',
                value: profile?.createdAt ? new Date(profile.createdAt).toDateString() : null,
              },
            ].map(({ icon, label, value }) =>
              value ? (
                <View key={label} style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Feather name={icon} size={15} color={theme.COLORS.primary} />
                  </View>
                  <View style={styles.infoBody}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                  </View>
                </View>
              ) : null
            )}
          </View>
        )}
      </View>

      {/* Account Note */}
      <View style={styles.noteBox}>
        <Feather name="info" size={16} color={theme.COLORS.success} style={{ marginRight: 10 }} />
        <Text style={styles.noteText}>
          Your account is verified by the Petzu admin team. Contact support if you need to update
          your Aadhar or email address.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.canvas },
  scrollContent: { paddingBottom: 40, paddingHorizontal: theme.SIZES.md, paddingTop: theme.SIZES.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: theme.COLORS.canvas },
  loadingText: { ...theme.TEXT.bodySecondary, fontWeight: theme.FONTS.semiBold },

  avatarCard: {
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xxl,
    padding: 28,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...theme.SHADOWS.md,
  },
  avatarText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.black, fontSize: 28 },
  profileName: { ...theme.TEXT.h2, marginBottom: 4 },
  profileUsername: { ...theme.TEXT.bodySecondary, marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.RADIUS.xxl,
  },
  statusText: { ...theme.TEXT.label },

  sectionCard: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xxl,
    padding: 20,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: { ...theme.TEXT.h3 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.RADIUS.sm,
  },
  editBtnText: { color: theme.COLORS.primary, fontWeight: theme.FONTS.bold, fontSize: 13 },

  infoList: { gap: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: theme.RADIUS.sm,
    backgroundColor: theme.COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoBody: { flex: 1 },
  infoLabel: { ...theme.TEXT.label, color: theme.COLORS.textSecondary, textTransform: 'uppercase' },
  infoValue: { ...theme.TEXT.body, fontWeight: theme.FONTS.semiBold, marginTop: 1 },

  // Edit form
  editForm: { gap: 14 },
  editField: {},
  editLabel: {
    ...theme.TEXT.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: 10,
  },
  editIcon: { marginRight: 10 },
  editInput: { flex: 1, ...theme.TEXT.body, fontWeight: theme.FONTS.medium },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    alignItems: 'center',
  },
  cancelBtnText: { ...theme.TEXT.bodySecondary, fontWeight: theme.FONTS.bold },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
    paddingVertical: 13,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold, fontSize: theme.TEXT.body.fontSize },

  noteBox: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.success + '15',
    borderRadius: theme.RADIUS.lg,
    padding: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.success + '30',
    alignItems: 'flex-start',
  },
  noteText: { flex: 1, ...theme.TEXT.bodySecondary, color: theme.COLORS.success, lineHeight: 18, fontWeight: theme.FONTS.medium },
});
