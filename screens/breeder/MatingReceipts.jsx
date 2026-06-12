import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORIES = ['Dog', 'Cat'];

export default function MatingReceipts() {
  const { authUser } = useAuthStore();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);

  // ── Male Pet
  const [maleCategory, setMaleCategory] = useState('Dog');
  const [maleBreed, setMaleBreed] = useState('');
  const [maleName, setMaleName] = useState('');
  const [maleOwnerName, setMaleOwnerName] = useState('');
  const [maleOwnerPhone, setMaleOwnerPhone] = useState('');
  const [malePetQuality, setMalePetQuality] = useState('Pet Quality');
  const [maleKciStatus, setMaleKciStatus] = useState('Non-KCI Pet');
  const [maleKciNumber, setMaleKciNumber] = useState('');
  const [maleKciName, setMaleKciName] = useState('');
  const [maleMatingCount, setMaleMatingCount] = useState('');
  const [maleMicrochip, setMaleMicrochip] = useState('');

  // ── Female Pet
  const [femaleCategory, setFemaleCategory] = useState('Dog');
  const [femaleBreed, setFemaleBreed] = useState('');
  const [femaleName, setFemaleName] = useState('');
  const [femaleOwnerName, setFemaleOwnerName] = useState('');
  const [femaleOwnerPhone, setFemaleOwnerPhone] = useState('');
  const [femalePetQuality, setFemalePetQuality] = useState('Pet Quality');
  const [femaleKciStatus, setFemaleKciStatus] = useState('Non-KCI Pet');
  const [femaleKciNumber, setFemaleKciNumber] = useState('');
  const [femaleKciName, setFemaleKciName] = useState('');
  const [femaleMatingCount, setFemaleMatingCount] = useState('');
  const [femaleMicrochip, setFemaleMicrochip] = useState('');
  const [femaleOwnerAddress, setFemaleOwnerAddress] = useState('');

  // ── Mating Details
  const [price, setPrice] = useState('');
  const [matingDate, setMatingDate] = useState('');
  const [matingTime, setMatingTime] = useState('');
  const [matingLocation, setMatingLocation] = useState('');

  // ── Breeder (auto-filled)
  const [breederName, setBreederName] = useState('');
  const [breederPhone, setBreederPhone] = useState('');

  // ── Photos
  const [malePetPhoto, setMalePetPhoto] = useState(null);
  const [femalePetPhoto, setFemalePetPhoto] = useState(null);
  const [lockingPhotos, setLockingPhotos] = useState([]);
  const [maleKciCert, setMaleKciCert] = useState(null);
  const [femaleKciCert, setFemaleKciCert] = useState(null);

  const [billVisible, setBillVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/matingpetreceipts/history');
      if (res.data && res.data.success) {
        setReceipts(res.data.receipts || []);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error fetching mating receipts:', error);
      Alert.alert('Error', 'Failed to load mating receipts history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingReceipt(null);
    // Male
    setMaleCategory('Dog');
    setMaleBreed('');
    setMaleName('');
    setMaleOwnerName('');
    setMaleOwnerPhone('');
    setMalePetQuality('Pet Quality');
    setMaleKciStatus('Non-KCI Pet');
    setMaleKciNumber('');
    setMaleKciName('');
    setMaleMatingCount('');
    setMaleMicrochip('');
    // Female
    setFemaleCategory('Dog');
    setFemaleBreed('');
    setFemaleName('');
    setFemaleOwnerName('');
    setFemaleOwnerPhone('');
    setFemalePetQuality('Pet Quality');
    setFemaleKciStatus('Non-KCI Pet');
    setFemaleKciNumber('');
    setFemaleKciName('');
    setFemaleMatingCount('');
    setFemaleMicrochip('');
    setFemaleOwnerAddress('');
    // Mating
    setPrice('');
    setMatingDate(new Date().toISOString().split('T')[0]);
    setMatingTime('');
    setMatingLocation(authUser?.location || '');
    // Breeder (auto-fill)
    setBreederName(authUser?.fullName || '');
    setBreederPhone(authUser?.phoneNumber || '');
    // Photos
    setMalePetPhoto(null);
    setFemalePetPhoto(null);
    setLockingPhotos([]);
    setMaleKciCert(null);
    setFemaleKciCert(null);
    setFormVisible(true);
  };

  const handleOpenEdit = (receipt) => {
    setEditingReceipt(receipt);
    // Male
    setMaleCategory(receipt.maleCategory || 'Dog');
    setMaleBreed(receipt.maleBreed || '');
    setMaleName(receipt.malePetName || '');
    setMaleOwnerName(receipt.maleOwnerName || '');
    setMaleOwnerPhone(receipt.maleOwnerPhone || '');
    setMalePetQuality(receipt.malePetQuality || 'Pet Quality');
    setMaleKciStatus(receipt.maleKciStatus || 'Non-KCI Pet');
    setMaleKciNumber(receipt.maleKciNumber || '');
    setMaleKciName(receipt.maleKciName || '');
    setMaleMatingCount(receipt.maleMatingCount || '');
    setMaleMicrochip(receipt.maleMicrochip || '');
    // Female
    setFemaleCategory(receipt.femaleCategory || 'Dog');
    setFemaleBreed(receipt.femaleBreed || '');
    setFemaleName(receipt.femalePetName || '');
    setFemaleOwnerName(receipt.femaleOwnerName || '');
    setFemaleOwnerPhone(receipt.femaleOwnerPhone || '');
    setFemalePetQuality(receipt.femalePetQuality || 'Pet Quality');
    setFemaleKciStatus(receipt.femaleKciStatus || 'Non-KCI Pet');
    setFemaleKciNumber(receipt.femaleKciNumber || '');
    setFemaleKciName(receipt.femaleKciName || '');
    setFemaleMatingCount(receipt.femaleMatingCount || '');
    setFemaleMicrochip(receipt.femaleMicrochip || '');
    setFemaleOwnerAddress(receipt.femaleOwnerAddress || '');
    // Mating
    setPrice(receipt.price?.toString() || '');
    setMatingDate(
      receipt.matingDate ? new Date(receipt.matingDate).toISOString().split('T')[0] : ''
    );
    setMatingTime(receipt.matingTime || '');
    setMatingLocation(receipt.matingLocation || '');
    // Breeder
    setBreederName(receipt.breederName || authUser?.fullName || '');
    setBreederPhone(receipt.breederPhone || authUser?.phoneNumber || '');
    // Photos
    setMalePetPhoto(receipt.malePetPhoto || null);
    setFemalePetPhoto(receipt.femalePetPhoto || null);
    setLockingPhotos(receipt.lockingPhotos || []);
    setMaleKciCert(receipt.maleKciCertificate || null);
    setFemaleKciCert(receipt.femaleKciCertificate || null);
    setFormVisible(true);
  };

  const handlePickFile = async (field) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (field === 'malePet') setMalePetPhoto(uri);
        else if (field === 'femalePet') setFemalePetPhoto(uri);
        else if (field === 'maleKci') setMaleKciCert(uri);
        else if (field === 'femaleKci') setFemaleKciCert(uri);
        else if (field === 'locking') {
          setLockingPhotos((prev) => [...prev, uri].slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleRemoveFile = (field, index) => {
    if (field === 'malePet') setMalePetPhoto(null);
    else if (field === 'femalePet') setFemalePetPhoto(null);
    else if (field === 'maleKci') setMaleKciCert(null);
    else if (field === 'femaleKci') setFemaleKciCert(null);
    else if (field === 'locking') {
      setLockingPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this mating invoice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await axios.delete(`/matingpetreceipts/${id}`);
            Alert.alert('Success', 'Mating record deleted successfully');
            fetchReceipts();
          } catch (error) {
            console.error('Error deleting record:', error);
            Alert.alert('Error', 'Failed to delete record.');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (
      !maleOwnerName ||
      !maleOwnerPhone ||
      !femaleOwnerName ||
      !femaleOwnerPhone ||
      !maleBreed ||
      !femaleBreed ||
      !price ||
      !matingLocation ||
      !breederName
    ) {
      Alert.alert(
        'Validation Error',
        'Stud/Female breed, owner contacts, mating location, price, and breeder name are required.'
      );
      return;
    }
    if (maleOwnerPhone.length !== 10 || femaleOwnerPhone.length !== 10) {
      Alert.alert('Validation Error', 'Owner phone numbers must be 10 digits each.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Male pet fields
      data.append('maleCategory', maleCategory);
      data.append('maleBreed', maleBreed);
      if (maleName) data.append('malePetName', maleName);
      data.append('maleOwnerName', maleOwnerName);
      data.append('maleOwnerPhone', maleOwnerPhone);
      data.append('malePetQuality', malePetQuality);
      data.append('maleKciStatus', maleKciStatus);
      if (maleKciNumber) data.append('maleKciNumber', maleKciNumber);
      if (maleKciName) data.append('maleKciName', maleKciName);
      if (maleMatingCount) data.append('maleMatingCount', maleMatingCount);
      if (maleMicrochip) data.append('maleMicrochip', maleMicrochip);
      // Female pet fields
      data.append('femaleCategory', femaleCategory);
      data.append('femaleBreed', femaleBreed);
      if (femaleName) data.append('femalePetName', femaleName);
      data.append('femaleOwnerName', femaleOwnerName);
      data.append('femaleOwnerPhone', femaleOwnerPhone);
      data.append('femalePetQuality', femalePetQuality);
      data.append('femaleKciStatus', femaleKciStatus);
      if (femaleKciNumber) data.append('femaleKciNumber', femaleKciNumber);
      if (femaleKciName) data.append('femaleKciName', femaleKciName);
      if (femaleMatingCount) data.append('femaleMatingCount', femaleMatingCount);
      if (femaleMicrochip) data.append('femaleMicrochip', femaleMicrochip);
      if (femaleOwnerAddress) data.append('femaleOwnerAddress', femaleOwnerAddress);
      // Mating details
      data.append('price', price);
      data.append('matingDate', matingDate);
      if (matingTime) data.append('matingTime', matingTime);
      data.append('matingLocation', matingLocation);
      // Breeder (required by model)
      data.append('breederName', breederName);
      data.append('breederPhone', breederPhone);

      // Append files helper
      const appendFileIfLocal = (key, uri) => {
        if (uri && !uri.startsWith('http')) {
          const fileName = uri.split('/').pop() || 'photo.jpg';
          const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
          // @ts-ignore
          data.append(key, {
            uri,
            name: fileName,
            type: fileType,
          });
        } else if (uri && uri.startsWith('http')) {
          // Send existing file url back
          if (key === 'malePetPhoto') data.append('existingMalePetPhoto', uri);
          else if (key === 'femalePetPhoto') data.append('existingFemalePetPhoto', uri);
          else if (key === 'maleKciCertificate') data.append('existingMaleKciCert', uri);
          else if (key === 'femaleKciCertificate') data.append('existingFemaleKciCert', uri);
        }
      };

      appendFileIfLocal('malePetPhoto', malePetPhoto);
      appendFileIfLocal('femalePetPhoto', femalePetPhoto);
      appendFileIfLocal('maleKciCertificate', maleKciCert);
      appendFileIfLocal('femaleKciCertificate', femaleKciCert);

      // Locking photos list
      const localLocking = lockingPhotos.filter((uri) => !uri.startsWith('http'));
      const existingLocking = lockingPhotos.filter((uri) => uri.startsWith('http'));

      if (existingLocking.length > 0) {
        data.append('existingLockingPhotos', JSON.stringify(existingLocking));
      }

      localLocking.forEach((uri, idx) => {
        const fileName = uri.split('/').pop() || `locking_${idx}.jpg`;
        const fileType = `image/${fileName.split('.').pop() === 'png' ? 'png' : 'jpeg'}`;
        // @ts-ignore
        data.append('lockingPhotos', {
          uri,
          name: fileName,
          type: fileType,
        });
      });

      if (editingReceipt) {
        await axios.put(`/matingpetreceipts/${editingReceipt._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Mating receipt updated successfully');
      } else {
        await axios.post('/matingpetreceipts', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Mating session recorded successfully');
      }

      setFormVisible(false);
      fetchReceipts();
    } catch (error) {
      console.error('Error saving mating receipt:', error);
      const msg = error.response?.data?.message || 'Failed to save mating receipt.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReceipts = receipts.filter(
    (r) =>
      (r.receiptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.femaleOwnerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.maleBreed || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = receipts.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  const renderReceiptItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.receiptId}>
              {item.receiptId || `MTR-${item._id?.slice(-5).toUpperCase()}`}
            </Text>
            <Text style={styles.receiptDate}>
              {new Date(item.matingDate || item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>₹{item.price?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stud Breed:</Text>
            <Text style={styles.infoVal}>
              {item.maleBreed} ({item.maleCategory})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Female Owner:</Text>
            <Text style={styles.infoVal}>
              {item.femaleOwnerName} ({item.femaleOwnerPhone})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Female Breed:</Text>
            <Text style={styles.infoVal}>{item.femaleBreed}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => {
              setSelectedReceipt(item);
              setBillVisible(true);
            }}
            style={[styles.actionBtn, styles.viewBtn]}>
            <Feather name="file-text" size={14} color="#7c3aed" />
            <Text style={styles.viewBtnText}>Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={[styles.actionBtn, styles.editBtn]}>
            <Feather name="edit" size={14} color="#2563eb" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={[styles.actionBtn, styles.deleteBtn]}>
            <Feather name="trash-2" size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Metric Revenue Banner */}
      <View style={styles.revenueBanner}>
        <LinearGradient
          colors={['#10b981', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}>
          <View>
            <Text style={styles.revenueLabel}>Total Mating Services</Text>
            <Text style={styles.revenueValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueStats}>
            <Text style={styles.revenueStatsText}>{receipts.length} Sessions</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Search and Generate button */}
      <View style={styles.controlsRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions history..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: '#10b981' }]}
          onPress={handleOpenAdd}>
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.createBtnText}>Record Session</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading sessions history...</Text>
        </View>
      ) : filteredReceipts.length > 0 ? (
        <FlatList
          data={filteredReceipts}
          renderItem={renderReceiptItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="pocket" size={32} color="#10b981" />
          </View>
          <Text style={styles.emptyTitle}>No Sessions Recorded</Text>
          <Text style={styles.emptySubtitle}>
            Log digital mating transactions and upload lock proofs here.
          </Text>
        </View>
      )}

      {/* Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReceipt ? 'Edit Mating Invoice' : 'New Mating Invoicing'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setFormVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Male Stud Details</Text>

              <Text style={styles.inputLabel}>Male Category *</Text>
              <View style={styles.pillContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      maleCategory === cat ? styles.categoryPillSelected : null,
                    ]}
                    onPress={() => setMaleCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        maleCategory === cat ? styles.categoryPillTextSelected : null,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Male Breed *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={maleBreed}
                    onChangeText={setMaleBreed}
                    placeholder="e.g. Rottweiler"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Male Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={maleName}
                    onChangeText={setMaleName}
                    placeholder="Stud name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Male KCI Registration Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={maleKciNumber}
                  onChangeText={setMaleKciNumber}
                  placeholder="KCI reg number"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Male Stud Photo</Text>
                <TouchableOpacity
                  style={styles.filePicker}
                  onPress={() => handlePickFile('malePet')}>
                  <Feather name="image" size={16} color="#7c3aed" />
                  <Text style={styles.filePickerText}>
                    {malePetPhoto ? 'Change Stud Photo' : 'Upload Stud Photo'}
                  </Text>
                </TouchableOpacity>
                {malePetPhoto && (
                  <View style={styles.fileThumbContainer}>
                    <Image source={{ uri: malePetPhoto }} style={styles.fileThumb} />
                    <TouchableOpacity
                      style={styles.fileRemove}
                      onPress={() => handleRemoveFile('malePet')}>
                      <Feather name="x" size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.sectionHeader}>Female Pet Details</Text>

              <Text style={styles.inputLabel}>Female Category *</Text>
              <View style={styles.pillContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      femaleCategory === cat ? styles.categoryPillSelected : null,
                    ]}
                    onPress={() => setFemaleCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        femaleCategory === cat ? styles.categoryPillTextSelected : null,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Female Breed *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={femaleBreed}
                    onChangeText={setFemaleBreed}
                    placeholder="e.g. Rottweiler"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Female Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={femaleName}
                    onChangeText={setFemaleName}
                    placeholder="Female name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Female KCI Registration Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={femaleKciNumber}
                  onChangeText={setFemaleKciNumber}
                  placeholder="KCI reg number"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Female Pet Photo</Text>
                <TouchableOpacity
                  style={styles.filePicker}
                  onPress={() => handlePickFile('femalePet')}>
                  <Feather name="image" size={16} color="#7c3aed" />
                  <Text style={styles.filePickerText}>
                    {femalePetPhoto ? 'Change Female Photo' : 'Upload Female Photo'}
                  </Text>
                </TouchableOpacity>
                {femalePetPhoto && (
                  <View style={styles.fileThumbContainer}>
                    <Image source={{ uri: femalePetPhoto }} style={styles.fileThumb} />
                    <TouchableOpacity
                      style={styles.fileRemove}
                      onPress={() => handleRemoveFile('femalePet')}>
                      <Feather name="x" size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.sectionHeader}>Female Owner Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Owner Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={femaleOwnerName}
                  onChangeText={setFemaleOwnerName}
                  placeholder="Enter owner name"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Owner Contact Phone (10 digits) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={femaleOwnerPhone}
                  onChangeText={(text) => setFemaleOwnerPhone(text.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Owner Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={femaleOwnerAddress}
                  onChangeText={setFemaleOwnerAddress}
                  placeholder="Owner full address details"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <Text style={styles.sectionHeader}>Invoicing & Proofs</Text>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Mating Price Fee (INR) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Fee in ₹"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Mating Date *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={matingDate}
                    onChangeText={setMatingDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mating Lock Photos (Max 3)</Text>
                <TouchableOpacity
                  style={styles.filePicker}
                  onPress={() => handlePickFile('locking')}>
                  <Feather name="camera" size={16} color="#10b981" />
                  <Text style={[styles.filePickerText, { color: '#10b981' }]}>
                    Upload Lock Photo
                  </Text>
                </TouchableOpacity>
                <View style={styles.imagesGrid}>
                  {lockingPhotos.map((uri, idx) => (
                    <View key={idx} style={styles.imageItem}>
                      <Image source={{ uri }} style={styles.imageThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => handleRemoveFile('locking', idx)}>
                        <Feather name="x" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveInvoiceBtn, { backgroundColor: '#10b981' }]}
                onPress={handleSave}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveInvoiceBtnText}>Record Engagement Receipt</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Invoice View Modal */}
      {selectedReceipt && (
        <Modal
          visible={billVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setBillVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.invoiceSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Mating Stud Invoice Bill</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setBillVisible(false)}>
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.invoiceScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.billSheet}>
                  <View style={styles.billHeader}>
                    <Feather name="pocket" size={24} color="#10b981" />
                    <Text style={[styles.billBrand, { color: '#10b981' }]}>
                      PETZU breeding network
                    </Text>
                    <Text style={styles.billSerial}>
                      Stud Session #{selectedReceipt.receiptId || 'PENDING'}
                    </Text>
                  </View>

                  <View style={styles.billDivider} />

                  <View style={styles.partiesContainer}>
                    <View style={styles.partyBox}>
                      <Text style={styles.partyTitle}>STUD OWNER (BREEDER)</Text>
                      <Text style={styles.partyName}>
                        {selectedReceipt.breederName || 'Petzu breeder partner'}
                      </Text>
                      <Text style={styles.partyText}>
                        Ph: {selectedReceipt.breederPhone || 'N/A'}
                      </Text>
                      <Text style={styles.partyText}>
                        {selectedReceipt.breederAddress || 'Address details'}
                      </Text>
                    </View>

                    <View style={styles.partyBox}>
                      <Text style={styles.partyTitle}>FEMALE OWNER (CLIENT)</Text>
                      <Text style={styles.partyName}>{selectedReceipt.femaleOwnerName}</Text>
                      <Text style={styles.partyText}>Ph: {selectedReceipt.femaleOwnerPhone}</Text>
                      <Text style={styles.partyText}>
                        {selectedReceipt.femaleOwnerAddress || 'Address details'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billDivider} />

                  <Text style={styles.billSectionTitle}>Lineage Service details</Text>

                  <View style={styles.billRowItem}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.billItemName}>
                        Stud Service: {selectedReceipt.maleBreed}
                      </Text>
                      <Text style={styles.billItemDesc}>
                        Stud Name: {selectedReceipt.maleName || 'N/A'} • Reg:{' '}
                        {selectedReceipt.maleKciNumber || 'Non-KCI'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billRowItem}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.billItemName}>
                        Female Pet: {selectedReceipt.femaleBreed}
                      </Text>
                      <Text style={styles.billItemDesc}>
                        Female Name: {selectedReceipt.femaleName || 'N/A'} • Reg:{' '}
                        {selectedReceipt.femaleKciNumber || 'Non-KCI'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billDivider} />

                  <View style={styles.calculationSection}>
                    <View style={[styles.calRow, { marginTop: 4 }]}>
                      <Text style={styles.grandLabel}>Mating Fee Due</Text>
                      <Text style={[styles.grandVal, { color: '#10b981' }]}>
                        ₹{Number(selectedReceipt.price || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {selectedReceipt.lockingPhotos && selectedReceipt.lockingPhotos.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                      <Text style={styles.billSectionTitle}>Locking Proof Uploads</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.lockPhotosScroll}>
                        {selectedReceipt.lockingPhotos.map((url, index) => (
                          <Image key={index} source={{ uri: url }} style={styles.lockBillThumb} />
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  revenueBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  revenueStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  revenueStatsText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  createBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  createBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  center: {
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
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  receiptId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  receiptDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  totalBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  cardBody: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '700',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  viewBtnText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  editBtnText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 36,
    paddingHorizontal: 0,
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginTop: 20,
    minHeight: 250,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Form Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    paddingTop: 20,
  },
  closeBtn: {
    padding: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  formScroll: {
    padding: 24,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderColor: '#10b981',
    paddingLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  textInput: {
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  categoryPillSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextSelected: {
    color: '#059669',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  gridCol: {
    flex: 1,
  },
  genderOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  genderOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  genderOptionTextActive: {
    color: '#059669',
  },
  filePicker: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  filePickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  fileThumbContainer: {
    marginTop: 8,
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileThumb: {
    width: '100%',
    height: '100%',
  },
  fileRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  imageItem: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveInvoiceBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveInvoiceBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  // Invoice Sheet styling
  invoiceSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
    paddingTop: 20,
  },
  invoiceScroll: {
    flex: 1,
    padding: 24,
  },
  billSheet: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 40,
  },
  billHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  billBrand: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  billSerial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  billDivider: {
    height: 1.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    borderStyle: 'dashed',
  },
  partiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  partyBox: {
    flex: 1,
  },
  partyTitle: {
    fontSize: 10,
    fontWeight: '850',
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  partyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  billSectionTitle: {
    fontSize: 12,
    fontWeight: '850',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  billItemName: {
    fontSize: 13,
    fontWeight: '750',
    color: '#1e293b',
  },
  billItemDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  calculationSection: {
    alignItems: 'flex-end',
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
  },
  grandLabel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '850',
  },
  grandVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  lockPhotosScroll: {
    marginVertical: 10,
  },
  lockBillThumb: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
