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
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../lib/axios';
import theme from '../../constants/theme';

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
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Feather name="user" size={32} color={theme.COLORS.surface} style={styles.heroIcon} />
          <View>
            <Text style={styles.heroTitle}>Owner Profile</Text>
            <Text style={styles.heroSubtitle}>Manage breeder partner credential details</Text>
          </View>
        </View>
      </View>

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
        <View style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.COLORS.surface} />
          ) : (
            <>
              <Feather name="check-circle" size={18} color={theme.COLORS.surface} style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save Profile Info</Text>
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
    gap: 16,
  },
  heroIcon: {
    padding: theme.SIZES.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.RADIUS.lg,
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
  statusLabel: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
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
    ...theme.SHADOWS.sm,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  sectionTitle: {
    ...theme.TEXT.h3,
    marginBottom: theme.SIZES.md,
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
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 2,
    borderColor: theme.COLORS.borderLight,
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
  textArea: {
    minHeight: 60,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    overflow: 'hidden',
  },
  eyeBtn: {
    paddingHorizontal: 16,
    height: theme.SIZES.inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
    borderLeftWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  saveBtnWrapper: {
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
    marginTop: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
  },
  saveBtnText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.body.fontSize,
    fontWeight: theme.FONTS.bold,
  },
});
