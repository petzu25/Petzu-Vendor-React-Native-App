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
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';
import theme from '../../constants/theme';

export default function GroomingOwnerProfile() {
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
      const res = await axios.get('/petgrooming/profile');
      const profile = res.data;

      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        vendorId: profile.petGroomingShopId || '',
        password: '', // Kept empty unless changing
        shopAddress: profile.shopAddress || '',
        location: profile.location || '',
        registrationDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
        verificationStatus: profile.verificationStatus || 'pending',
      });
    } catch (error) {
      console.error('Error fetching grooming owner profile:', error);
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

      await axios.put('/petgrooming/profile', payload);
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
        <ActivityIndicator size="large" color="#7c3aed" />
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
              onChangeText={(text) => handleTextChange('phoneNumber', text)}
              placeholder="10-digit mobile"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleTextChange('email', text)}
              placeholder="owner@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Groomer Vendor ID</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.vendorId}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration Date</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.registrationDate}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
      </View>

      {/* Address Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Location Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Home / Shop Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.shopAddress}
            onChangeText={(text) => handleTextChange('shopAddress', text)}
            placeholder="Enter details"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City / Location</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleTextChange('location', text)}
            placeholder="e.g. Hyderabad, India"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Security Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Security Settings</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Change Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={formData.password}
              onChangeText={(text) => handleTextChange('password', text)}
              placeholder="Leave blank to keep current password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#7c3aed" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.saveButtonWrapper}
        onPress={handleSubmit}
        disabled={saving}>
        <View style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.COLORS.surface} />
          ) : (
            <>
              <Feather name="save" size={20} color={theme.COLORS.surface} style={styles.btnIcon} />
              <Text style={styles.saveButtonText}>Save Profile Info</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.SIZES.xxl,
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
    padding: theme.SIZES.lg,
    marginBottom: theme.SIZES.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrapper: {
    padding: theme.SIZES.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.RADIUS.lg,
    marginRight: theme.SIZES.md,
  },
  heroTextWrapper: {
    flex: 1,
  },
  heroTitle: {
    ...theme.TEXT.h2,
    color: theme.COLORS.surface,
    marginBottom: 4,
  },
  heroSubtitle: {
    ...theme.TEXT.bodySecondary,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.SIZES.lg,
  },
  statusIcon: {
    marginRight: 12,
    marginTop: 2,
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
    opacity: 0.85,
  },
  sectionCard: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.lg,
    marginBottom: theme.SIZES.lg,
    ...theme.SHADOWS.md,
  },
  sectionTitle: {
    ...theme.TEXT.h3,
    marginBottom: theme.SIZES.md,
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
    borderColor: theme.COLORS.border,
    color: theme.COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: theme.SIZES.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  passwordInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  saveButtonWrapper: {
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
    marginTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
  },
  saveButtonText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.body.fontSize,
    fontWeight: theme.FONTS.bold,
  },
  btnIcon: {
    marginRight: 8,
  },
});
