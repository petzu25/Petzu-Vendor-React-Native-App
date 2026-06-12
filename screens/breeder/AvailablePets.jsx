import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';

const CATEGORIES = ['Dog', 'Cat', 'Bird', 'Fish', 'Other'];
const GENDERS = ['Male', 'Female', 'Mixed', 'Unsexed'];
const QUALITIES = ['Show Quality', 'Pet Quality', 'Breeder Quality'];
const LINEAGES = ['Champion Lineage', 'Import Lineage', 'Standard Lineage', 'None'];
const KCI_STATUSES = ['KCI Pet', 'Non-KCI Pet'];

export default function AvailablePets() {
  const { authUser } = useAuthStore();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingPet, setEditingPet] = useState(null);

  // ── Step 1: General
  const [formCategory, setFormCategory] = useState('Dog');
  const [formBreed, setFormBreed] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formPrice, setFormPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Step 2: Lineage & Health
  const [petQuality, setPetQuality] = useState('Pet Quality');
  const [breedLineage, setBreedLineage] = useState('None');
  const [vaccinationDetails, setVaccinationDetails] = useState('');
  const [kciStatusPet, setKciStatusPet] = useState('Non-KCI Pet');
  const [kciNumber, setKciNumber] = useState('');
  const [kciName, setKciName] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');

  // ── Step 3: Vendor details (auto-filled)
  const [breederName, setBreederName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [location, setLocation] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // ── Step 4: Media
  const [formImages, setFormImages] = useState([]);
  const [vaccinationProofImages, setVaccinationProofImages] = useState([]);
  const [kciCertImages, setKciCertImages] = useState([]);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/aboutpet/getAllAboutPet');
      if (res.data && res.data.data) {
        const available = res.data.data.filter((p) => p.status === 'Available');
        setPets(available);
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error('Error fetching available pets:', error);
      Alert.alert('Error', 'Failed to load available pets.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormCategory('Dog');
    setFormBreed('');
    setFormGender('Male');
    setFormPrice('');
    setPriceNegotiable(false);
    setDateOfBirth('');
    setPetQuality('Pet Quality');
    setBreedLineage('None');
    setVaccinationDetails('');
    setKciStatusPet('Non-KCI Pet');
    setKciNumber('');
    setKciName('');
    setMicrochipNumber('');
    // Auto-fill vendor details from authUser
    setBreederName(authUser?.fullName || '');
    setPhoneNumber(authUser?.phoneNumber || '');
    setShopAddress(authUser?.shopAddress || '');
    setLocation(authUser?.location || authUser?.shopAddress || '');
    setAdditionalDetails('');
    setFormImages([]);
    setVaccinationProofImages([]);
    setKciCertImages([]);
    setCurrentStep(1);
  };

  const handleOpenAdd = () => {
    setEditingPet(null);
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setFormCategory(pet.category || 'Dog');
    setFormBreed(pet.breed || '');
    setFormGender(pet.gender || 'Male');
    setFormPrice(pet.price?.toString() || '');
    setPriceNegotiable(!!pet.priceNegotiable);
    setDateOfBirth(pet.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split('T')[0] : '');
    setPetQuality(pet.petQuality || 'Pet Quality');
    setBreedLineage(pet.breedLineage || 'None');
    setVaccinationDetails(pet.vaccinationDetails || '');
    setKciStatusPet(pet.kciStatusPet || 'Non-KCI Pet');
    setKciNumber(pet.kciNumber || '');
    setKciName(pet.kciName || '');
    setMicrochipNumber(pet.microchipNumber || '');
    setBreederName(pet.breederName || authUser?.fullName || '');
    setPhoneNumber(pet.phoneNumber || authUser?.phoneNumber || '');
    setShopAddress(pet.shopAddress || authUser?.shopAddress || '');
    setLocation(pet.location || '');
    setAdditionalDetails(pet.details || '');
    setFormImages(pet.images || []);
    setVaccinationProofImages(pet.vaccinationProof || []);
    setKciCertImages(pet.kciCertificate || []);
    setCurrentStep(1);
    setModalVisible(true);
  };

  const handlePickImages = async (setter, current, limit = 5) => {
    if (current.length >= limit) {
      Alert.alert('Limit Reached', `You can upload up to ${limit} images.`);
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: limit - current.length,
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        const picked = result.assets.map((a) => a.uri);
        setter((prev) => [...prev, ...picked].slice(0, limit));
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const handleRemoveImage = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatusChange = async (petId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/aboutpet/updatePets/${petId}`, { status: newStatus });
      Alert.alert('Success', `Pet listing marked as ${newStatus}`);
      fetchPets();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update pet status.');
      setLoading(false);
    }
  };

  const handleDelete = (petId) => {
    Alert.alert('Move to Trash', 'Are you sure? You can recover it within 30 days.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await axios.delete(`/aboutpet/deletePets/${petId}`);
            Alert.alert('Success', 'Pet listing moved to trash');
            fetchPets();
          } catch (error) {
            console.error('Error deleting pet:', error);
            Alert.alert('Error', 'Failed to delete listing.');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async () => {
    if (!formBreed || !formPrice || !dateOfBirth) {
      Alert.alert('Validation Error', 'Breed, Price, and Date of Birth are required.');
      return;
    }
    if (!breederName || !phoneNumber || !location) {
      Alert.alert('Validation Error', 'Breeder Name, Phone Number and Location are required.');
      return;
    }
    if (formImages.length === 0 && !editingPet) {
      Alert.alert('Validation Error', 'At least one pet photo is required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Step 1 fields
      data.append('category', formCategory);
      data.append('breed', formBreed);
      data.append('gender', formGender);
      data.append('price', formPrice);
      data.append('priceNegotiable', String(priceNegotiable));
      data.append('dateOfBirth', dateOfBirth);

      // Step 2 fields
      data.append('petQuality', petQuality);
      if (formCategory !== 'Fish' && formCategory !== 'Bird') {
        data.append('breedLineage', breedLineage);
      }
      data.append('vaccinationDetails', vaccinationDetails);
      data.append('kciStatusPet', kciStatusPet);
      if (kciStatusPet === 'KCI Pet') {
        data.append('kciNumber', kciNumber);
        data.append('kciName', kciName);
      }
      if (microchipNumber) data.append('microchipNumber', microchipNumber);

      // Step 3 fields
      data.append('breederName', breederName);
      data.append('phoneNumber', phoneNumber);
      data.append('shopAddress', shopAddress);
      data.append('location', location);
      if (additionalDetails) data.append('details', additionalDetails);

      // Step 4: Images (new local URIs)
      const localImages = formImages.filter((uri) => !uri.startsWith('http'));
      const existingImages = formImages.filter((uri) => uri.startsWith('http'));
      existingImages.forEach((url) => data.append('existingImages', url));
      localImages.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('images', {
          uri,
          name: `pet_photo_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      // Vaccination proof images
      const localVax = vaccinationProofImages.filter((uri) => !uri.startsWith('http'));
      const existingVax = vaccinationProofImages.filter((uri) => uri.startsWith('http'));
      existingVax.forEach((url) => data.append('existingVaccinationProofs', url));
      localVax.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('vaccinationProof', {
          uri,
          name: `vax_proof_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      // KCI Certificate images
      const localKci = kciCertImages.filter((uri) => !uri.startsWith('http'));
      const existingKci = kciCertImages.filter((uri) => uri.startsWith('http'));
      existingKci.forEach((url) => data.append('existingKciCertificates', url));
      localKci.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('kciCertificate', {
          uri,
          name: `kci_cert_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingPet) {
        await axios.put(`/aboutpet/updatePets/${editingPet._id}`, data, config);
        Alert.alert('Success', 'Pet updated successfully');
      } else {
        await axios.post('/aboutpet/createAbout', data, config);
        Alert.alert('Success', 'Pet listing published!');
      }

      setModalVisible(false);
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save pet.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPets = pets.filter(
    (pet) =>
      (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PillSelector = ({ label, options, selected, onSelect }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pillContainer}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, selected === opt ? styles.pillSelected : null]}
            onPress={() => onSelect(opt)}>
            <Text style={[styles.pillText, selected === opt ? styles.pillTextSelected : null]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ImageGrid = ({ images, onAdd, onRemove, label, limit = 5 }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} (Max {limit})
      </Text>
      <TouchableOpacity style={styles.photoPicker} onPress={onAdd}>
        <Feather name="camera" size={22} color="#7c3aed" />
        <Text style={styles.photoPickerText}>Select From Gallery</Text>
      </TouchableOpacity>
      {images.length > 0 && (
        <View style={styles.imagesGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri }} style={styles.imageThumbnail} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => onRemove(index)}>
                <Feather name="x" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPetCard = ({ item }) => {
    const mainPhoto = item.images && item.images.length > 0 ? item.images[0] : null;
    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={styles.cardImage} />
          ) : (
            <View style={styles.placeholderCardImage}>
              <Feather name="image" size={32} color="#94a3b8" />
            </View>
          )}
          <View style={styles.cardPriceBadge}>
            <Text style={styles.cardPriceText}>₹{item.price?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardBreed} numberOfLines={1}>
              {item.breed || 'Unknown Breed'}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.cardMetaRow}>
            <View style={styles.metaItem}>
              <Feather name="info" size={12} color="#64748b" />
              <Text style={styles.metaText}>{item.gender}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color="#64748b" />
              <Text style={styles.metaText}>{item.age || '—'}</Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => {
                setSelectedPet(item);
                setViewModalVisible(true);
              }}
              style={[styles.cardBtn, styles.viewBtn]}>
              <Feather name="eye" size={14} color="#7c3aed" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenEdit(item)}
              style={[styles.cardBtn, styles.editBtn]}>
              <Feather name="edit-2" size={14} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStatusChange(item._id, 'Sold Out')}
              style={[styles.cardBtn, styles.soldOutBtn]}>
              <Feather name="check-circle" size={14} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={[styles.cardBtn, styles.trashBtn]}>
              <Feather name="trash-2" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by breed or category..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <LinearGradient
            colors={['#7c3aed', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBtnGradient}>
            <Feather name="plus" size={18} color="#ffffff" style={styles.addBtnIcon} />
            <Text style={styles.addBtnText}>Add Pet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Fetching available pets...</Text>
        </View>
      ) : filteredPets.length > 0 ? (
        <FlatList
          data={filteredPets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="heart" size={32} color="#7c3aed" />
          </View>
          <Text style={styles.emptyTitle}>No Available Pets</Text>
          <Text style={styles.emptySubtitle}>
            Tap &quot;Add Pet&quot; to create your first listing.
          </Text>
        </View>
      )}

      {/* Form Modal — 4 Steps */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPet ? 'Edit Pet Listing' : 'Add New Pet Listing'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepsIndicator}>
              {[1, 2, 3, 4].map((step) => (
                <View key={step} style={styles.stepIndicatorRow}>
                  <View
                    style={[
                      styles.stepDot,
                      currentStep === step
                        ? styles.stepDotActive
                        : currentStep > step
                          ? styles.stepDotCompleted
                          : null,
                    ]}>
                    {currentStep > step ? (
                      <Feather name="check" size={10} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.stepDotText,
                          currentStep === step ? styles.stepDotTextActive : null,
                        ]}>
                        {step}
                      </Text>
                    )}
                  </View>
                  {step < 4 && (
                    <View
                      style={[
                        styles.stepLine,
                        currentStep > step ? styles.stepLineCompleted : null,
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* ── STEP 1: General Details ── */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>General Details</Text>

                  <PillSelector
                    label="Pet Category *"
                    options={CATEGORIES}
                    selected={formCategory}
                    onSelect={setFormCategory}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Breed *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formBreed}
                      onChangeText={setFormBreed}
                      placeholder="e.g. Labrador Retriever"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <PillSelector
                    label="Gender *"
                    options={GENDERS}
                    selected={formGender}
                    onSelect={setFormGender}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      placeholder="e.g. 2025-03-15"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Listing Price (INR) *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formPrice}
                      onChangeText={setFormPrice}
                      placeholder="e.g. 15000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setPriceNegotiable(!priceNegotiable)}>
                    <View
                      style={[styles.checkbox, priceNegotiable ? styles.checkboxChecked : null]}>
                      {priceNegotiable && <Feather name="check" size={12} color="#ffffff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Price is Negotiable</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── STEP 2: Lineage & Health ── */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Lineage &amp; Health</Text>

                  <PillSelector
                    label="Pet Quality"
                    options={QUALITIES}
                    selected={petQuality}
                    onSelect={setPetQuality}
                  />

                  {formCategory !== 'Fish' && formCategory !== 'Bird' && (
                    <PillSelector
                      label="Breeding Lineage"
                      options={LINEAGES}
                      selected={breedLineage}
                      onSelect={setBreedLineage}
                    />
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Vaccination Status / Details</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vaccinationDetails}
                      onChangeText={setVaccinationDetails}
                      placeholder="e.g. First dose done, dewormed"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <PillSelector
                    label="KCI Certificate Status"
                    options={KCI_STATUSES}
                    selected={kciStatusPet}
                    onSelect={setKciStatusPet}
                  />

                  {kciStatusPet === 'KCI Pet' && (
                    <View style={styles.kciSubform}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>KCI Registration Number</Text>
                        <TextInput
                          style={styles.textInput}
                          value={kciNumber}
                          onChangeText={setKciNumber}
                          placeholder="Enter KCI Reg No"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>KCI Registered Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={kciName}
                          onChangeText={setKciName}
                          placeholder="Enter Registered Name"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Microchip Number (15 digits, Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={microchipNumber}
                      onChangeText={setMicrochipNumber}
                      placeholder="Enter 15-digit Microchip No"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* ── STEP 3: Seller / Vendor Details ── */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Seller Details</Text>
                  <Text style={styles.stepHint}>
                    Auto-filled from your profile. Edit if needed.
                  </Text>

                  {[
                    {
                      label: 'Breeder / Owner Name *',
                      value: breederName,
                      setter: setBreederName,
                      placeholder: 'Your full name',
                      keyboard: 'default',
                    },
                    {
                      label: 'Phone Number *',
                      value: phoneNumber,
                      setter: setPhoneNumber,
                      placeholder: '10-digit mobile number',
                      keyboard: 'phone-pad',
                    },
                    {
                      label: 'Location / City *',
                      value: location,
                      setter: setLocation,
                      placeholder: 'City, State',
                      keyboard: 'default',
                    },
                    {
                      label: 'Shop Address',
                      value: shopAddress,
                      setter: setShopAddress,
                      placeholder: 'Complete shop address',
                      keyboard: 'default',
                    },
                  ].map(({ label, value, setter, placeholder, keyboard }) => (
                    <View key={label} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{label}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setter}
                        placeholder={placeholder}
                        placeholderTextColor="#94a3b8"
                        keyboardType={keyboard}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Additional Details / Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={additionalDetails}
                      onChangeText={setAdditionalDetails}
                      placeholder="Write notes about temperament, health condition..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              )}

              {/* ── STEP 4: Media ── */}
              {currentStep === 4 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Photos &amp; Documents</Text>

                  <ImageGrid
                    label="Pet Photos *"
                    images={formImages}
                    onAdd={() => handlePickImages(setFormImages, formImages, 5)}
                    onRemove={(idx) => handleRemoveImage(setFormImages, idx)}
                  />

                  <ImageGrid
                    label="Vaccination Proof"
                    images={vaccinationProofImages}
                    onAdd={() =>
                      handlePickImages(setVaccinationProofImages, vaccinationProofImages, 3)
                    }
                    onRemove={(idx) => handleRemoveImage(setVaccinationProofImages, idx)}
                    limit={3}
                  />

                  {kciStatusPet === 'KCI Pet' && (
                    <ImageGrid
                      label="KCI Certificate"
                      images={kciCertImages}
                      onAdd={() => handlePickImages(setKciCertImages, kciCertImages, 3)}
                      onRemove={(idx) => handleRemoveImage(setKciCertImages, idx)}
                      limit={3}
                    />
                  )}
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              {currentStep > 1 ? (
                <TouchableOpacity style={styles.footerBackBtn} onPress={prevStep}>
                  <Text style={styles.footerBackBtnText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              {currentStep < 4 ? (
                <TouchableOpacity style={styles.footerNextBtn} onPress={nextStep}>
                  <Text style={styles.footerNextBtnText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.footerSaveBtn}
                  onPress={handleSave}
                  disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.footerSaveBtnText}>Publish Listing</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* View Details Modal */}
      {selectedPet && (
        <Modal
          visible={viewModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setViewModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.viewContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pet Information</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setViewModalVisible(false)}>
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedPet.images && selectedPet.images.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollRow}>
                    {selectedPet.images.map((url, i) => (
                      <Image key={i} source={{ uri: url }} style={styles.viewMainImage} />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.viewMainPlaceholder}>
                    <Feather name="image" size={48} color="#cbd5e1" />
                    <Text style={styles.placeholderText}>No Photos Available</Text>
                  </View>
                )}
                <View style={styles.infoSection}>
                  <View style={styles.breedPriceRow}>
                    <Text style={styles.viewBreed}>{selectedPet.breed || 'Unknown'}</Text>
                    <Text style={styles.viewPrice}>₹{selectedPet.price?.toLocaleString()}</Text>
                  </View>
                  {[
                    { label: 'Category', value: selectedPet.category },
                    { label: 'Gender', value: selectedPet.gender },
                    { label: 'Age', value: selectedPet.age },
                    {
                      label: 'Date of Birth',
                      value: selectedPet.dateOfBirth
                        ? new Date(selectedPet.dateOfBirth).toDateString()
                        : null,
                    },
                    { label: 'Pet Quality', value: selectedPet.petQuality },
                    { label: 'Lineage', value: selectedPet.breedLineage },
                    { label: 'Vaccination', value: selectedPet.vaccinationDetails },
                    { label: 'KCI Status', value: selectedPet.kciStatusPet },
                    { label: 'KCI Number', value: selectedPet.kciNumber },
                    { label: 'Breeder', value: selectedPet.breederName },
                    { label: 'Location', value: selectedPet.location },
                    { label: 'Phone', value: selectedPet.phoneNumber },
                  ].map(({ label, value }) =>
                    value ? (
                      <View key={label} style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{label}:</Text>
                        <Text style={styles.infoValue}>{value}</Text>
                      </View>
                    ) : null
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
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  addBtn: { borderRadius: 14, overflow: 'hidden' },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  addBtnIcon: { marginRight: 6 },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { color: '#64748b', fontSize: 14 },
  listContent: { paddingBottom: 20, gap: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
  emptySubtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  imageWrapper: { position: 'relative', width: 100 },
  cardImage: { width: 100, height: 110 },
  placeholderCardImage: {
    width: 100,
    height: 110,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPriceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardPriceText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardDetails: { flex: 1, padding: 10 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardBreed: { fontSize: 14, fontWeight: '700', color: '#1e1b4b', flex: 1 },
  categoryBadge: {
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: { color: '#7c3aed', fontSize: 11, fontWeight: '700' },
  cardMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b' },
  cardDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  cardBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtn: { backgroundColor: '#ede9fe' },
  editBtn: { backgroundColor: '#dbeafe' },
  soldOutBtn: { backgroundColor: '#d1fae5' },
  trashBtn: { backgroundColor: '#fee2e2' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1e1b4b' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  stepIndicatorRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#7c3aed' },
  stepDotCompleted: { backgroundColor: '#10b981' },
  stepDotText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  stepDotTextActive: { color: '#fff' },
  stepLine: { width: 28, height: 2, backgroundColor: '#e2e8f0' },
  stepLineCompleted: { backgroundColor: '#10b981' },
  modalScroll: { paddingHorizontal: 20 },
  stepContainer: { paddingVertical: 10 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: '#334155', marginBottom: 4 },
  stepHint: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  textArea: { height: 88, textAlignVertical: 'top', paddingTop: 11 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  pillSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  pillText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  pillTextSelected: { color: '#fff' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  checkboxLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  kciSubform: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, marginBottom: 10 },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ddd6fe',
    marginBottom: 10,
  },
  photoPickerText: { color: '#7c3aed', fontWeight: '600', fontSize: 14 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageItem: { position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden' },
  imageThumbnail: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 3,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  footerBackBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  footerBackBtnText: { color: '#64748b', fontWeight: '700' },
  footerNextBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  footerNextBtnText: { color: '#fff', fontWeight: '700' },
  footerSaveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  footerSaveBtnText: { color: '#fff', fontWeight: '700' },

  // View modal
  viewContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  imageScrollRow: { marginBottom: 16 },
  viewMainImage: { width: 220, height: 180, borderRadius: 14, marginRight: 10 },
  viewMainPlaceholder: {
    height: 160,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 16,
  },
  placeholderText: { color: '#94a3b8', marginTop: 8 },
  infoSection: { padding: 16 },
  breedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewBreed: { fontSize: 18, fontWeight: '800', color: '#1e1b4b' },
  viewPrice: { fontSize: 18, fontWeight: '800', color: '#7c3aed' },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', width: 120 },
  infoValue: { fontSize: 13, color: '#334155', flex: 1, fontWeight: '500' },
});
