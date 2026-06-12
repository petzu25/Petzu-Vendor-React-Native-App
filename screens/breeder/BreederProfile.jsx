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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../lib/axios';

export default function BreederProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [registrationDate, setRegistrationDate] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const activeRole = (await AsyncStorage.getItem('activeRole')) || 'vendor';
      const userDataJson = await AsyncStorage.getItem(activeRole);

      if (!userDataJson) {
        Alert.alert('Error', 'Vendor session not found. Please log in again.');
        return;
      }

      const parsedUser = JSON.parse(userDataJson);
      const dbUserId = parsedUser.id || parsedUser.vendorId;

      if (!dbUserId) {
        Alert.alert('Error', 'Vendor ID not found.');
        return;
      }

      const res = await axios.post('/vendors/get-user', { id: dbUserId });
      const profile = res.data;

      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setEmail(profile.email || '');
      setVendorId(profile.vendorId || '');
      setPassword('');
      setShopAddress(profile.shopAddress || '');
      setVerificationStatus(profile.verificationStatus || 'pending');
      setRegistrationDate(
        profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'
      );
      setProfilePic(profile.profilePic || null);
    } catch (error) {
      console.error('Error fetching breeder profile:', error);
      Alert.alert('Error', 'Failed to load owner profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Camera roll permission is required to upload profile photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !phoneNumber || !email) {
      Alert.alert('Validation Error', 'Full Name, Phone, and Email are required.');
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('fullName', fullName);
      data.append('phoneNumber', phoneNumber);
      data.append('email', email);
      data.append('shopAddress', shopAddress);

      if (password) {
        data.append('password', password);
      }

      if (profilePic && !profilePic.startsWith('http')) {
        const fileName = profilePic.split('/').pop() || 'avatar.jpg';
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('profilePic', {
          uri: profilePic,
          name: fileName,
          type: fileType,
        });
      }

      await axios.put('/vendors/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setPassword('');
      fetchProfile();
    } catch (error) {
      console.error('Error updating breeder profile:', error);
      const msg = error.response?.data?.message || 'Failed to update breeder profile.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0', icon: 'check-circle' };
      case 'rejected':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: 'x-circle' };
      default:
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', icon: 'clock' };
    }
  };

  const statusInfo = getStatusColor(verificationStatus);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading owner profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Profile Cover */}
      <LinearGradient colors={['#7c3aed', '#2563eb']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Feather name="user" size={32} color="#ffffff" style={styles.heroIcon} />
          <View>
            <Text style={styles.heroTitle}>Owner Profile</Text>
            <Text style={styles.heroSubtitle}>Manage breeder partner credential details</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Account Status */}
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
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: statusInfo.text }]}>
            Verification Badge Status:{' '}
            <Text style={{ fontWeight: '850' }}>{verificationStatus.toUpperCase()}</Text>
          </Text>
          {verificationStatus !== 'approved' && (
            <Text style={[styles.statusSubtext, { color: statusInfo.text }]}>
              Some breeder options might be pending administration review.
            </Text>
          )}
        </View>
      </View>

      {/* Profile Picture */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile Avatar Picture</Text>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarButton}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="camera" size={28} color="#94a3b8" />
              </View>
            )}
            <View style={styles.avatarEditOverlay}>
              <Feather name="edit" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Details details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breeder Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Breeder Contact Phone *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="10-digit number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breeder ID</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={vendorId}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kennel Register Date</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={registrationDate}
            editable={false}
            selectTextOnFocus={false}
          />
        </View>
      </View>

      {/* Address */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Registered Address</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breeder Full Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shopAddress}
            onChangeText={setShopAddress}
            placeholder="Address details"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Security */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Leave blank to keep current password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Update Profile Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.saveBtnWrapper}
        onPress={handleSubmit}
        disabled={saving}>
        <LinearGradient
          colors={['#7c3aed', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save Profile Info</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
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
    fontSize: 14,
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
    gap: 16,
  },
  heroIcon: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 20,
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
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
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
    shadowOpacity: 0.03,
    shadowRadius: 8,
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
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingVertical: 4,
    alignItems: 'center',
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
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eyeBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  saveBtnWrapper: {
    borderRadius: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
