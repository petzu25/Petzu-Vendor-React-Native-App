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
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import theme from '../../constants/theme';

const CATEGORIES = ['Dog', 'Cat'];
const GENDERS = ['Male', 'Female'];
const QUALITIES = ['Show Quality', 'Pet Quality', 'Breeder Quality'];
const LINEAGES = ['Champion Lineage', 'Import Lineage', 'Standard Lineage', 'None'];
const KCI_STATUSES = ['KCI Pet', 'Non-KCI Pet'];

export default function MatingPets() {
  const { authUser } = useAuthStore();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // ── Form Fields ──
  const [formBreedName, setFormBreedName] = useState('');
  const [formCategory, setFormCategory] = useState('Dog');
  const [formGender, setFormGender] = useState('Male');
  const [petName, setPetName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [petQuality, setPetQuality] = useState('Pet Quality');
  const [breedLineage, setBreedLineage] = useState('None');
  const [vaccinationDetails, setVaccinationDetails] = useState('');
  const [kciStatusPet, setKciStatusPet] = useState('Non-KCI Pet');
  const [kciNumber, setKciNumber] = useState('');
  const [kciName, setKciName] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [breederName, setBreederName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');
  const [ownerFullAddress, setOwnerFullAddress] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const [formImages, setFormImages] = useState([]);
  const [vaccinationProof, setVaccinationProof] = useState([]);
  const [kciCertImages, setKciCertImages] = useState([]);
  const [video, setVideo] = useState(null);

  // View Details Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/matingpets/getAllMatingPets');
      if (res.data && res.data.data) {
        setPets(res.data.data);
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error('Error fetching mating pets:', error);
      Alert.alert('Error', 'Failed to load mating listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPet(null);
    setFormBreedName('');
    setFormCategory('Dog');
    setFormGender('Male');
    setPetName('');
    setDateOfBirth('');
    setFormLocation(authUser?.location || '');
    setFormPrice('');
    setPetQuality('Pet Quality');
    setBreedLineage('None');
    setVaccinationDetails('');
    setKciStatusPet('Non-KCI Pet');
    setKciNumber('');
    setKciName('');
    setMicrochipNumber('');
    setBreederName(authUser?.fullName || '');
    setPhoneNum(authUser?.phoneNumber || '');
    setShopAddress(authUser?.shopAddress || '');
    setOwnerName('');
    setOwnerPhoneNumber('');
    setOwnerFullAddress('');
    setFormDescription('');
    setFormImages([]);
    setVaccinationProof([]);
    setKciCertImages([]);
    setVideo(null);
    setCurrentStep(1);
    setModalVisible(true);
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setFormBreedName(pet.breedName || '');
    setFormCategory(pet.category || 'Dog');
    setFormGender(pet.gender || 'Male');
    setPetName(pet.petName || '');
    setDateOfBirth(pet.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split('T')[0] : '');
    setFormLocation(pet.location || '');
    setFormPrice(pet.price?.toString() || '');
    setPetQuality(pet.petQuality || 'Pet Quality');
    setBreedLineage(pet.breedLineage || 'None');
    setVaccinationDetails(pet.vaccinationDetails || '');
    setKciStatusPet(pet.kciStatusPet || 'Non-KCI Pet');
    setKciNumber(pet.kciNumber || '');
    setKciName(pet.kciName || '');
    setMicrochipNumber(pet.microchipNumber || '');
    setBreederName(pet.breederName || authUser?.fullName || '');
    setPhoneNum(pet.phoneNum || authUser?.phoneNumber || '');
    setShopAddress(pet.shopAddress || authUser?.shopAddress || '');
    setOwnerName(pet.ownerName || '');
    setOwnerPhoneNumber(pet.ownerPhoneNumber || '');
    setOwnerFullAddress(pet.ownerFullAddress || '');
    setFormDescription(pet.description || '');
    setFormImages(pet.photosAndVideos || []);
    setVaccinationProof(pet.vaccinationProof || []);
    setKciCertImages(pet.kciCertificate || []);
    setVideo(pet.video || null);
    setCurrentStep(1);
    setModalVisible(true);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handlePickImages = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const picked = result.assets.map((asset) => asset.uri);
        if (type === 'images') {
          setFormImages((prev) => [...prev, ...picked].slice(0, 5));
        } else {
          setVaccinationProof((prev) => [...prev, ...picked].slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const handleRemoveImage = (index, type) => {
    if (type === 'images') {
      setFormImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVaccinationProof((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAvailabilityToggle = async (pet) => {
    const nextAvailability = pet.availability === 'available' ? 'unavailable' : 'available';
    try {
      setLoading(true);
      await axios.put(`/matingpets/${pet._id}`, { availability: nextAvailability });
      Alert.alert('Success', `Mating availability set to ${nextAvailability}`);
      fetchPets();
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update mating availability.');
      setLoading(false);
    }
  };

  const handleDelete = (petId) => {
    Alert.alert('Move to Trash', 'Are you sure you want to delete this mating listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await axios.delete(`/matingpets/${petId}`);
            Alert.alert('Success', 'Mating listing deleted successfully');
            fetchPets();
          } catch (error) {
            console.error('Error deleting mating pet:', error);
            Alert.alert('Error', 'Failed to delete listing.');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!formBreedName || !dateOfBirth || !formLocation) {
      Alert.alert('Validation Error', 'Breed Name, Date of Birth, and Location are required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Required fields
      data.append('breedName', formBreedName);
      data.append('category', formCategory);
      data.append('gender', formGender);
      data.append('dateOfBirth', dateOfBirth);
      data.append('location', formLocation);
      data.append('petQuality', petQuality);
      data.append('breedLineage', breedLineage);
      data.append('vaccinationDetails', vaccinationDetails);
      data.append('kciStatusPet', kciStatusPet);
      if (petName) data.append('petName', petName);
      if (formPrice) data.append('price', formPrice);
      if (kciStatusPet === 'KCI Pet') {
        data.append('kciNumber', kciNumber);
        data.append('kciName', kciName);
      }
      if (microchipNumber) data.append('microchipNumber', microchipNumber);
      // Breeder details
      data.append('breederName', breederName);
      data.append('phoneNum', phoneNum);
      if (shopAddress) data.append('shopAddress', shopAddress);
      data.append('ownerName', ownerName);
      data.append('ownerPhoneNumber', ownerPhoneNumber);
      data.append('ownerFullAddress', ownerFullAddress);
      if (formDescription) data.append('description', formDescription);

      // Pet images
      const localUris = formImages.filter((uri) => !uri.startsWith('http'));
      const existingUrls = formImages.filter((uri) => uri.startsWith('http'));
      existingUrls.forEach((url) => data.append('existingPhotosAndVideos', url));
      localUris.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('images', {
          uri,
          name: `mating_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      // Vaccination proof
      const localVax = vaccinationProof.filter((uri) => !uri.startsWith('http'));
      const existingVax = vaccinationProof.filter((uri) => uri.startsWith('http'));
      existingVax.forEach((url) => data.append('existingVaccinationProofs', url));
      localVax.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('vaccinationProof', {
          uri,
          name: `vax_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      // KCI Certificate
      const localKci = kciCertImages.filter((uri) => !uri.startsWith('http'));
      const existingKci = kciCertImages.filter((uri) => uri.startsWith('http'));
      existingKci.forEach((url) => data.append('existingKciCertificates', url));
      localKci.forEach((uri, idx) => {
        const ext = uri.split('.').pop();
        data.append('kciCertificate', {
          uri,
          name: `kci_${idx}.${ext || 'jpg'}`,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
        });
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingPet) {
        await axios.put(`/matingpets/${editingPet._id}`, data, config);
        Alert.alert('Success', 'Mating listing updated successfully');
      } else {
        await axios.post('/matingpets', data, config);
        Alert.alert('Success', 'Mating listing added successfully');
      }

      setModalVisible(false);
      fetchPets();
    } catch (error) {
      console.error('Error saving mating pet:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save mating pet.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPets = pets.filter(
    (pet) =>
      (pet.breedName || pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <Feather name="camera" size={22} color={theme.COLORS.primary} />
        <Text style={styles.photoPickerText}>Select From Gallery</Text>
      </TouchableOpacity>
      {images.length > 0 && (
        <View style={styles.imagesGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri }} style={styles.imageThumbnail} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => onRemove(index)}>
                <Feather name="x" size={14} color={theme.COLORS.surface} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPetCard = ({ item }) => {
    const mainPhoto =
      item.photosAndVideos && item.photosAndVideos.length > 0 ? item.photosAndVideos[0] : null;
    const isAvailable = item.availability?.toLowerCase() === 'available';

    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={styles.cardImage} />
          ) : (
            <View style={styles.placeholderCardImage}>
              <Feather name="image" size={32} color={theme.COLORS.borderDark} />
            </View>
          )}
          <View
            style={[
              styles.availabilityBadge,
              isAvailable ? styles.badgeActive : styles.badgeInactive,
            ]}>
            <Text style={styles.availabilityBadgeText}>
              {isAvailable ? 'ACTIVE STUD' : 'INACTIVE'}
            </Text>
          </View>
          <View style={styles.cardPriceBadge}>
            <Text style={styles.cardPriceText}>
              {item.price ? `₹${item.price.toLocaleString()}` : 'Contact for Price'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardBreed} numberOfLines={1}>
              {item.breedName || 'Unknown Stud'}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>

          <View style={styles.cardMetaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={theme.COLORS.textSecondary} />
              <Text style={styles.metaText}>Age: {item.age}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color={theme.COLORS.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.location}
              </Text>
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
              <Feather name="eye" size={14} color={theme.COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOpenEdit(item)}
              style={[styles.cardBtn, styles.editBtn]}>
              <Feather name="edit-2" size={14} color={theme.COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAvailabilityToggle(item)}
              style={[
                styles.cardBtn,
                isAvailable ? styles.activeToggleBtn : styles.inactiveToggleBtn,
              ]}
              title={isAvailable ? 'Set Inactive' : 'Set Active'}>
              <Feather
                name={isAvailable ? 'pause' : 'play'}
                size={14}
                color={isAvailable ? '#f59e0b' : '#10b981'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={[styles.cardBtn, styles.trashBtn]}>
              <Feather name="trash-2" size={14} color={theme.COLORS.error} />
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
          <Feather name="search" size={16} color={theme.COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mating listings..."
            placeholderTextColor={theme.COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <View style={styles.addBtnGradient}>
            <Feather name="plus" size={18} color={theme.COLORS.surface} style={styles.addBtnIcon} />
            <Text style={styles.addBtnText}>Add Mating</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Fetching mating profiles...</Text>
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
            <Feather name="activity" size={32} color={theme.COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Mating Profiles</Text>
          <Text style={styles.emptySubtitle}>
            List your stud pets for professional breeding sessions.
          </Text>
        </View>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPet ? 'Edit Mating Stud' : 'Register Stud for Mating'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Step Indicator */}
              <View style={styles.stepsIndicator}>
                {[1, 2, 3].map((step) => (
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
                        <Feather name="check" size={10} color={theme.COLORS.surface} />
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
                    {step < 3 && (
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

              {/* ── STEP 1: Pet Details & Media ── */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Pet Details & Media</Text>
                  
                  <PillSelector
                    label="Pet Category *"
                    options={CATEGORIES}
                    selected={formCategory}
                    onSelect={setFormCategory}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Breed Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formBreedName}
                      onChangeText={setFormBreedName}
                      placeholder="e.g. Siberian Husky"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Pet Name (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={petName}
                      onChangeText={setPetName}
                      placeholder="e.g. Max"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>

                  <PillSelector
                    label="Gender *"
                    options={GENDERS}
                    selected={formGender}
                    onSelect={setFormGender}
                  />

                  <PillSelector
                    label="Pet Quality"
                    options={QUALITIES}
                    selected={petQuality}
                    onSelect={setPetQuality}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mating Fee (INR - Leave blank if negotiable)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formPrice}
                      onChangeText={setFormPrice}
                      placeholder="e.g. 10000"
                      placeholderTextColor={theme.COLORS.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <ImageGrid
                    label="Stud Photos"
                    images={formImages}
                    onAdd={() => handlePickImages('images')}
                    onRemove={(idx) => handleRemoveImage(idx, 'images')}
                    limit={5}
                  />

                  {/* Single Video Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Stud Video (Optional, max 1)</Text>
                    {!video ? (
                      <TouchableOpacity style={styles.photoPicker} onPress={async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') return Alert.alert('Permission Denied');
                        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsMultipleSelection: false });
                        if (!res.canceled && res.assets) setVideo(res.assets[0].uri);
                      }}>
                        <Feather name="video" size={22} color={theme.COLORS.primary} />
                        <Text style={styles.photoPickerText}>Select Video</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.imageItem}>
                        <View style={styles.placeholderCardImage}>
                          <Feather name="video" size={32} color={theme.COLORS.primary} />
                        </View>
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => setVideo(null)}>
                          <Feather name="x" size={14} color={theme.COLORS.surface} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* ── STEP 2: Health & Availability ── */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Health & Lineage</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>

                  <PillSelector
                    label="Breeding Lineage"
                    options={LINEAGES}
                    selected={breedLineage}
                    onSelect={setBreedLineage}
                  />

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Vaccination Status / Details</Text>
                    <TextInput
                      style={styles.textInput}
                      value={vaccinationDetails}
                      onChangeText={setVaccinationDetails}
                      placeholder="e.g. Fully vaccinated"
                      placeholderTextColor={theme.COLORS.textSecondary}
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
                          placeholderTextColor={theme.COLORS.textSecondary}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>KCI Registered Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={kciName}
                          onChangeText={setKciName}
                          placeholder="Enter Registered Name"
                          placeholderTextColor={theme.COLORS.textSecondary}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Microchip Number (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={microchipNumber}
                      onChangeText={setMicrochipNumber}
                      placeholder="15-digit Microchip No"
                      placeholderTextColor={theme.COLORS.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <ImageGrid
                    label="Vaccination Proof"
                    images={vaccinationProof}
                    onAdd={() => handlePickImages('vax')}
                    onRemove={(idx) => handleRemoveImage(idx, 'vax')}
                    limit={3}
                  />
                  
                  {kciStatusPet === 'KCI Pet' && (
                    <ImageGrid
                      label="KCI Certificate"
                      images={kciCertImages}
                      onAdd={() => handlePickImages('kci')}
                      onRemove={(idx) => handleRemoveImage(idx, 'kci')}
                      limit={3}
                    />
                  )}
                </View>
              )}

              {/* ── STEP 3: Owner & Location ── */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Owner & Location</Text>

                  {[
                    { label: 'Breeder / Shop Name *', value: breederName, setter: setBreederName, placeholder: 'Your shop name', keyboard: 'default' },
                    { label: 'Shop Phone Number *', value: phoneNum, setter: setPhoneNum, placeholder: '10-digit mobile number', keyboard: 'phone-pad' },
                    { label: 'Stud Location *', value: formLocation, setter: setFormLocation, placeholder: 'City, State', keyboard: 'default' },
                    { label: 'Shop Address', value: shopAddress, setter: setShopAddress, placeholder: 'Complete shop address', keyboard: 'default' },
                  ].map(({ label, value, setter, placeholder, keyboard }) => (
                    <View key={label} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{label}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setter}
                        placeholder={placeholder}
                        placeholderTextColor={theme.COLORS.textSecondary}
                        keyboardType={keyboard}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}

                  <Text style={[styles.sectionSubTitle, { marginTop: 10 }]}>Actual Pet Owner Details (If different)</Text>
                  {[
                    { label: 'Owner Name', value: ownerName, setter: setOwnerName, placeholder: 'e.g. John Doe', keyboard: 'default' },
                    { label: 'Owner Phone Number', value: ownerPhoneNumber, setter: setOwnerPhoneNumber, placeholder: '10-digit mobile number', keyboard: 'phone-pad' },
                    { label: 'Owner Full Address', value: ownerFullAddress, setter: setOwnerFullAddress, placeholder: 'Complete owner address', keyboard: 'default' },
                  ].map(({ label, value, setter, placeholder, keyboard }) => (
                    <View key={label} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{label}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={setter}
                        placeholder={placeholder}
                        placeholderTextColor={theme.COLORS.textSecondary}
                        keyboardType={keyboard}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Stud Features & Details</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={formDescription}
                      onChangeText={setFormDescription}
                      placeholder="Describe your stud's line, health, temperament, etc."
                      placeholderTextColor={theme.COLORS.textSecondary}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>
              )}

              {/* Footer */}
              <View style={styles.modalFooter}>
                {currentStep > 1 ? (
                  <TouchableOpacity style={styles.footerBackBtn} onPress={prevStep}>
                    <Text style={styles.footerBackBtnText}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                {currentStep < 3 ? (
                  <TouchableOpacity style={styles.footerNextBtn} onPress={nextStep}>
                    <Text style={styles.footerNextBtnText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.footerSaveBtn}
                    onPress={handleSave}
                    disabled={submitting}>
                    {submitting ? (
                      <ActivityIndicator size="small" color={theme.COLORS.surface} />
                    ) : (
                      <Text style={styles.footerSaveBtnText}>Register Stud Profile</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
</ScrollView>
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
                <Text style={styles.modalTitle}>Stud Profile Details</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setViewModalVisible(false)}>
                  <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.viewScroll}>
                {selectedPet.photosAndVideos && selectedPet.photosAndVideos.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollRow}>
                    {selectedPet.photosAndVideos.map((url, i) => (
                      <Image key={i} source={{ uri: url }} style={styles.viewMainImage} />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.viewMainPlaceholder}>
                    <Feather name="image" size={48} color={theme.COLORS.borderDark} />
                    <Text style={styles.placeholderText}>No Photos Available</Text>
                  </View>
                )}

                <View style={styles.infoSection}>
                  <View style={styles.breedPriceRow}>
                    <Text style={styles.viewBreed}>{selectedPet.breedName || 'Unknown Stud'}</Text>
                    <Text style={styles.viewPrice}>
                      {selectedPet.price
                        ? `₹${selectedPet.price.toLocaleString()}`
                        : 'Negotiable Fee'}
                    </Text>
                  </View>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{selectedPet.category}</Text>
                    </View>
                    <View
                      style={[
                        styles.badgeInfo,
                        selectedPet.availability === 'available'
                          ? styles.badgeActive
                          : styles.badgeInactive,
                      ]}>
                      <Text style={styles.badgeInfoText}>
                        {selectedPet.availability === 'available' ? 'Active stud' : 'Inactive'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCardGrid}>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Age</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.age || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Location</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.location || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Shop/Breeder</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.breederName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Shop Phone</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.phoneNum || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Owner Name</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.ownerName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Owner Phone</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.ownerPhoneNumber || 'N/A'}</Text>
                    </View>
                  </View>

                  {selectedPet.vaccinationProof && selectedPet.vaccinationProof.length > 0 && (
                    <View style={styles.vaxSection}>
                      <Text style={styles.descriptionHeader}>Vaccination Proof Certificates</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.vaxScrollRow}>
                        {selectedPet.vaccinationProof.map((url, i) => (
                          <Image key={i} source={{ uri: url }} style={styles.vaxThumb} />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <Text style={styles.descriptionHeader}>Stud Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedPet.description || 'No description provided.'}
                  </Text>
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
  kciSubform: { backgroundColor: theme.COLORS.success + '10', borderRadius: theme.RADIUS.lg, padding: 14, marginBottom: 10 },
  pillTextSelected: { color: theme.COLORS.surface },
  pillText: { ...theme.TEXT.bodySecondary, fontWeight: theme.FONTS.semiBold },
  pillSelected: { backgroundColor: theme.COLORS.primary, borderColor: theme.COLORS.primary },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.RADIUS.xxl,
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  footerSaveBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold },
  footerSaveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.success,
    alignItems: 'center',
  },
  footerNextBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold },
  footerNextBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
    alignItems: 'center',
  },
  footerBackBtnText: { color: theme.COLORS.textSecondary, fontWeight: theme.FONTS.bold },
  footerBackBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.SIZES.md,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.borderLight,
    gap: 12,
  },
  stepHint: { ...theme.TEXT.label, color: theme.COLORS.textSecondary, marginBottom: 14 },
  stepTitle: { ...theme.TEXT.h3, marginBottom: 4 },
  stepContainer: { paddingVertical: 10 },
  stepLineCompleted: { backgroundColor: theme.COLORS.success },
  stepLine: { width: 28, height: 2, backgroundColor: theme.COLORS.border },
  stepDotTextActive: { color: theme.COLORS.surface },
  stepDotText: { fontSize: 12, fontWeight: theme.FONTS.bold, color: theme.COLORS.textSecondary },
  stepDotCompleted: { backgroundColor: theme.COLORS.success },
  stepDotActive: { backgroundColor: theme.COLORS.primary },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorRow: { flexDirection: 'row', alignItems: 'center' },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SIZES.md,
    gap: 12,
    paddingHorizontal: theme.SIZES.md,
    paddingTop: theme.SIZES.md,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    height: theme.SIZES.inputHeight,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
    fontWeight: theme.FONTS.medium,
  },
  addBtn: {
    borderRadius: theme.RADIUS.lg,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: theme.SIZES.inputHeight,
    backgroundColor: theme.COLORS.primary,
  },
  addBtnIcon: {
    marginRight: 6,
  },
  addBtnText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SIZES.lg,
  },
  loadingText: {
    marginTop: theme.SIZES.sm,
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: theme.SIZES.md,
  },
  card: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    marginBottom: theme.SIZES.md,
    overflow: 'hidden',
    ...theme.SHADOWS.sm,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.COLORS.canvas,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.RADIUS.xxl,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: theme.COLORS.success + '20',
    borderColor: theme.COLORS.success + '40',
  },
  badgeInactive: {
    backgroundColor: theme.COLORS.error + '20',
    borderColor: theme.COLORS.error + '40',
  },
  availabilityBadgeText: {
    fontSize: 10,
    fontWeight: theme.FONTS.black,
    letterSpacing: 0.5,
    color: theme.COLORS.success,
  },
  cardPriceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.md,
  },
  cardPriceText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
  cardDetails: {
    padding: theme.SIZES.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBreed: {
    ...theme.TEXT.h3,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: theme.COLORS.primary + '15',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.RADIUS.xxl,
    borderWidth: 1,
    borderColor: theme.COLORS.primary + '30',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: theme.FONTS.bold,
    color: theme.COLORS.primary,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.medium,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.COLORS.borderLight,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cardBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  viewBtn: {
    backgroundColor: theme.COLORS.primary + '15',
    borderColor: theme.COLORS.primary + '30',
  },
  editBtn: {
    backgroundColor: theme.COLORS.secondary + '20',
    borderColor: theme.COLORS.secondary + '40',
  },
  activeToggleBtn: {
    backgroundColor: theme.COLORS.warning + '20',
    borderColor: theme.COLORS.warning + '40',
  },
  inactiveToggleBtn: {
    backgroundColor: theme.COLORS.success + '20',
    borderColor: theme.COLORS.success + '40',
  },
  trashBtn: {
    backgroundColor: theme.COLORS.error + '20',
    borderColor: theme.COLORS.error + '40',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.SIZES.xl,
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xxl,
    marginTop: 20,
    minHeight: 250,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.SIZES.md,
  },
  emptyTitle: {
    ...theme.TEXT.h2,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...theme.TEXT.bodySecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    height: '85%',
    paddingTop: 20,
    ...theme.SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.SIZES.lg,
    paddingBottom: theme.SIZES.md,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  modalTitle: {
    ...theme.TEXT.h3,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: theme.SIZES.lg,
  },
  inputLabel: {
    ...theme.TEXT.label,
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.SIZES.md,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.COLORS.canvas,
    borderRadius: theme.RADIUS.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  categoryPillSelected: {
    backgroundColor: theme.COLORS.primary + '15',
    borderColor: theme.COLORS.primary,
  },
  categoryPillText: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  categoryPillTextSelected: {
    color: theme.COLORS.primary,
  },
  inputGroup: {
    marginBottom: theme.SIZES.md,
  },
  textInput: {
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: 12,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },
  photoPicker: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: theme.COLORS.primary + '40',
    borderStyle: 'dashed',
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary + '10',
    marginBottom: theme.SIZES.md,
    flexDirection: 'row',
    gap: 8,
  },
  photoPickerText: {
    ...theme.TEXT.label,
    color: theme.COLORS.primary,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.SIZES.md,
  },
  imageItem: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: theme.RADIUS.md,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSaveBtnLarge: {
    paddingVertical: 14,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerSaveBtnTextLarge: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
  // View Details Modal Styling
  viewContainer: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    height: '90%',
    paddingTop: 20,
  },
  viewScroll: {
    flex: 1,
  },
  imageScrollRow: {
    paddingHorizontal: theme.SIZES.lg,
    marginVertical: theme.SIZES.md,
  },
  viewMainImage: {
    width: 280,
    height: 180,
    borderRadius: theme.RADIUS.lg,
    marginRight: 12,
    resizeMode: 'cover',
  },
  viewMainPlaceholder: {
    height: 180,
    backgroundColor: theme.COLORS.canvas,
    marginHorizontal: theme.SIZES.lg,
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    marginVertical: theme.SIZES.md,
  },
  placeholderText: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
    marginTop: 8,
  },
  infoSection: {
    paddingHorizontal: theme.SIZES.lg,
    paddingBottom: 40,
  },
  breedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  viewBreed: {
    ...theme.TEXT.h2,
    flex: 1,
    marginRight: 16,
  },
  viewPrice: {
    ...theme.TEXT.h2,
    color: theme.COLORS.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeInfo: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.RADIUS.xxl,
    borderWidth: 1,
  },
  badgeInfoText: {
    ...theme.TEXT.label,
    color: theme.COLORS.success,
  },
  infoCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  infoCardItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.COLORS.canvas,
    padding: 12,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  infoCardLabel: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoCardVal: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
  },
  vaxSection: {
    marginBottom: 24,
  },
  vaxScrollRow: {
    marginVertical: 10,
  },
  vaxThumb: {
    width: 120,
    height: 80,
    borderRadius: theme.RADIUS.md,
    marginRight: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  descriptionHeader: {
    ...theme.TEXT.h3,
    marginBottom: 8,
  },
  descriptionText: {
    ...theme.TEXT.bodySecondary,
    lineHeight: 22,
  },
});
