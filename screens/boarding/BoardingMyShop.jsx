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

export default function BoardingMyShop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    shopName: '',
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
      const res = await axios.get('/petboarding/profile');
      const profile = res.data;

      setFormData({
        shopName: profile.shopName || '',
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
      console.error('Error fetching boarding shop profile:', error);
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
      Alert.alert(
        'Location Services',
        'Please grant location permissions if prompted or input coordinates manually.'
      );
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

  const handleSave = async () => {
    if (
      !formData.shopName ||
      !formData.shopAddress ||
      !formData.location ||
      !formData.phoneNumber ||
      !formData.email
    ) {
      Alert.alert(
        'Validation Error',
        'Shop Name, Address, Location, Phone, and Email are required.'
      );
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();

      data.append('shopName', formData.shopName);
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

      // Handle profile image file
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        const fileUri = profileImageUri;
        const fileName = fileUri.split('/').pop() || 'profile.jpg';
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('profileImage', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      }

      // Handle interior images files
      const existingUrls = interiorImages.filter((uri) => uri.startsWith('http'));
      data.append('existingInteriorImages', JSON.stringify(existingUrls));

      const localUris = interiorImages.filter((uri) => !uri.startsWith('http'));
      localUris.forEach((uri, idx) => {
        const fileName = uri.split('/').pop() || `interior_${idx}.jpg`;
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('interiorImages', {
          uri,
          name: fileName,
          type: fileType,
        });
      });

      await axios.put('/petboarding/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Boarding shop settings saved successfully.');
      fetchProfile();
    } catch (error) {
      console.error('Error saving boarding shop profile:', error);
      const msg = error.response?.data?.message || 'Failed to update shop profile.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8d6e63" />
        <Text style={styles.loadingText}>Fetching Boarding Shop Details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.shopBannerContainer}>
        <TouchableOpacity onPress={pickProfileImage} style={styles.bannerImageButton}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.bannerImage} />
          ) : (
            <View style={styles.placeholderBanner}>
              <Feather name="camera" size={32} color="#a1a1aa" />
              <Text style={styles.placeholderBannerText}>Upload Shop Profile Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>Business Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Shop Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.shopName}
            onChangeText={(val) => handleTextChange('shopName', val)}
            placeholder="Enter boarding shop name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Shop Address *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.shopAddress}
            onChangeText={(val) => handleTextChange('shopAddress', val)}
            placeholder="Full physical address"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location (City / Region) *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.location}
            onChangeText={(val) => handleTextChange('location', val)}
            placeholder="e.g. Bangalore, South"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* GPS coordinates */}
        <View style={styles.coordsHeaderRow}>
          <Text style={styles.inputLabel}>GPS Coordinates</Text>
          <TouchableOpacity
            style={styles.detectBtn}
            onPress={getCurrentLocation}
            disabled={gettingLocation}>
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#8d6e63" />
            ) : (
              <>
                <Feather name="navigation" size={12} color="#8d6e63" />
                <Text style={styles.detectBtnText}>Auto Detect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <TextInput
              style={styles.textInput}
              value={formData.latitude}
              onChangeText={(val) => handleTextChange('latitude', val)}
              placeholder="Latitude"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <TextInput
              style={styles.textInput}
              value={formData.longitude}
              onChangeText={(val) => handleTextChange('longitude', val)}
              placeholder="Longitude"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phoneNumber}
              onChangeText={(val) =>
                handleTextChange('phoneNumber', val.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <Text style={styles.inputLabel}>Alternate Phone</Text>
            <TextInput
              style={styles.textInput}
              value={formData.altPhoneNumber}
              onChangeText={(val) =>
                handleTextChange('altPhoneNumber', val.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="Optional alternate"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Shop Email Address *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(val) => handleTextChange('email', val)}
            placeholder="e.g. contact@boarding.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Services Offered *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.servicesOffered}
            onChangeText={(val) => handleTextChange('servicesOffered', val)}
            placeholder="e.g. AC Boarding, Cage-free care, Veterinary support, Regular walks"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        <Text style={styles.sectionHeader}>Working Hours & Timing</Text>

        <View style={styles.gridRow}>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <Text style={styles.inputLabel}>Open From</Text>
            <TextInput
              style={styles.textInput}
              value={formData.workingHours.from}
              onChangeText={(val) => handleTimeChange('from', val)}
              placeholder="e.g. 08:00"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridCol]}>
            <Text style={styles.inputLabel}>Open To</Text>
            <TextInput
              style={styles.textInput}
              value={formData.workingHours.to}
              onChangeText={(val) => handleTimeChange('to', val)}
              placeholder="e.g. 20:00"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Operating Days</Text>
        <View style={styles.daySelectionContainer}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = formData.workingDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                onPress={() => handleDayToggle(day)}
                style={[styles.dayButton, isSelected ? styles.dayButtonSelected : null]}>
                <Text
                  style={[styles.dayButtonText, isSelected ? styles.dayButtonTextSelected : null]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Gallery / Interior Photos</Text>
        <Text style={styles.gallerySubtext}>
          Upload up to 5 interior photos of your boarding facility
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
          {interiorImages.map((uri, index) => (
            <View key={index} style={styles.galleryImageContainer}>
              <Image source={{ uri }} style={styles.galleryImage} />
              <TouchableOpacity
                style={styles.removeGalleryBtn}
                onPress={() => removeInteriorImage(index)}>
                <Feather name="x" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
          {interiorImages.length < 5 && (
            <TouchableOpacity onPress={pickInteriorImage} style={styles.addGalleryButton}>
              <Feather name="plus" size={24} color="#8d6e63" />
              <Text style={styles.addGalleryText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButtonWrapper}>
          <View style={styles.saveBtnGradient}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.COLORS.surface} />
            ) : (
              <>
                <Feather name="check-circle" size={16} color={theme.COLORS.surface} />
                <Text style={styles.saveBtnText}>Save Boarding Shop Details</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.canvas,
  },
  center: {
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
  shopBannerContainer: {
    height: 180,
    width: '100%',
    backgroundColor: theme.COLORS.border,
  },
  bannerImageButton: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderBanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
  },
  placeholderBannerText: {
    color: theme.COLORS.textSecondary,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.label.fontSize,
    marginTop: 8,
  },
  formSection: {
    padding: theme.SIZES.lg,
  },
  sectionHeader: {
    ...theme.TEXT.h3,
    marginTop: theme.SIZES.md,
    marginBottom: theme.SIZES.sm,
    borderLeftWidth: 3,
    borderColor: theme.COLORS.primary,
    paddingLeft: 8,
  },
  inputGroup: {
    marginBottom: theme.SIZES.md,
  },
  inputLabel: {
    ...theme.TEXT.label,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: theme.SIZES.md,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  coordsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.RADIUS.sm,
  },
  detectBtnText: {
    fontSize: theme.TEXT.label.fontSize,
    color: theme.COLORS.primary,
    fontWeight: theme.FONTS.bold,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  daySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.SIZES.md,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.md,
  },
  dayButtonSelected: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
  },
  dayButtonText: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
  },
  dayButtonTextSelected: {
    color: theme.COLORS.surface,
  },
  gallerySubtext: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    marginBottom: 12,
  },
  galleryScroll: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  galleryImageContainer: {
    width: 120,
    height: 80,
    borderRadius: theme.RADIUS.md,
    marginRight: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeGalleryBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGalleryButton: {
    width: 120,
    height: 80,
    borderRadius: theme.RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.canvas,
  },
  addGalleryText: {
    ...theme.TEXT.label,
    color: theme.COLORS.primary,
    marginTop: 4,
  },
  saveButtonWrapper: {
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
    marginTop: 8,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
  },
  saveBtnText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
});
