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

  // ── Step 1: Category
  const [formCategory, setFormCategory] = useState('Dog');

  // ── Step 2: Basic Info
  const [formBreed, setFormBreed] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [petQuality, setPetQuality] = useState('Pet Quality');
  // Fish Specific
  const [fishCategory, setFishCategory] = useState('');
  const [fishQuantity, setFishQuantity] = useState('Single');
  const [fishQuantityCount, setFishQuantityCount] = useState('');
  const [fishGender, setFishGender] = useState('Unsexed');
  const [fishSizeCm, setFishSizeCm] = useState('');
  const [fishColorVariant, setFishColorVariant] = useState('');
  const [fishFeedType, setFishFeedType] = useState('Flakes');
  // Bird Specific
  const [birdQuantity, setBirdQuantity] = useState('Single');
  const [birdGender, setBirdGender] = useState('Unsexed');
  const [birdTalkingAbility, setBirdTalkingAbility] = useState(false);
  const [birdFeedType, setBirdFeedType] = useState('Seeds');
  const [birdColorVariant, setBirdColorVariant] = useState('');

  // ── Step 3: Additional Info
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [breedLineage, setBreedLineage] = useState('None');
  const [vaccinationDetails, setVaccinationDetails] = useState('');
  const [kciStatusPet, setKciStatusPet] = useState('Non-KCI Pet');
  const [kciNumber, setKciNumber] = useState('');
  const [kciName, setKciName] = useState('');
  const [microchipNumber, setMicrochipNumber] = useState('');

  // ── Step 4: Pricing & Media
  const [formPrice, setFormPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [formImages, setFormImages] = useState([]);
  const [vaccinationProofImages, setVaccinationProofImages] = useState([]);
  const [kciCertImages, setKciCertImages] = useState([]);
  const [video, setVideo] = useState(null);

  // ── Step 5: Vendor details (auto-filled)
  const [breederName, setBreederName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [location, setLocation] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');
  const [ownerFullAddress, setOwnerFullAddress] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

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
    
    setFishCategory('');
    setFishQuantity('Single');
    setFishQuantityCount('');
    setFishGender('Unsexed');
    setFishSizeCm('');
    setFishColorVariant('');
    setFishFeedType('Flakes');

    setBirdQuantity('Single');
    setBirdGender('Unsexed');
    setBirdTalkingAbility(false);
    setBirdFeedType('Seeds');
    setBirdColorVariant('');

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
    setOwnerName('');
    setOwnerPhoneNumber('');
    setOwnerFullAddress('');
    setAdditionalDetails('');
    setFormImages([]);
    setVaccinationProofImages([]);
    setKciCertImages([]);
    setVideo(null);
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
    
    setFishCategory(pet.fish_category || '');
    setFishQuantity(pet.fish_quantity || 'Single');
    setFishQuantityCount(pet.fish_quantityCount?.toString() || '');
    setFishGender(pet.fish_gender || 'Unsexed');
    setFishSizeCm(pet.fish_sizeCm?.toString() || '');
    setFishColorVariant(pet.fish_colorVariant || '');
    setFishFeedType(pet.fish_feedType || 'Flakes');

    setBirdQuantity(pet.bird_quantity || 'Single');
    setBirdGender(pet.bird_gender || 'Unsexed');
    setBirdTalkingAbility(!!pet.bird_talkingAbility);
    setBirdFeedType(pet.bird_feedType || 'Seeds');
    setBirdColorVariant(pet.bird_colorVariant || '');

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
    setOwnerName(pet.ownerName || '');
    setOwnerPhoneNumber(pet.ownerPhoneNumber || '');
    setOwnerFullAddress(pet.ownerFullAddress || '');
    setAdditionalDetails(pet.details || '');
    setFormImages(pet.images || []);
    setVaccinationProofImages(pet.vaccinationProof || []);
    setKciCertImages(pet.kciCertificate || []);
    setVideo(pet.video || null);
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
        mediaTypes: ['images', 'videos'],
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

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
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

      // Category
      data.append('category', formCategory);
      
      // Basic Info
      data.append('breed', formBreed);
      data.append('gender', formGender);
      data.append('petQuality', petQuality);

      if (formCategory === 'Fish') {
        data.append('fish_category', fishCategory);
        data.append('fish_quantity', fishQuantity);
        if (fishQuantity === 'Group') data.append('fish_quantityCount', fishQuantityCount);
        data.append('fish_gender', fishGender);
        if (fishSizeCm) data.append('fish_sizeCm', fishSizeCm);
        data.append('fish_colorVariant', fishColorVariant);
        data.append('fish_feedType', fishFeedType);
      } else if (formCategory === 'Bird') {
        data.append('bird_quantity', birdQuantity);
        data.append('bird_gender', birdGender);
        data.append('bird_talkingAbility', String(birdTalkingAbility));
        data.append('bird_feedType', birdFeedType);
        data.append('bird_colorVariant', birdColorVariant);
      }

      // Additional Info
      data.append('dateOfBirth', dateOfBirth);
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

      // Pricing & Media
      data.append('price', formPrice);
      data.append('priceNegotiable', String(priceNegotiable));

      // Vendor details
      data.append('breederName', breederName);
      data.append('phoneNumber', phoneNumber);
      data.append('shopAddress', shopAddress);
      data.append('location', location);
      data.append('ownerName', ownerName);
      data.append('ownerPhoneNumber', ownerPhoneNumber);
      data.append('ownerFullAddress', ownerFullAddress);
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

      if (video) {
        if (!video.startsWith('http')) {
          const ext = video.split('.').pop();
          data.append('video', {
            uri: video,
            name: `pet_video.${ext || 'mp4'}`,
            type: `video/${ext === 'mov' ? 'quicktime' : 'mp4'}`,
          });
        } else {
          data.append('existingVideo', video);
        }
      }

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
    const mainPhoto = item.images && item.images.length > 0 ? item.images[0] : null;
    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={styles.cardImage} />
          ) : (
            <View style={styles.placeholderCardImage}>
              <Feather name="image" size={32} color={theme.COLORS.textSecondary} />
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
              <Feather name="info" size={12} color={theme.COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.gender}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color={theme.COLORS.textSecondary} />
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
              <Feather name="eye" size={14} color={theme.COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenEdit(item)}
              style={[styles.cardBtn, styles.editBtn]}>
              <Feather name="edit-2" size={14} color={theme.COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStatusChange(item._id, 'Sold Out')}
              style={[styles.cardBtn, styles.soldOutBtn]}>
              <Feather name="check-circle" size={14} color={theme.COLORS.success} />
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
            placeholder="Search by breed or category..."
            placeholderTextColor={theme.COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <View style={styles.addBtnGradient}>
            <Feather name="plus" size={18} color={theme.COLORS.surface} style={styles.addBtnIcon} />
            <Text style={styles.addBtnText}>Add Pet</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
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
            <Feather name="heart" size={32} color={theme.COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Available Pets</Text>
          <Text style={styles.emptySubtitle}>
            Tap &quot;Add Pet&quot; to create your first listing.
          </Text>
        </View>
      )}

      {/* Form Modal — 5 Steps */}
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
                <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepsIndicator}>
              {[1, 2, 3, 4, 5].map((step) => (
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
                  {step < 5 && (
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
              {/* ── STEP 1: Category Selection ── */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Category Selection</Text>
                  <PillSelector
                    label="Pet Category *"
                    options={CATEGORIES}
                    selected={formCategory}
                    onSelect={setFormCategory}
                  />
                </View>
              )}

              {/* ── STEP 2: Basic Info ── */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Basic Information</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Breed *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formBreed}
                      onChangeText={setFormBreed}
                      placeholder="e.g. Labrador Retriever"
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

                  {/* Fish Specific */}
                  {formCategory === 'Fish' && (
                    <View style={styles.conditionalBlock}>
                      <Text style={styles.sectionSubTitle}>Fish Specific Details</Text>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Fish Category</Text>
                        <TextInput style={styles.textInput} value={fishCategory} onChangeText={setFishCategory} placeholder="Freshwater, Saltwater..." />
                      </View>
                      <PillSelector label="Quantity Type" options={['Single', 'Pair', 'Trio', 'Group']} selected={fishQuantity} onSelect={setFishQuantity} />
                      {fishQuantity === 'Group' && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Quantity Count</Text>
                          <TextInput style={styles.textInput} value={fishQuantityCount} onChangeText={setFishQuantityCount} keyboardType="numeric" />
                        </View>
                      )}
                      <PillSelector label="Fish Gender" options={['Male', 'Female', 'Unsexed', 'Mixed']} selected={fishGender} onSelect={setFishGender} />
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Size (cm)</Text>
                        <TextInput style={styles.textInput} value={fishSizeCm} onChangeText={setFishSizeCm} keyboardType="numeric" />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Color Variant</Text>
                        <TextInput style={styles.textInput} value={fishColorVariant} onChangeText={setFishColorVariant} />
                      </View>
                      <PillSelector label="Feed Type" options={['Flakes', 'Live Food', 'Pellets', 'Frozen']} selected={fishFeedType} onSelect={setFishFeedType} />
                    </View>
                  )}

                  {/* Bird Specific */}
                  {formCategory === 'Bird' && (
                    <View style={styles.conditionalBlock}>
                      <Text style={styles.sectionSubTitle}>Bird Specific Details</Text>
                      <PillSelector label="Quantity" options={['Single', 'Pair']} selected={birdQuantity} onSelect={setBirdQuantity} />
                      <PillSelector label="Gender" options={['Male', 'Female', 'Mixed', 'Unsexed']} selected={birdGender} onSelect={setBirdGender} />
                      <PillSelector label="Feed Type" options={['Seeds', 'Pellets', 'Fruits', 'Hand-feed']} selected={birdFeedType} onSelect={setBirdFeedType} />
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Color Variant</Text>
                        <TextInput style={styles.textInput} value={birdColorVariant} onChangeText={setBirdColorVariant} />
                      </View>
                      <TouchableOpacity style={styles.checkboxContainer} onPress={() => setBirdTalkingAbility(!birdTalkingAbility)}>
                        <View style={[styles.checkbox, birdTalkingAbility ? styles.checkboxChecked : null]}>
                          {birdTalkingAbility && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                        </View>
                        <Text style={styles.checkboxLabel}>Has Talking Ability</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* ── STEP 3: Additional Info ── */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Health & Additional Info</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Date of Birth * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      placeholder="e.g. 2025-03-15"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>

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
                    <Text style={styles.inputLabel}>Microchip Number (15 digits, Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={microchipNumber}
                      onChangeText={setMicrochipNumber}
                      placeholder="Enter 15-digit Microchip No"
                      placeholderTextColor={theme.COLORS.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* ── STEP 4: Pricing & Media ── */}
              {currentStep === 4 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Pricing & Media</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Listing Price (INR) *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={formPrice}
                      onChangeText={setFormPrice}
                      placeholder="e.g. 15000"
                      placeholderTextColor={theme.COLORS.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setPriceNegotiable(!priceNegotiable)}>
                    <View
                      style={[styles.checkbox, priceNegotiable ? styles.checkboxChecked : null]}>
                      {priceNegotiable && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Price is Negotiable</Text>
                  </TouchableOpacity>

                  <ImageGrid
                    label="Pet Photos *"
                    images={formImages}
                    onAdd={() => handlePickImages(setFormImages, formImages, 5)}
                    onRemove={(idx) => handleRemoveImage(setFormImages, idx)}
                  />

                  {/* Single Video Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Pet Video (Optional, max 1)</Text>
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

                  <ImageGrid
                    label="Vaccination Proof"
                    images={vaccinationProofImages}
                    onAdd={() => handlePickImages(setVaccinationProofImages, vaccinationProofImages, 3)}
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

              {/* ── STEP 5: Seller / Vendor Details ── */}
              {currentStep === 5 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>Seller Details</Text>
                  <Text style={styles.stepHint}>
                    Auto-filled from your profile. Edit if needed.
                  </Text>

                  {[
                    { label: 'Breeder / Shop Name *', value: breederName, setter: setBreederName, placeholder: 'Your shop name', keyboard: 'default' },
                    { label: 'Shop Phone Number *', value: phoneNumber, setter: setPhoneNumber, placeholder: '10-digit mobile number', keyboard: 'phone-pad' },
                    { label: 'Location / City *', value: location, setter: setLocation, placeholder: 'City, State', keyboard: 'default' },
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
                    <Text style={styles.inputLabel}>Additional Details / Description</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={additionalDetails}
                      onChangeText={setAdditionalDetails}
                      placeholder="Write notes about temperament, health condition..."
                      placeholderTextColor={theme.COLORS.textSecondary}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
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
              {currentStep < 5 ? (
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
                  <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
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
                    <Feather name="image" size={48} color={theme.COLORS.borderDark} />
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
                    { label: 'Fish Category', value: selectedPet.fish_category },
                    { label: 'Fish Quantity', value: selectedPet.fish_quantity },
                    { label: 'Fish Size (cm)', value: selectedPet.fish_sizeCm },
                    { label: 'Fish Color', value: selectedPet.fish_colorVariant },
                    { label: 'Fish Feed', value: selectedPet.fish_feedType },
                    { label: 'Bird Quantity', value: selectedPet.bird_quantity },
                    { label: 'Bird Color', value: selectedPet.bird_colorVariant },
                    { label: 'Bird Feed', value: selectedPet.bird_feedType },
                    { label: 'KCI Status', value: selectedPet.kciStatusPet },
                    { label: 'KCI Number', value: selectedPet.kciNumber },
                    { label: 'Breeder', value: selectedPet.breederName },
                    { label: 'Shop Address', value: selectedPet.shopAddress },
                    { label: 'Location', value: selectedPet.location },
                    { label: 'Phone', value: selectedPet.phoneNumber },
                    { label: 'Owner Name', value: selectedPet.ownerName },
                    { label: 'Owner Phone', value: selectedPet.ownerPhoneNumber },
                    { label: 'Owner Address', value: selectedPet.ownerFullAddress },
                    { label: 'Additional Details', value: selectedPet.details },
                  ].map(({ label, value }) =>
                    value ? (
                      <View key={label} style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{label}:</Text>
                        <Text style={styles.infoValue}>{value}</Text>
                      </View>
                    ) : null
                  )}

                  {/* Render Video Links */}
                  {selectedPet.video ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Video:</Text>
                      <Text style={[styles.infoValue, { color: theme.COLORS.primary }]}>Attached Video Available</Text>
                    </View>
                  ) : null}

                  {/* Render Certificates Count */}
                  {selectedPet.kciCertificate && selectedPet.kciCertificate.length > 0 ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>KCI Certs:</Text>
                      <Text style={styles.infoValue}>{selectedPet.kciCertificate.length} Documents</Text>
                    </View>
                  ) : null}

                  {selectedPet.vaccinationProof && selectedPet.vaccinationProof.length > 0 ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Vaccination Proofs:</Text>
                      <Text style={styles.infoValue}>{selectedPet.vaccinationProof.length} Documents</Text>
                    </View>
                  ) : null}
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
  container: { flex: 1, backgroundColor: theme.COLORS.canvas },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.SIZES.md, gap: 10, paddingHorizontal: theme.SIZES.md, paddingTop: theme.SIZES.md },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: theme.TEXT.body.fontSize, color: theme.COLORS.text, fontWeight: theme.FONTS.medium },
  addBtn: { borderRadius: theme.RADIUS.lg, overflow: 'hidden' },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: theme.COLORS.primary,
  },
  addBtnIcon: { marginRight: 6 },
  addBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold, fontSize: theme.TEXT.body.fontSize },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { color: theme.COLORS.textSecondary, fontSize: theme.TEXT.body.fontSize },
  listContent: { paddingBottom: 20, gap: 12, paddingHorizontal: theme.SIZES.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { ...theme.TEXT.h2 },
  emptySubtitle: { ...theme.TEXT.bodySecondary, textAlign: 'center' },

  card: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    ...theme.SHADOWS.sm,
  },
  imageWrapper: { position: 'relative', width: 100 },
  cardImage: { width: 100, height: 110 },
  placeholderCardImage: {
    width: 100,
    height: 110,
    backgroundColor: theme.COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPriceBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardPriceText: { color: theme.COLORS.surface, fontSize: 11, fontWeight: theme.FONTS.bold },
  cardDetails: { flex: 1, padding: 10 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardBreed: { fontSize: 14, fontWeight: theme.FONTS.bold, color: theme.COLORS.text, flex: 1 },
  categoryBadge: {
    backgroundColor: theme.COLORS.primary + '15',
    borderRadius: theme.RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: { color: theme.COLORS.primary, fontSize: 11, fontWeight: theme.FONTS.bold },
  cardMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: theme.COLORS.textSecondary },
  cardDivider: { height: 1, backgroundColor: theme.COLORS.borderLight, marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  cardBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtn: { backgroundColor: theme.COLORS.primary + '15' },
  editBtn: { backgroundColor: theme.COLORS.secondary + '20' },
  soldOutBtn: { backgroundColor: theme.COLORS.success + '20' },
  trashBtn: { backgroundColor: theme.COLORS.error + '20' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.borderLight,
  },
  modalTitle: { ...theme.TEXT.h3 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.COLORS.canvas,
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
    backgroundColor: theme.COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: theme.COLORS.primary },
  stepDotCompleted: { backgroundColor: theme.COLORS.success },
  stepDotText: { fontSize: 12, fontWeight: theme.FONTS.bold, color: theme.COLORS.textSecondary },
  stepDotTextActive: { color: theme.COLORS.surface },
  stepLine: { width: 28, height: 2, backgroundColor: theme.COLORS.border },
  stepLineCompleted: { backgroundColor: theme.COLORS.success },
  modalScroll: { paddingHorizontal: theme.SIZES.lg },
  stepContainer: { paddingVertical: 10 },
  stepTitle: { ...theme.TEXT.h3, marginBottom: 4 },
  stepHint: { ...theme.TEXT.label, color: theme.COLORS.textSecondary, marginBottom: 14 },
  inputGroup: { marginBottom: theme.SIZES.md },
  inputLabel: {
    ...theme.TEXT.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  textArea: { height: 88, textAlignVertical: 'top', paddingTop: 11 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.RADIUS.xxl,
    backgroundColor: theme.COLORS.canvas,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
  },
  pillSelected: { backgroundColor: theme.COLORS.primary, borderColor: theme.COLORS.primary },
  pillText: { ...theme.TEXT.bodySecondary, fontWeight: theme.FONTS.semiBold },
  pillTextSelected: { color: theme.COLORS.surface },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.RADIUS.sm,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: theme.COLORS.primary, borderColor: theme.COLORS.primary },
  checkboxLabel: { ...theme.TEXT.body, fontWeight: theme.FONTS.medium },
  kciSubform: { backgroundColor: theme.COLORS.success + '10', borderRadius: theme.RADIUS.lg, padding: 14, marginBottom: 10 },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.COLORS.primary + '10',
    borderRadius: theme.RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.COLORS.primary + '30',
    marginBottom: 10,
  },
  photoPickerText: { color: theme.COLORS.primary, fontWeight: theme.FONTS.semiBold, fontSize: theme.TEXT.body.fontSize },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageItem: { position: 'relative', width: 72, height: 72, borderRadius: theme.RADIUS.md, overflow: 'hidden' },
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
    padding: theme.SIZES.md,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.borderLight,
    gap: 12,
  },
  footerBackBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    alignItems: 'center',
  },
  footerBackBtnText: { color: theme.COLORS.textSecondary, fontWeight: theme.FONTS.bold },
  footerNextBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.primary,
    alignItems: 'center',
  },
  footerNextBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold },
  footerSaveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.success,
    alignItems: 'center',
  },
  footerSaveBtnText: { color: theme.COLORS.surface, fontWeight: theme.FONTS.bold },

  // View modal
  viewContainer: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    maxHeight: '90%',
  },
  imageScrollRow: { marginBottom: theme.SIZES.md },
  viewMainImage: { width: 220, height: 180, borderRadius: theme.RADIUS.lg, marginRight: 10 },
  viewMainPlaceholder: {
    height: 160,
    backgroundColor: theme.COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.RADIUS.lg,
    marginBottom: theme.SIZES.md,
  },
  placeholderText: { ...theme.TEXT.bodySecondary, marginTop: 8 },
  infoSection: { padding: theme.SIZES.md },
  breedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewBreed: { ...theme.TEXT.h2 },
  viewPrice: { ...theme.TEXT.h2, color: theme.COLORS.primary },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.borderLight,
  },
  infoLabel: { ...theme.TEXT.label, width: 120 },
  infoValue: { ...theme.TEXT.bodySecondary, flex: 1, fontWeight: theme.FONTS.medium },
});
