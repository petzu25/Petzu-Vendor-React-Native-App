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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function VetMyShop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    clinicName: '',
    clinicAddress: '',
    location: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    altPhoneNumber: '',
    email: '',
    servicesOffered: '',
    workingDays: [],
    workingHours: { from: '', to: '' },
    doctorLicenseNumber: '',
  });

  const [shopImageUri, setShopImageUri] = useState(null);
  const [interiorImages, setInteriorImages] = useState([]); // Array of URIs/URLs

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/vet/profile');
      const profile = res.data;

      setFormData({
        clinicName: profile.clinicName || '',
        clinicAddress: profile.clinicAddress || '',
        location: profile.location || '',
        latitude: profile.coordinates?.lat?.toString() || '',
        longitude: profile.coordinates?.lng?.toString() || '',
        phoneNumber: profile.phoneNumber || '',
        altPhoneNumber: profile.altPhoneNumber || '',
        email: profile.email || '',
        servicesOffered: profile.servicesOffered || '',
        workingDays: profile.workingDays || [],
        workingHours: profile.workingHours || { from: '', to: '' },
        doctorLicenseNumber: profile.doctorLicenseNumber || '',
      });

      setShopImageUri(profile.shopImage || profile.profileImage || null);
      setInteriorImages(profile.interiorImages || []);
    } catch (error) {
      console.error('Error fetching vet clinic profile:', error);
      Alert.alert('Error', 'Failed to load clinic details.');
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

  const pickShopImage = async () => {
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
        setShopImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking shop image:', err);
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
      !formData.clinicName ||
      !formData.clinicAddress ||
      !formData.location ||
      !formData.phoneNumber ||
      !formData.email
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields marked with *');
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();

      // Append text fields
      data.append('clinicName', formData.clinicName);
      data.append('clinicAddress', formData.clinicAddress);
      data.append('location', formData.location);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('altPhoneNumber', formData.altPhoneNumber);
      data.append('email', formData.email);
      data.append('servicesOffered', formData.servicesOffered);
      data.append('workingDays', JSON.stringify(formData.workingDays));
      data.append('workingHours', JSON.stringify(formData.workingHours));
      data.append('doctorLicenseNumber', formData.doctorLicenseNumber);

      if (formData.latitude && formData.longitude) {
        data.append(
          'coordinates',
          JSON.stringify({
            lat: parseFloat(formData.latitude),
            lng: parseFloat(formData.longitude),
          })
        );
      }

      // Add shop/profile image if new local uri
      if (shopImageUri && !shopImageUri.startsWith('http')) {
        const fileName = shopImageUri.split('/').pop() || 'clinic.jpg';
        const type = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('shopImage', {
          uri: shopImageUri,
          name: fileName,
          type: type,
        });
      }

      // Existing interior URLs
      const existingUrls = interiorImages.filter((uri) => uri.startsWith('http'));
      data.append('existingInteriorImages', JSON.stringify(existingUrls));

      // Local new files
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

      await axios.put('/vet/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Clinic details updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Error saving clinic profile:', error);
      const msg = error.response?.data?.message || 'Failed to save clinic changes.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading clinic details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Header */}
      <LinearGradient colors={['#6366f1', '#06b6d4']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrapper}>
            <Feather name="activity" size={32} color="#ffffff" />
          </View>
          <View style={styles.heroTextWrapper}>
            <Text style={styles.heroTitle}>My Veterinary Clinic</Text>
            <Text style={styles.heroSubtitle}>Manage your clinic facilities, location & hours</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Clinic main cover Image */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Clinic Banner Photo</Text>
        <View style={styles.imageSelectorContainer}>
          {shopImageUri ? (
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: shopImageUri }} style={styles.profileImage} />
              <TouchableOpacity style={styles.changeImageBtn} onPress={pickShopImage}>
                <Feather name="camera" size={18} color="#ffffff" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickShopImage}>
              <Feather name="image" size={36} color="#94a3b8" />
              <Text style={styles.uploadPlaceholderText}>Upload Clinic Cover Banner</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Clinic basic info fields */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>General Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clinic / Hospital Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.clinicName}
            onChangeText={(text) => handleTextChange('clinicName', text)}
            placeholder="Enter clinic name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor License Number</Text>
          <TextInput
            style={styles.input}
            value={formData.doctorLicenseNumber}
            onChangeText={(text) => handleTextChange('doctorLicenseNumber', text)}
            placeholder="Enter license registration number"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Clinic Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.clinicAddress}
            onChangeText={(text) => handleTextChange('clinicAddress', text)}
            placeholder="Enter complete physical address"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location City *</Text>
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
              placeholder="Secondary phone"
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
            placeholder="clinic@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* GPS coordinates with Auto Detect */}
        <View style={styles.coordinatesHeader}>
          <Text style={styles.coordinatesTitle}>GPS Coordinates</Text>
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
              placeholder="Latitude"
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
              placeholder="Longitude"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Services offered details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Services Offered</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Describe Vet & Treatment Services Offered</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.servicesOffered}
            onChangeText={(text) => handleTextChange('servicesOffered', text)}
            placeholder="List veterinary checkups, surgery, grooming, vaccinations, diagnostics offered..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Operating Timings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Clinic Operating Timing</Text>

        <Text style={styles.label}>Select Operational Days</Text>
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
            <Text style={styles.label}>Opening Time</Text>
            <TextInput
              style={styles.input}
              value={formData.workingHours.from}
              onChangeText={(text) => handleTimeChange('from', text)}
              placeholder="e.g. 09:00 AM"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Closing Time</Text>
            <TextInput
              style={styles.input}
              value={formData.workingHours.to}
              onChangeText={(text) => handleTimeChange('to', text)}
              placeholder="e.g. 09:00 PM"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </View>

      {/* Gallery Section */}
      <View style={styles.sectionCard}>
        <View style={styles.galleryHeader}>
          <View>
            <Text style={styles.sectionTitle}>Clinic Gallery</Text>
            <Text style={styles.gallerySubtitle}>
              Upload up to 5 interior/exterior clinic photos
            </Text>
          </View>
          {interiorImages.length < 5 && (
            <TouchableOpacity style={styles.addGalleryBtn} onPress={pickInteriorImage}>
              <Feather name="plus" size={16} color="#6366f1" />
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
            <Text style={styles.noImagesText}>No clinic photos uploaded yet.</Text>
          )}
        </View>
      </View>

      {/* Submit Buttons */}
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
              <Text style={styles.saveButtonText}>Save Clinic Details</Text>
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
    marginBottom: 24,
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
  imageSelectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
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
    borderRadius: 12,
  },
  changeImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    marginTop: 12,
    marginBottom: 14,
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  locationButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
  daysWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  dayBadgeSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  dayBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  dayBadgeTextSelected: {
    color: '#3b82f6',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gallerySubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  addGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  addGalleryBtnText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '700',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
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
});
