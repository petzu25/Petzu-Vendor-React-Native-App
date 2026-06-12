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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../lib/axios';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BreederShop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [vendorShopName, setVendorShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [services, setServices] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [workingDays, setWorkingDays] = useState([]);
  const [workingHours, setWorkingHours] = useState({ from: '', to: '' });

  const [profilePicUri, setProfilePicUri] = useState(null);
  const [kciCertificateUri, setKciCertificateUri] = useState(null);
  const [kciStatus, setKciStatus] = useState('pending');

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const activeRole = (await AsyncStorage.getItem('activeRole')) || 'vendor';
      const userDataJson = await AsyncStorage.getItem(activeRole);

      if (!userDataJson) {
        Alert.alert('Error', 'Vendor session not found. Please log in again.');
        return;
      }

      const parsedUser = JSON.parse(userDataJson);
      const vendorId = parsedUser.id || parsedUser.vendorId;

      if (!vendorId) {
        Alert.alert('Error', 'Vendor ID could not be loaded.');
        return;
      }

      const res = await axios.get(`/vendors/${vendorId}`);
      const vendor = res.data;

      setVendorShopName(vendor.vendorShopName || '');
      setShopAddress(vendor.shopAddress || '');
      setLocation(vendor.location || '');
      setLatitude(vendor.coordinates?.lat?.toString() || '');
      setLongitude(vendor.coordinates?.lng?.toString() || '');
      setPhoneNumber(vendor.phoneNumber || '');
      setEmail(vendor.email || '');
      setServices(vendor.services || '');
      setGstNumber(vendor.gstNumber || '');
      setWorkingDays(vendor.workingDays || []);
      setWorkingHours(vendor.workingHours || { from: '', to: '' });
      setProfilePicUri(vendor.profilePic || null);
      setKciCertificateUri(vendor.kciCertificate || null);
      setKciStatus(vendor.kciStatus || 'pending');
    } catch (error) {
      console.error('Error fetching breeder shop:', error);
      Alert.alert('Error', 'Failed to load shop operations details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (type === 'profile') {
          setProfilePicUri(uri);
        } else {
          setKciCertificateUri(uri);
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) {
        Alert.alert('Error', 'Geolocation is not supported by your browser.');
        setGettingLocation(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6).toString());
          setLongitude(position.coords.longitude.toFixed(6).toString());
          setGettingLocation(false);
          Alert.alert('Success', 'Coordinates auto-detected!');
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          Alert.alert('Note', 'Failed to detect location automatically. Please enter coordinates.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      Alert.alert('Coordinates Auto-Detect', 'Requesting location details...');
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6).toString());
          setLongitude(position.coords.longitude.toFixed(6).toString());
          setGettingLocation(false);
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          Alert.alert('Note', 'Please input coordinates manually.');
        }
      );
    }
  };

  const handleDayToggle = (day) => {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleTimeChange = (key, value) => {
    setWorkingHours((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!vendorShopName || !shopAddress || !phoneNumber || !email) {
      Alert.alert('Validation Error', 'Shop Name, Address, Phone, and Email are required.');
      return;
    }

    try {
      setSaving(true);
      const activeRole = (await AsyncStorage.getItem('activeRole')) || 'vendor';
      const userDataJson = await AsyncStorage.getItem(activeRole);
      const parsedUser = JSON.parse(userDataJson);
      const vendorId = parsedUser.id || parsedUser.vendorId;

      const data = new FormData();
      data.append('vendorShopName', vendorShopName);
      data.append('shopAddress', shopAddress);
      data.append('location', location);
      data.append('phoneNumber', phoneNumber);
      data.append('email', email);
      data.append('services', services);
      data.append('gstNumber', gstNumber);
      data.append('workingDays', JSON.stringify(workingDays));
      data.append('workingHours', JSON.stringify(workingHours));

      if (latitude && longitude) {
        data.append(
          'coordinates',
          JSON.stringify({
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          })
        );
      }

      // Profile Picture
      if (profilePicUri && !profilePicUri.startsWith('http')) {
        const fileName = profilePicUri.split('/').pop() || 'profile.jpg';
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('profilePic', {
          uri: profilePicUri,
          name: fileName,
          type: fileType,
        });
      }

      // KCI Certificate
      if (kciCertificateUri && !kciCertificateUri.startsWith('http')) {
        const fileName = kciCertificateUri.split('/').pop() || 'kci.jpg';
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('kciCertificate', {
          uri: kciCertificateUri,
          name: fileName,
          type: fileType,
        });
      }

      const res = await axios.put(`/vendors/${vendorId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.vendor) {
        Alert.alert('Success', 'Shop operations profile updated successfully!');
        fetchShopDetails();
      }
    } catch (error) {
      console.error('Error saving breeder shop details:', error);
      const msg = error.response?.data?.message || 'Failed to save shop details.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading shop operations...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Cover Gradient */}
      <LinearGradient colors={['#7c3aed', '#2563eb']} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Feather name="home" size={32} color="#ffffff" style={styles.heroIcon} />
          <View>
            <Text style={styles.heroTitle}>My Breeding Kennel</Text>
            <Text style={styles.heroSubtitle}>Manage your kennel details and operations</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Profile Pic Upload */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Shop Profile Banner</Text>
        <View style={styles.imagePickerWrapper}>
          {profilePicUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: profilePicUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.changeImageBtn}
                onPress={() => handlePickFile('profile')}>
                <Feather name="camera" size={16} color="#ffffff" />
                <Text style={styles.changeImageText}>Change Cover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => handlePickFile('profile')}>
              <Feather name="image" size={32} color="#94a3b8" />
              <Text style={styles.uploadPlaceholderText}>Upload Shop Cover Banner</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Shop Information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Shop Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kennel / Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={vendorShopName}
            onChangeText={setVendorShopName}
            placeholder="Enter brand name"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Location Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shopAddress}
            onChangeText={setShopAddress}
            placeholder="Kennel full address"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>General Location / City</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Bangalore"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Operational Mobile *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="10-digit phone"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Contact Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="kennel@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GST Identification Number (GSTIN)</Text>
          <TextInput
            style={styles.input}
            value={gstNumber}
            onChangeText={setGstNumber}
            placeholder="GSTIN Code (Optional)"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* GPS Coordinates */}
      <View style={styles.sectionCard}>
        <View style={styles.coordinatesHeader}>
          <Text style={styles.sectionTitle}>Shop Location Coordinates</Text>
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={getCurrentLocation}
            disabled={gettingLocation}>
            {gettingLocation ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="navigation" size={14} color="#ffffff" style={styles.btnIcon} />
                <Text style={styles.gpsButtonText}>Auto Detect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="e.g. 12.9716"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="e.g. 77.5946"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Working Schedule */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Working Days & Hours</Text>

        <Text style={styles.label}>Kennel Active Days *</Text>
        <View style={styles.daysWrapper}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = workingDays.includes(day);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayBadge, isSelected ? styles.dayBadgeSelected : null]}
                onPress={() => handleDayToggle(day)}>
                <Text
                  style={[styles.dayBadgeText, isSelected ? styles.dayBadgeTextSelected : null]}>
                  {day}
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
              value={workingHours.from}
              onChangeText={(text) => handleTimeChange('from', text)}
              placeholder="e.g. 09:00"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={[styles.inputGroup, styles.gridItem]}>
            <Text style={styles.label}>Closing Time *</Text>
            <TextInput
              style={styles.input}
              value={workingHours.to}
              onChangeText={(text) => handleTimeChange('to', text)}
              placeholder="e.g. 18:30"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </View>

      {/* Services Description */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Breeding services offered</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kennel Services Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={services}
            onChangeText={setServices}
            placeholder="List dog breed imports, stud services, microchippings, vaccination certifications..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* KCI Verification Document */}
      <View style={styles.sectionCard}>
        <View style={styles.kciHeader}>
          <View>
            <Text style={styles.sectionTitle}>KCI Certificate Upload</Text>
            <Text style={styles.kciSubtitle}>Upload verification document (KCI Badge)</Text>
          </View>
          <View
            style={[
              styles.kciStatusBadge,
              kciStatus === 'approved' ? styles.kciActive : styles.kciPending,
            ]}>
            <Text style={styles.kciStatusText}>
              {kciStatus === 'approved' ? 'Verified Badge' : 'Under Review'}
            </Text>
          </View>
        </View>

        <View style={styles.imagePickerWrapper}>
          {kciCertificateUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: kciCertificateUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.changeImageBtn} onPress={() => handlePickFile('kci')}>
                <Feather name="file-text" size={16} color="#ffffff" />
                <Text style={styles.changeImageText}>Change Cert</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => handlePickFile('kci')}>
              <Feather name="upload" size={32} color="#94a3b8" />
              <Text style={styles.uploadPlaceholderText}>Upload Breeder Certificate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Update Operations Button */}
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
              <Feather name="save" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Update Operations Profile</Text>
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
  imagePickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
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
    gap: 6,
  },
  changeImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
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
    marginBottom: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  gpsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 2,
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
    backgroundColor: '#f5f3ff',
    borderColor: '#a78bfa',
  },
  dayBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  dayBadgeTextSelected: {
    color: '#7c3aed',
  },
  kciHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kciSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  kciStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  kciActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  kciPending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  kciStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
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
