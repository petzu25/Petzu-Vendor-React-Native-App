import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';
import theme from '../../constants/theme';

export default function BoardingOwnerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    vendorId: '',
    password: '',
    shopAddress: '',
    location: '',
    registrationDate: '',
    verificationStatus: 'pending',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/petboarding/profile');
      const profile = res.data;

      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        vendorId: profile.petBoardingId || '',
        password: '', // Kept empty unless changing
        shopAddress: profile.shopAddress || '',
        location: profile.location || '',
        registrationDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
        verificationStatus: profile.verificationStatus || 'pending',
      });
    } catch (error) {
      console.error('Error fetching boarding owner profile:', error);
      Alert.alert('Error', 'Failed to load owner profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      Alert.alert('Validation Error', 'Full Name, Phone, and Email are required.');
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData };

      // Delete password field from payload if it was left empty
      if (!payload.password) {
        delete payload.password;
      }

      await axios.put('/petboarding/profile', payload);
      Alert.alert('Success', 'Owner profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating owner profile:', error);
      const msg = error.response?.data?.message || 'Failed to update owner profile.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return {
          bg: '#d1fae5',
          text: '#065f46',
          border: '#a7f3d0',
          icon: 'check-circle',
        };
      case 'rejected':
        return {
          bg: '#fee2e2',
          text: '#991b1b',
          border: '#fca5a5',
          icon: 'x-circle',
        };
      default:
        return {
          bg: '#fef3c7',
          text: '#92400e',
          border: '#fde68a',
          icon: 'clock',
        };
    }
  };

  const statusInfo = getStatusStyle(formData.verificationStatus);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8d6e63" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrapper}>
            <Feather name="user" size={32} color={theme.COLORS.surface} />
          </View>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Owner Profile</Text>
            <Text style={styles.heroSubtitle}>Manage your personal partner information</Text>
          </View>
        </View>
      </View>

      {/* Account Verification Status */}
      <View
        style={[
          styles.statusCard,
          { backgroundColor: statusInfo.bg, borderColor: statusInfo.border },
        ]}>
        <Feather
          name={statusInfo.icon}
          size={20}
          color={statusInfo.text}
          style={styles.statusIcon}
        />
        <View style={styles.statusTextWrapper}>
          <Text style={[styles.statusLabel, { color: statusInfo.text }]}>
            Verification Status:{' '}
            <Text style={styles.statusValue}>
              {formData.verificationStatus === 'approved'
                ? 'Approved'
                : formData.verificationStatus === 'rejected'
                  ? 'Rejected'
                  : 'Pending Verification'}
            </Text>
          </Text>
          {formData.verificationStatus !== 'approved' && (
            <Text style={[styles.statusSubtext, { color: statusInfo.text }]}>
              Our administrators are reviewing your business credentials. Some options may be
              restricted.
            </Text>
          )}
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Owner Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => handleTextChange('fullName', text)}
            placeholder="Enter full name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) =>
                handleTextChange('phoneNumber', text.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit mobile"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Modify Security Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, borderHeight: 0 }]}
              value={formData.password}
              onChangeText={(text) => handleTextChange('password', text)}
              placeholder="Enter new password (optional)"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHelp}>Leave blank if you do not wish to reset password.</Text>
        </View>
      </View>

      {/* Profile/System meta */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>System Records</Text>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Vendor Boarding ID</Text>
            <Text style={styles.readOnlyText}>{formData.vendorId || 'N/A'}</Text>
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Registered On</Text>
            <Text style={styles.readOnlyText}>{formData.registrationDate || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location / Address</Text>
          <Text style={styles.readOnlyText}>
            {formData.shopAddress || formData.location || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity onPress={handleSubmit} disabled={saving} style={styles.submitButton}>
        <View style={styles.gradientBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.COLORS.surface} />
          ) : (
            <>
              <Feather name="save" size={16} color={theme.COLORS.surface} />
              <Text style={styles.submitText}>Save Profile Changes</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.SIZES.lg,
    backgroundColor: theme.COLORS.canvas,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SIZES.lg,
    backgroundColor: theme.COLORS.canvas,
  },
  loadingText: {
    marginTop: theme.SIZES.sm,
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  heroCard: {
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.xxl,
    overflow: 'hidden',
    marginBottom: theme.SIZES.lg,
  },
  heroContent: {
    padding: theme.SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: theme.FONTS.medium,
  },
  statusCard: {
    flexDirection: 'row',
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.md,
    borderWidth: 1.5,
    marginBottom: theme.SIZES.lg,
    alignItems: 'flex-start',
  },
  statusIcon: {
    marginRight: 12,
    marginTop: 1,
  },
  statusTextWrapper: {
    flex: 1,
  },
  statusLabel: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
  },
  statusValue: {
    fontWeight: theme.FONTS.bold,
    textTransform: 'uppercase',
  },
  statusSubtext: {
    ...theme.TEXT.label,
    marginTop: 4,
    lineHeight: 16,
    fontWeight: theme.FONTS.medium,
  },
  sectionCard: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xxl,
    padding: theme.SIZES.lg,
    marginBottom: theme.SIZES.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.sm,
  },
  sectionTitle: {
    ...theme.TEXT.h3,
    marginBottom: theme.SIZES.md,
    borderBottomWidth: 1.5,
    borderColor: theme.COLORS.borderLight,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: theme.SIZES.md,
  },
  label: {
    ...theme.TEXT.label,
    marginBottom: 8,
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
  disabledInput: {
    backgroundColor: theme.COLORS.canvas,
    color: theme.COLORS.textSecondary,
    borderColor: theme.COLORS.border,
  },
  readOnlyText: {
    ...theme.TEXT.bodySecondary,
    color: theme.COLORS.text,
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: theme.SIZES.md,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
  },
  eyeBtn: {
    padding: 12,
  },
  inputHelp: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    marginTop: 4,
    fontWeight: theme.FONTS.medium,
  },
  submitButton: {
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.COLORS.primary,
  },
  submitText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
});
