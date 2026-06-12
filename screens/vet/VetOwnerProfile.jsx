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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';

export default function VetOwnerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    doctorLicenseNumber: '',
    vendorId: '',
    password: '',
    clinicAddress: '',
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
      const res = await axios.get('/vet/profile');
      const profile = res.data;

      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        doctorLicenseNumber: profile.doctorLicenseNumber || '',
        vendorId: profile.doctorId || profile.id || '',
        password: '', // Kept empty unless changing
        clinicAddress: profile.clinicAddress || '',
        location: profile.location || '',
        registrationDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '',
        verificationStatus: profile.verificationStatus || 'pending',
      });
    } catch (error) {
      console.error('Error fetching vet owner profile:', error);
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

      await axios.put('/vet/profile', payload);
      Alert.alert('Success', 'Owner profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating vet owner profile:', error);
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
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading owner profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrapper}>
            <Feather name="user" size={32} color="#ffffff" />
          </View>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>Doctor Profile</Text>
            <Text style={styles.heroSubtitle}>Manage your veterinary credentials & settings</Text>
          </View>
        </View>
      </LinearGradient>

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
              Our administrators are reviewing your medical credentials. Some options may be
              restricted.
            </Text>
          )}
        </View>
      </View>

      {/* Personal Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => handleTextChange('fullName', text)}
            placeholder="Enter full name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical / Doctor License Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doctorLicenseNumber}
            onChangeText={(text) => handleTextChange('doctorLicenseNumber', text)}
            placeholder="Enter license registration number"
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
          <Text style={styles.label}>Doctor Partner ID</Text>
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

      {/* Security details */}
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
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6366f1" />
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
        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="save" size={20} color="#ffffff" style={styles.btnIcon} />
              <Text style={styles.saveButtonText}>Save Owner Profile</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrapper: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    marginRight: 16,
  },
  heroTextWrapper: {
    flex: 1,
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
  statusCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  statusTextWrapper: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusValue: {
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusSubtext: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    opacity: 0.85,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
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
  disabledInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    color: '#64748b',
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
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 8,
  },
});
