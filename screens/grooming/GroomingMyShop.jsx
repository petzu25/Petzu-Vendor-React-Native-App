import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';
import theme from '../../constants/theme';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function GroomingMyShop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    vendorShopName: '',
    shopAddress: '',
    location: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    altPhoneNumber: '',
    email: '',
    servicesOffered: '',
    workingDays: [],
    workingHours: { from: '', to: '' },
  });

  const [profileImageUri, setProfileImageUri] = useState(null);
  const [interiorImages, setInteriorImages] = useState([]); // Array of URIs/URLs

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/petgrooming/profile');
      const profile = res.data;

      setFormData({
        vendorShopName: profile.vendorShopName || profile.shopName || '',
        shopAddress: profile.shopAddress || '',
        location: profile.location || '',
        latitude: profile.coordinates?.lat?.toString() || '',
        longitude: profile.coordinates?.lng?.toString() || '',
        phoneNumber: profile.phoneNumber || '',
        altPhoneNumber: profile.altPhoneNumber || '',
        email: profile.email || '',
        servicesOffered: profile.servicesOffered || '',
        workingDays: profile.workingDays || [],
        workingHours: profile.workingHours || { from: '', to: '' },
      });

      setProfileImageUri(profile.profileImage || profile.shopImage || null);
      setInteriorImages(profile.interiorImages || []);
    } catch (error) {
      console.error('Error fetching grooming shop profile:', error);
      Alert.alert('Error', 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        Alert.alert('Error', 'Geolocation is not supported by your browser.');
        return;
      }
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6).toString(),
            longitude: position.coords.longitude.toFixed(6).toString(),
          }));
          setGettingLocation(false);
          Alert.alert('Success', 'Coordinates detected successfully!');
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          Alert.alert('Error', 'Could not detect location. Please input coordinates manually.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // For mobile device, fallback to alert or geolocation if available
      Alert.alert(
        'Location Services',
        'Please grant location permissions if prompted or input coordinates manually.'
      );
      // Basic fallback
      setGettingLocation(true);
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6).toString(),
            longitude: position.coords.longitude.toFixed(6).toString(),
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          Alert.alert('Note', 'Please fill coordinates manually.');
        }
      );
    }
  };

  const handleTextChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleTimeChange = (key, val) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, [key]: val },
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const isSelected = prev.workingDays.includes(day);
      const updatedDays = isSelected
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: updatedDays };
    });
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking profile image:', err);
    }
  };

  const pickInteriorImage = async () => {
    try {
      if (interiorImages.length >= 5) {
        Alert.alert('Limit Reached', 'You can upload a maximum of 5 gallery images.');
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setInteriorImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (err) {
      console.error('Error picking gallery image:', err);
    }
  };

  const removeInteriorImage = (index) => {
    setInteriorImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.vendorShopName ||
      !formData.shopAddress ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields marked with *');
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();

      // Append standard text fields
      data.append('vendorShopName', formData.vendorShopName);
      data.append('shopAddress', formData.shopAddress);
      data.append('location', formData.location);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('altPhoneNumber', formData.altPhoneNumber);
      data.append('email', formData.email);
      data.append('servicesOffered', formData.servicesOffered);
      data.append('workingDays', JSON.stringify(formData.workingDays));
      data.append('workingHours', JSON.stringify(formData.workingHours));

      if (formData.latitude && formData.longitude) {
        data.append(
          'coordinates',
          JSON.stringify({
            lat: parseFloat(formData.latitude),
            lng: parseFloat(formData.longitude),
          })
        );
      }

      // Add profile image if it is a new local URI
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        const fileName = profileImageUri.split('/').pop() || 'profile.jpg';
        const type = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('profileImage', {
          uri: profileImageUri,
          name: fileName,
          type: type,
        });
      }

      // Separate existing gallery URLs from new local URIs
      const existingUrls = interiorImages.filter((uri) => uri.startsWith('http'));
      data.append('existingInteriorImages', JSON.stringify(existingUrls));

      const newLocalUris = interiorImages.filter((uri) => !uri.startsWith('http'));
      newLocalUris.forEach((uri, idx) => {
        const filename = uri.split('/').pop() || `interior_${idx}.jpg`;
        const type = `image/${filename.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('interiorImages', {
          uri: uri,
          name: filename,
          type: type,
        });
      });

      await axios.put('/petgrooming/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Shop details updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error saving shop profile:', error);
      const msg = error.response?.data?.message || 'Failed to save changes.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading your shop...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrapper}>
            <Feather name="scissors" size={32} color={theme.COLORS.surface} />
          </View>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>My Grooming Shop</Text>
            <Text style={styles.heroSubtitle}>Manage your premium pet grooming business</Text>
          </View>
        </View>
      </View>

      {/* Shop Profile Image */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Shop Profile Picture</Text>
        <View style={styles.imageSelectorContainer}>
          {profileImageUri ? (
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              <TouchableOpacity style={styles.changeImageBtn} onPress={pickProfileImage}>
                <Feather name="camera" size={18} color="#ffffff" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickProfileImage}>
              <Feather name="image" size={36} color="#94a3b8" />
              <Text style={styles.uploadPlaceholderText}>Upload Shop Profile Image</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Shop Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Shop Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.vendorShopName}
            onChangeText={(text) => handleTextChange('vendorShopName', text)}
            placeholder="Enter shop name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.shopAddress}
            onChangeText={(text) => handleTextChange('shopAddress', text)}
            placeholder="Enter complete address"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>General Location *</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleTextChange('location', text)}
            placeholder="e.g. Indiranagar, Bangalore"
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
            <Text style={styles.label}>Alternate Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.altPhoneNumber}
              onChangeText={(text) => handleTextChange('altPhoneNumber', text)}
              placeholder="Secondary number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleTextChange('email', text)}
            placeholder="shop@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Coordinates */}
        <View style={styles.coordinatesHeader}>
          <Text style={styles.coordinatesTitle}>Location Coordinates</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={gettingLocation}>
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="navigation" size={14} color="#ffffff" style={styles.btnIcon} />
                <Text style={styles.locationButtonText}>Get Current</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(text) => handleTextChange('latitude', text)}
              placeholder="e.g. 12.9716"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(text) => handleTextChange('longitude', text)}
              placeholder="e.g. 77.5946"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Services Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Describe your grooming services *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.servicesOffered}
            onChangeText={(text) => handleTextChange('servicesOffered', text)}
            placeholder="List the general categories or packages you offer (e.g., haircut, bathing, massage)"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Working Days & Hours */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Working Days & Hours</Text>

        <Text style={styles.label}>Select Working Days *</Text>
        <View style={styles.daysWrapper}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = formData.workingDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayBadge, isSelected ? styles.dayBadgeSelected : null]}
                onPress={() => handleDayToggle(day)}>
                <Text
                  style={[styles.dayBadgeText, isSelected ? styles.dayBadgeTextSelected : null]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Opening Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.workingHours.from}
              onChangeText={(text) => handleTimeChange('from', text)}
              placeholder="e.g. 09:00 AM"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Closing Time *</Text>
            <TextInput
              style={styles.input}
              value={formData.workingHours.to}
              onChangeText={(text) => handleTimeChange('to', text)}
              placeholder="e.g. 07:00 PM"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </View>

      {/* Gallery Section */}
      <View style={styles.sectionCard}>
        <View style={styles.galleryHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shop Gallery</Text>
            <Text style={styles.gallerySubtitle}>Upload up to 5 interior/exterior photos</Text>
          </View>
          {interiorImages.length < 5 && (
            <TouchableOpacity style={styles.addGalleryBtn} onPress={pickInteriorImage}>
              <Feather name="plus" size={16} color="#7c3aed" />
              <Text style={styles.addGalleryBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.galleryGrid}>
          {interiorImages.map((uri, index) => (
            <View key={index} style={styles.galleryItem}>
              <Image source={{ uri }} style={styles.galleryImage} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeInteriorImage(index)}>
                <Feather name="x" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
          {interiorImages.length === 0 && (
            <Text style={styles.noImagesText}>No photos uploaded yet.</Text>
          )}
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
              <Text style={styles.saveButtonText}>Save All Changes</Text>
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
  imageSelectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.RADIUS.lg,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.md,
  },
  changeImageText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.label.fontSize,
    fontWeight: theme.FONTS.bold,
    marginLeft: 6,
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 2,
    borderColor: theme.COLORS.border,
    borderStyle: 'dashed',
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 8,
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
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
  coordinatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.SIZES.sm,
    marginBottom: theme.SIZES.sm,
  },
  coordinatesTitle: {
    ...theme.TEXT.label,
    color: theme.COLORS.text,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.md,
  },
  locationButtonText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.label.fontSize,
    fontWeight: theme.FONTS.bold,
  },
  daysWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.SIZES.md,
  },
  dayBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.COLORS.canvas,
    borderRadius: theme.RADIUS.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  dayBadgeSelected: {
    backgroundColor: theme.COLORS.primaryLight,
    borderColor: theme.COLORS.primary,
  },
  dayBadgeText: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  dayBadgeTextSelected: {
    color: theme.COLORS.primary,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.SIZES.md,
  },
  gallerySubtitle: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    marginTop: 2,
  },
  addGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.md,
    borderWidth: 1,
    borderColor: theme.COLORS.primary,
  },
  addGalleryBtnText: {
    color: theme.COLORS.primary,
    fontSize: theme.TEXT.bodySecondary.fontSize,
    fontWeight: theme.FONTS.bold,
    marginLeft: 4,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
    borderRadius: theme.RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    ...theme.TEXT.bodySecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
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
