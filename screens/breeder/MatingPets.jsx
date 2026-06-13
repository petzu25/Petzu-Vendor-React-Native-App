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
  // Breeder details (auto-filled)
  const [breederName, setBreederName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const [formImages, setFormImages] = useState([]);
  const [vaccinationProof, setVaccinationProof] = useState([]);
  const [kciCertImages, setKciCertImages] = useState([]);

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
    setFormDescription('');
    setFormImages([]);
    setVaccinationProof([]);
    setKciCertImages([]);
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
    setFormDescription(pet.description || '');
    setFormImages(pet.photosAndVideos || []);
    setVaccinationProof(pet.vaccinationProof || []);
    setKciCertImages(pet.kciCertificate || []);
    setModalVisible(true);
  };

  const handlePickImages = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
              <Feather name="image" size={32} color="#cbd5e1" />
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
              <Feather name="clock" size={12} color="#64748b" />
              <Text style={styles.metaText}>Age: {item.age}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={12} color="#64748b" />
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
              <Feather name="eye" size={14} color="#7c3aed" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleOpenEdit(item)}
              style={[styles.cardBtn, styles.editBtn]}>
              <Feather name="edit-2" size={14} color="#2563eb" />
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
            placeholder="Search mating listings..."
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
            <Text style={styles.addBtnText}>Add Mating</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7c3aed" />
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
            <Feather name="activity" size={32} color="#7c3aed" />
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
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Pet Category *</Text>
              <View style={styles.pillContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      formCategory === cat ? styles.categoryPillSelected : null,
                    ]}
                    onPress={() => setFormCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        formCategory === cat ? styles.categoryPillTextSelected : null,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Breed Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formBreedName}
                  onChangeText={setFormBreedName}
                  placeholder="e.g. Siberian Husky"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Date of Birth *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Stud Location *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formLocation}
                    onChangeText={setFormLocation}
                    placeholder="e.g. Gachibowli, Hyd"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mating Fee (INR - Leave blank if negotiable)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="e.g. 10000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stud Photos (Max 5)</Text>
                <TouchableOpacity
                  style={styles.photoPicker}
                  onPress={() => handlePickImages('images')}>
                  <Feather name="camera" size={20} color="#7c3aed" />
                  <Text style={styles.photoPickerText}>Add Stud Photos</Text>
                </TouchableOpacity>

                <View style={styles.imagesGrid}>
                  {formImages.map((uri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri }} style={styles.imageThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => handleRemoveImage(index, 'images')}>
                        <Feather name="x" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vaccination Proof Certificates</Text>
                <TouchableOpacity
                  style={styles.photoPicker}
                  onPress={() => handlePickImages('vax')}>
                  <Feather name="shield" size={20} color="#10b981" />
                  <Text style={[styles.photoPickerText, { color: '#10b981' }]}>
                    Upload Vaccination Proof
                  </Text>
                </TouchableOpacity>

                <View style={styles.imagesGrid}>
                  {vaccinationProof.map((uri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri }} style={styles.imageThumbnail} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => handleRemoveImage(index, 'vax')}>
                        <Feather name="x" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stud Features & Details</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Describe your stud's line, health, certificates (KCI), temperament, etc."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.footerSaveBtnLarge}
                onPress={handleSave}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.footerSaveBtnTextLarge}>Register Stud Profile</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
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
                  <Feather name="x" size={20} color="#64748b" />
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
                    <Feather name="image" size={48} color="#cbd5e1" />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  addBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
  },
  addBtnIcon: {
    marginRight: 6,
  },
  addBtnText: {
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
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  imageWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f8fafc',
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
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  availabilityBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#065f46',
  },
  cardPriceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cardPriceText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  cardDetails: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBreed: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
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
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
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
  cardBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  viewBtn: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  activeToggleBtn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  inactiveToggleBtn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  trashBtn: {
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
    backgroundColor: '#f5f3ff',
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
  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
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
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
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
    backgroundColor: '#f5f3ff',
    borderColor: '#a78bfa',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextSelected: {
    color: '#7c3aed',
  },
  inputGroup: {
    marginBottom: 16,
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
    borderWidth: 2,
    borderColor: '#ddd6fe',
    borderStyle: 'dashed',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  photoPickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSaveBtnLarge: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerSaveBtnTextLarge: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  // View Details Modal Styling
  viewContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '90%',
    paddingTop: 20,
  },
  viewScroll: {
    flex: 1,
  },
  imageScrollRow: {
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  viewMainImage: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    resizeMode: 'cover',
  },
  viewMainPlaceholder: {
    height: 180,
    backgroundColor: '#f8fafc',
    marginHorizontal: 24,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 16,
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 8,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  breedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  viewBreed: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
  },
  viewPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7c3aed',
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
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
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
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoCardLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoCardVal: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
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
    borderRadius: 10,
    marginRight: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  descriptionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});
