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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import theme from '../../constants/theme';

const CATEGORIES = ['Dog', 'Cat', 'Bird', 'Fish', 'Other'];
const GENDERS = ['Male', 'Female', 'Mixed', 'Unsexed'];

export default function SaleReceipts() {
  const { authUser } = useAuthStore();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal
  const [formVisible, setFormVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingReceipt, setEditingReceipt] = useState(null);

  // Buyer Details
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');

  // Pet Details
  const [category, setCategory] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [petPrice, setPetPrice] = useState('');
  const [petQuality, setPetQuality] = useState('Pet Quality');
  const [petLineage, setPetLineage] = useState('None');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [petSaleDate, setPetSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [vaccinationDetails, setVaccinationDetails] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [kciStatusPet, setKciStatusPet] = useState('Non-KCI Pet');
  const [kciNumber, setKciNumber] = useState('');
  const [kciName, setKciName] = useState('');

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
  const [birdFeedType, setBirdFeedType] = useState('Seeds');
  const [birdColorVariant, setBirdColorVariant] = useState('');
  const [birdTalkingAbility, setBirdTalkingAbility] = useState(false);

  // Media
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [kciCertificates, setKciCertificates] = useState([]);
  const [vaccinationImages, setVaccinationImages] = useState([]);

  // Accessories
  const [accessories, setAccessories] = useState([]);
  const [newAccName, setNewAccName] = useState('');
  const [newAccQuality, setNewAccQuality] = useState('Standard');
  const [newAccQty, setNewAccQty] = useState('1');
  const [newAccPrice, setNewAccPrice] = useState('');

  // Buyer Follow-Up
  const [buyerFollowUpActive, setBuyerFollowUpActive] = useState(false);
  const [buyerFollowUp, setBuyerFollowUp] = useState({
    sevenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
    fifteenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
    thirtyDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
  });

  // Seller Details (auto-filled)
  const [breederName, setBreederName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopFullAddress, setShopFullAddress] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');

  // View Bill Modal
  const [billVisible, setBillVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/petsalereceipts/history');
      if (res.data && res.data.success) {
        setReceipts(res.data.receipts || []);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error fetching sale receipts:', error);
      Alert.alert('Error', 'Failed to load sale receipts history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = async () => {
    setEditingReceipt(null);
    // Buyer
    setBuyerName('');
    setBuyerPhone('');
    setBuyerAddress('');
    setBuyerLocation('');
    // Pet
    setCategory('Dog');
    setBreed('');
    setGender('Male');
    setPetPrice('');
    setPriceNegotiable(false);
    setPetQuality('Pet Quality');
    setPetLineage('None');
    setDateOfBirth('');
    setPetSaleDate(new Date().toISOString().split('T')[0]);
    setVaccinationDetails('');
    setAdditionalDetails('');
    setMicrochipNumber('');
    setKciStatusPet('Non-KCI Pet');
    setKciNumber('');
    setKciName('');

    // Fish
    setFishCategory('');
    setFishQuantity('Single');
    setFishQuantityCount('');
    setFishGender('Unsexed');
    setFishSizeCm('');
    setFishColorVariant('');
    setFishFeedType('Flakes');

    // Bird
    setBirdQuantity('Single');
    setBirdGender('Unsexed');
    setBirdFeedType('Seeds');
    setBirdColorVariant('');
    setBirdTalkingAbility(false);

    // Media
    setImages([]);
    setVideo(null);
    setKciCertificates([]);
    setVaccinationImages([]);

    setAccessories([]);
    setNewAccName('');
    setNewAccQuality('Standard');
    setNewAccQty('1');
    setNewAccPrice('');
    // Buyer Follow-Up
    setBuyerFollowUpActive(false);
    setBuyerFollowUp({
      sevenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
      fifteenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
      thirtyDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
    });
    // Auto-fill seller from authUser
    setBreederName(authUser?.fullName || authUser?.breederName || '');
    setShopName(authUser?.shopName || '');
    setShopFullAddress(authUser?.shopAddress || '');
    setSellerLocation(authUser?.location || '');
    setSellerPhone(authUser?.phoneNumber || '');
    setCurrentStep(1);
    setFormVisible(true);
  };

  const handleOpenEdit = (receipt) => {
    setEditingReceipt(receipt);
    // Buyer
    setBuyerName(receipt.buyerName || '');
    setBuyerPhone(receipt.buyerPhoneNumber || '');
    setBuyerAddress(receipt.buyerAddress || '');
    setBuyerLocation(receipt.buyerLocation || '');
    // Pet
    setCategory(receipt.category || 'Dog');
    setBreed(receipt.breed || '');
    setGender(receipt.gender || 'Male');
    setPetPrice(receipt.price?.toString() || '');
    setPriceNegotiable(!!receipt.priceNegotiable);
    setPetQuality(receipt.petQuality || 'Pet Quality');
    setPetLineage(receipt.petLineage || 'None');
    setDateOfBirth(receipt.dateOfBirth ? new Date(receipt.dateOfBirth).toISOString().split('T')[0] : '');
    setPetSaleDate(receipt.petSaleDate ? new Date(receipt.petSaleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setVaccinationDetails(receipt.vaccinationDetails || '');
    setAdditionalDetails(receipt.additionalDetails || '');
    setMicrochipNumber(receipt.microchipNumber || '');
    setKciStatusPet(receipt.kciStatusPet || 'Non-KCI Pet');
    setKciNumber(receipt.kciNumber || '');
    setKciName(receipt.kciName || '');

    // Fish
    setFishCategory(receipt.fish_category || '');
    setFishQuantity(receipt.fish_quantity || 'Single');
    setFishQuantityCount(receipt.fish_quantityCount?.toString() || '');
    setFishGender(receipt.fish_gender || 'Unsexed');
    setFishSizeCm(receipt.fish_sizeCm?.toString() || '');
    setFishColorVariant(receipt.fish_colorVariant || '');
    setFishFeedType(receipt.fish_feedType || 'Flakes');

    // Bird
    setBirdQuantity(receipt.bird_quantity || 'Single');
    setBirdGender(receipt.bird_gender || 'Unsexed');
    setBirdFeedType(receipt.bird_feedType || 'Seeds');
    setBirdColorVariant(receipt.bird_colorVariant || '');
    setBirdTalkingAbility(!!receipt.bird_talkingAbility);

    // Media
    setImages(receipt.images || []);
    setVideo(receipt.video || null);
    setKciCertificates(receipt.kciCertificate || []);
    setVaccinationImages(receipt.vaccinationImages || []);

    setAccessories(receipt.accessories || []);
    setNewAccName('');
    setNewAccQuality('Standard');
    setNewAccQty('1');
    setNewAccPrice('');
    // Buyer Follow-Up
    setBuyerFollowUpActive(!!receipt.buyerFollowUp);
    if (receipt.buyerFollowUp && receipt.buyerFollowUp.sevenDay) {
      setBuyerFollowUp(receipt.buyerFollowUp);
    } else {
      setBuyerFollowUp({
        sevenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
        fifteenDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
        thirtyDay: { rating: null, satisfaction: '', healthStatus: '', comment: '', completed: false },
      });
    }
    // Seller
    setBreederName(receipt.breederName || authUser?.fullName || '');
    setShopName(receipt.shopName || authUser?.shopName || '');
    setShopFullAddress(receipt.shopFullAddress || authUser?.shopAddress || '');
    setSellerLocation(receipt.location || authUser?.location || '');
    setSellerPhone(receipt.phoneNumber || authUser?.phoneNumber || '');
    setCurrentStep(1);
    setFormVisible(true);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleAddAccessory = () => {
    if (!newAccName || !newAccPrice) {
      Alert.alert('Error', 'Accessory name and price are required.');
      return;
    }
    const quantity = parseInt(newAccQty) || 1;
    const price = parseFloat(newAccPrice) || 0;
    setAccessories((prev) => [...prev, { item: newAccName, quality: newAccQuality, quantity, price }]);
    setNewAccName('');
    setNewAccQuality('Standard');
    setNewAccQty('1');
    setNewAccPrice('');
  };

  const handleRemoveAccessory = (index) => {
    setAccessories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Receipt', 'Are you sure you want to delete this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await axios.delete(`/petsalereceipts/${id}`);
            Alert.alert('Success', 'Receipt deleted successfully');
            fetchReceipts();
          } catch (error) {
            console.error('Error deleting receipt:', error);
            Alert.alert('Error', 'Failed to delete receipt.');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePickFile = async (type, isVideo = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: isVideo ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !isVideo,
        quality: 0.8,
        allowsMultipleSelection: type === 'images' || type === 'vaccination' || type === 'kci',
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'video') {
          setVideo(result.assets[0].uri);
        } else if (type === 'images') {
          setImages([...images, ...result.assets.map(a => a.uri)].slice(0, 5));
        } else if (type === 'vaccination') {
          setVaccinationImages([...vaccinationImages, ...result.assets.map(a => a.uri)].slice(0, 3));
        } else if (type === 'kci') {
          setKciCertificates([...kciCertificates, ...result.assets.map(a => a.uri)].slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Error picking file:', err);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const appendFileIfLocal = (formData, key, fileUri, defaultName = 'file.jpg') => {
    if (!fileUri) return;
    if (fileUri.startsWith('http')) {
      const fieldKey = key === 'video' ? 'existingVideo' : 
                       key === 'images' ? 'existingImages' : 
                       key === 'vaccinationImages' ? 'existingVaccinationImages' : 
                       key === 'kciCertificate' ? 'existingKciCertificate' : key;
      formData.append(fieldKey, fileUri);
    } else {
      const filename = fileUri.split('/').pop() || defaultName;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append(key, { uri: fileUri, name: filename, type: key === 'video' ? 'video/mp4' : type });
    }
  };

  const handleSave = async () => {
    if (!buyerName || !buyerPhone || !breed || !petPrice || !dateOfBirth) {
      Alert.alert(
        'Validation Error',
        'Buyer details, Breed, Date of Birth, and Pet Price are required.'
      );
      return;
    }
    if (buyerPhone.length !== 10) {
      Alert.alert('Validation Error', 'Buyer phone number must be 10 digits.');
      return;
    }
    if (!breederName || !shopName || !sellerLocation) {
      Alert.alert('Validation Error', 'Breeder Name, Shop Name, and Location are required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Buyer
      data.append('buyerName', buyerName);
      data.append('buyerPhoneNumber', buyerPhone);
      data.append('buyerAddress', buyerAddress);
      data.append('buyerLocation', buyerLocation);

      // Pet
      data.append('category', category);
      data.append('breed', breed);
      data.append('gender', gender);
      data.append('price', petPrice);
      data.append('priceNegotiable', String(priceNegotiable));
      data.append('petQuality', petQuality);
      data.append('petLineage', petLineage);
      data.append('dateOfBirth', dateOfBirth);
      data.append('petSaleDate', petSaleDate);
      data.append('vaccinationDetails', vaccinationDetails);
      data.append('additionalDetails', additionalDetails);
      data.append('microchipNumber', microchipNumber);
      data.append('kciStatusPet', kciStatusPet);
      if (kciStatusPet === 'KCI Registered') {
        data.append('kciNumber', kciNumber);
        data.append('kciName', kciName);
      }

      // Fish Specific
      if (category === 'Fish') {
        data.append('fish_category', fishCategory);
        data.append('fish_quantity', fishQuantity);
        if (fishQuantity === 'Group') data.append('fish_quantityCount', fishQuantityCount);
        data.append('fish_gender', fishGender);
        if (fishSizeCm) data.append('fish_sizeCm', fishSizeCm);
        data.append('fish_colorVariant', fishColorVariant);
        data.append('fish_feedType', fishFeedType);
      } else if (category === 'Bird') {
        data.append('bird_quantity', birdQuantity);
        data.append('bird_gender', birdGender);
        data.append('bird_talkingAbility', String(birdTalkingAbility));
        data.append('bird_feedType', birdFeedType);
        data.append('bird_colorVariant', birdColorVariant);
      }

      data.append('accessories', JSON.stringify(accessories));
      
      if (buyerFollowUpActive) {
        data.append('buyerFollowUp', JSON.stringify(buyerFollowUp));
      }

      // Seller
      data.append('breederName', breederName);
      data.append('phoneNumber', sellerPhone);
      data.append('shopName', shopName);
      data.append('shopFullAddress', shopFullAddress);
      data.append('location', sellerLocation);

      // Media
      images.forEach(uri => appendFileIfLocal(data, 'images', uri));
      if (video) appendFileIfLocal(data, 'video', video, 'video.mp4');
      kciCertificates.forEach(uri => appendFileIfLocal(data, 'kciCertificate', uri));
      vaccinationImages.forEach(uri => appendFileIfLocal(data, 'vaccinationImages', uri));

      if (editingReceipt) {
        await axios.put(`/petsalereceipts/${editingReceipt._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Receipt updated successfully');
      } else {
        await axios.post('/petsalereceipts/create', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert('Success', 'Receipt generated successfully');
      }

      setFormVisible(false);
      fetchReceipts();
    } catch (error) {
      console.error('Error saving sale receipt:', error?.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReceipts = receipts.filter(
    (r) =>
      (r.receiptId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.breed || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotal = (receipt) => {
    const pPrice = receipt.price || 0;
    const accPrice = (receipt.accessories || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return pPrice + accPrice;
  };

  const totalRevenue = receipts.reduce((sum, r) => sum + calculateTotal(r), 0);

  const renderReceiptItem = ({ item, index }) => {
    const totalAmount = calculateTotal(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.receiptId}>
              {item.receiptId || `PSR-${item._id?.slice(-5).toUpperCase()}`}
            </Text>
            <Text style={styles.receiptDate}>
              {new Date(item.petSaleDate || item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>₹{totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Buyer:</Text>
            <Text style={styles.infoVal}>
              {item.buyerName} ({item.buyerPhoneNumber})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pet Details:</Text>
            <Text style={styles.infoVal}>
              {item.gender} {item.breed} ({item.category})
            </Text>
          </View>
          {item.accessories && item.accessories.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Accessories:</Text>
              <Text style={styles.infoVal}>{item.accessories.length} items included</Text>
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => {
              setSelectedReceipt(item);
              setBillVisible(true);
            }}
            style={[styles.actionBtn, styles.viewBtn]}>
            <Feather name="file-text" size={14} color={theme.COLORS.primary} />
            <Text style={styles.viewBtnText}>Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenEdit(item)}
            style={[styles.actionBtn, styles.editBtn]}>
            <Feather name="edit" size={14} color={theme.COLORS.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
            style={[styles.actionBtn, styles.deleteBtn]}>
            <Feather name="trash-2" size={14} color={theme.COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Metric Revenue Banner */}
      <View style={styles.revenueBanner}>
        <View style={styles.bannerGradient}>
          <View>
            <Text style={styles.revenueLabel}>Total Receipts Revenue</Text>
            <Text style={styles.revenueValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueStats}>
            <Text style={styles.revenueStatsText}>{receipts.length} Sales</Text>
          </View>
        </View>
      </View>

      {/* Search and Generate button */}
      <View style={styles.controlsRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={theme.COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, Breed, Buyer..."
            placeholderTextColor={theme.COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={handleOpenAdd}>
          <Feather name="plus" size={16} color={theme.COLORS.surface} />
          <Text style={styles.createBtnText}>New Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Receipts List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.COLORS.primary} />
          <Text style={styles.loadingText}>Loading transactions history...</Text>
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
            <Feather name="clipboard" size={32} color={theme.COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Invoices Issued</Text>
          <Text style={styles.emptySubtitle}>
            Generate a professional sales invoice receipt when you sell a pet.
          </Text>
        </View>
      )}

      {/* Generate / Edit Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReceipt ? 'Edit Pet Sale Receipt' : 'New Pet Sale Receipt'}
              </Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setFormVisible(false)}>
                <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Customer (Buyer) Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={buyerName}
                  onChangeText={setBuyerName}
                  placeholder="Enter buyer name"
                  placeholderTextColor={theme.COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Mobile Number (10 digits) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={buyerPhone}
                  onChangeText={(text) => setBuyerPhone(text.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={theme.COLORS.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer City / Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={buyerLocation}
                  onChangeText={setBuyerLocation}
                  placeholder="e.g. Bangalore"
                  placeholderTextColor={theme.COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={buyerAddress}
                  onChangeText={setBuyerAddress}
                  placeholder="Enter full address"
                  placeholderTextColor={theme.COLORS.textSecondary}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <Text style={styles.sectionHeader}>Pet Information</Text>

              <Text style={styles.inputLabel}>Pet Category *</Text>
              <View style={styles.pillContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      category === cat ? styles.categoryPillSelected : null,
                    ]}
                    onPress={() => setCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        category === cat ? styles.categoryPillTextSelected : null,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Breed *</Text>
                <TextInput
                  style={styles.textInput}
                  value={breed}
                  onChangeText={setBreed}
                  placeholder="e.g. Persian Cat"
                  placeholderTextColor={theme.COLORS.textSecondary}
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Gender *</Text>
                  <View style={styles.selectWrapper}>
                    <FlatList
                      data={GENDERS}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(g) => g}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => setGender(item)}
                          style={[
                            styles.genderOption,
                            gender === item ? styles.genderOptionActive : null,
                          ]}>
                          <Text
                            style={[
                              styles.genderOptionText,
                              gender === item ? styles.genderOptionTextActive : null,
                            ]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Pet Price (INR) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={petPrice}
                    onChangeText={setPetPrice}
                    placeholder="Price in ₹"
                    placeholderTextColor={theme.COLORS.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setPriceNegotiable(!priceNegotiable)}>
                  <View style={[styles.checkbox, priceNegotiable ? styles.checkboxChecked : null]}>
                    {priceNegotiable && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Price is Negotiable</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Quality Description</Text>
                  <TextInput
                    style={styles.textInput}
                    value={petQuality}
                    onChangeText={setPetQuality}
                    placeholder="e.g. Show Quality"
                    placeholderTextColor={theme.COLORS.textSecondary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Pet Lineage</Text>
                  <TextInput
                    style={styles.textInput}
                    value={petLineage}
                    onChangeText={setPetLineage}
                    placeholder="e.g. Champion Bloodline"
                    placeholderTextColor={theme.COLORS.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Date of Birth *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.COLORS.textSecondary}
                  />
                </View>
                <View style={[styles.inputGroup, styles.gridCol]}>
                  <Text style={styles.inputLabel}>Microchip Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={microchipNumber}
                    onChangeText={setMicrochipNumber}
                    placeholder="If applicable"
                    placeholderTextColor={theme.COLORS.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vaccination Details</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={vaccinationDetails}
                  onChangeText={setVaccinationDetails}
                  placeholder="List completed vaccinations"
                  placeholderTextColor={theme.COLORS.textSecondary}
                  multiline
                />
              </View>

              {/* Conditional Rendering for Fish/Bird */}
              {category === 'Fish' && (
                <View style={styles.conditionalBlock}>
                  <Text style={styles.sectionHeader}>Fish Specific Details</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Fish Category</Text>
                    <TextInput style={styles.textInput} value={fishCategory} onChangeText={setFishCategory} placeholder="e.g. Tropical, Coldwater" placeholderTextColor={theme.COLORS.textSecondary} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Color Variant</Text>
                    <TextInput style={styles.textInput} value={fishColorVariant} onChangeText={setFishColorVariant} placeholder="e.g. Neon Blue" placeholderTextColor={theme.COLORS.textSecondary} />
                  </View>
                  <View style={styles.gridRow}>
                    <View style={[styles.inputGroup, styles.gridCol]}>
                      <Text style={styles.inputLabel}>Quantity Type</Text>
                      <TextInput style={styles.textInput} value={fishQuantity} onChangeText={setFishQuantity} placeholder="Single or Group" placeholderTextColor={theme.COLORS.textSecondary} />
                    </View>
                    {fishQuantity === 'Group' && (
                      <View style={[styles.inputGroup, styles.gridCol]}>
                        <Text style={styles.inputLabel}>Count</Text>
                        <TextInput style={styles.textInput} value={fishQuantityCount} onChangeText={setFishQuantityCount} keyboardType="numeric" placeholderTextColor={theme.COLORS.textSecondary} />
                      </View>
                    )}
                  </View>
                  <View style={styles.gridRow}>
                    <View style={[styles.inputGroup, styles.gridCol]}>
                      <Text style={styles.inputLabel}>Size (cm)</Text>
                      <TextInput style={styles.textInput} value={fishSizeCm} onChangeText={setFishSizeCm} keyboardType="numeric" placeholderTextColor={theme.COLORS.textSecondary} />
                    </View>
                    <View style={[styles.inputGroup, styles.gridCol]}>
                      <Text style={styles.inputLabel}>Feed Type</Text>
                      <TextInput style={styles.textInput} value={fishFeedType} onChangeText={setFishFeedType} placeholder="e.g. Flakes" placeholderTextColor={theme.COLORS.textSecondary} />
                    </View>
                  </View>
                </View>
              )}

              {category === 'Bird' && (
                <View style={styles.conditionalBlock}>
                  <Text style={styles.sectionHeader}>Bird Specific Details</Text>
                  <View style={styles.gridRow}>
                    <View style={[styles.inputGroup, styles.gridCol]}>
                      <Text style={styles.inputLabel}>Quantity</Text>
                      <TextInput style={styles.textInput} value={birdQuantity} onChangeText={setBirdQuantity} placeholder="Single/Pair/Flock" placeholderTextColor={theme.COLORS.textSecondary} />
                    </View>
                    <View style={[styles.inputGroup, styles.gridCol]}>
                      <Text style={styles.inputLabel}>Color Variant</Text>
                      <TextInput style={styles.textInput} value={birdColorVariant} onChangeText={setBirdColorVariant} placeholder="e.g. Lutino" placeholderTextColor={theme.COLORS.textSecondary} />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Feed Type</Text>
                    <TextInput style={styles.textInput} value={birdFeedType} onChangeText={setBirdFeedType} placeholder="e.g. Seeds, Pellets" placeholderTextColor={theme.COLORS.textSecondary} />
                  </View>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setBirdTalkingAbility(!birdTalkingAbility)}>
                    <View style={[styles.checkbox, birdTalkingAbility ? styles.checkboxChecked : null]}>
                      {birdTalkingAbility && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Talking Ability</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes / Health Guarantees</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={additionalDetails}
                  onChangeText={setAdditionalDetails}
                  placeholder="Any special remarks or guarantees provided..."
                  placeholderTextColor={theme.COLORS.textSecondary}
                  multiline
                />
              </View>

              <Text style={styles.sectionHeader}>Media & Documentation</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pet Photos (Max 5)</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickFile('images')}>
                  <Feather name="image" size={20} color={theme.COLORS.primary} />
                  <Text style={styles.uploadBtnText}>Upload Photos ({images.length}/5)</Text>
                </TouchableOpacity>
                {images.length > 0 && (
                  <View style={styles.pillContainer}>
                    {images.map((uri, idx) => (
                      <View key={idx} style={styles.fileThumbContainer}>
                        <Feather name="file-text" size={24} color={theme.COLORS.primary} />
                        <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setImages(images.filter((_, i) => i !== idx))}>
                          <Feather name="x" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pet Video (Optional)</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickFile('video', true)}>
                  <Feather name="video" size={20} color={theme.COLORS.primary} />
                  <Text style={styles.uploadBtnText}>{video ? 'Video Selected' : 'Upload Video'}</Text>
                </TouchableOpacity>
                {video && (
                  <View style={styles.fileThumbContainer}>
                    <Feather name="film" size={24} color={theme.COLORS.primary} />
                    <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setVideo(null)}>
                      <Feather name="x" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>KCI Registered Status</Text>
              <View style={styles.pillContainer}>
                {['KCI Registered', 'Non-KCI Pet'].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[
                      styles.categoryPill,
                      kciStatusPet === k ? styles.categoryPillSelected : null,
                    ]}
                    onPress={() => setKciStatusPet(k)}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        kciStatusPet === k ? styles.categoryPillTextSelected : null,
                      ]}>
                      {k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {kciStatusPet === 'KCI Registered' && (
                <View style={styles.kciGroup}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>KCI Certificate Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={kciNumber}
                      onChangeText={setKciNumber}
                      placeholder="Reg number"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>KCI Pedigree Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={kciName}
                      onChangeText={setKciName}
                      placeholder="Registered pedigree name"
                      placeholderTextColor={theme.COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Upload KCI Certificates (Max 3)</Text>
                    <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickFile('kci')}>
                      <Feather name="file-plus" size={20} color={theme.COLORS.primary} />
                      <Text style={styles.uploadBtnText}>Upload ({kciCertificates.length}/3)</Text>
                    </TouchableOpacity>
                    {kciCertificates.length > 0 && (
                      <View style={styles.pillContainer}>
                        {kciCertificates.map((uri, idx) => (
                          <View key={idx} style={styles.fileThumbContainer}>
                            <Feather name="award" size={24} color={theme.COLORS.primary} />
                            <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setKciCertificates(kciCertificates.filter((_, i) => i !== idx))}>
                              <Feather name="x" size={12} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Upload Vaccination Proofs (Max 3)</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickFile('vaccination')}>
                  <Feather name="shield" size={20} color={theme.COLORS.primary} />
                  <Text style={styles.uploadBtnText}>Upload Proofs ({vaccinationImages.length}/3)</Text>
                </TouchableOpacity>
                {vaccinationImages.length > 0 && (
                  <View style={styles.pillContainer}>
                    {vaccinationImages.map((uri, idx) => (
                      <View key={idx} style={styles.fileThumbContainer}>
                        <Feather name="check-circle" size={24} color={theme.COLORS.success} />
                        <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setVaccinationImages(vaccinationImages.filter((_, i) => i !== idx))}>
                          <Feather name="x" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Accessories Checklist */}
              <Text style={styles.sectionHeader}>Billing Accessories / Products</Text>

              <View style={styles.accessorySubform}>
                <TextInput
                  style={[styles.textInput, styles.accInput]}
                  value={newAccName}
                  onChangeText={setNewAccName}
                  placeholder="Accessory / Food item name"
                  placeholderTextColor={theme.COLORS.textSecondary}
                />
                <TextInput
                  style={[styles.textInput, styles.accInput]}
                  value={newAccQuality}
                  onChangeText={setNewAccQuality}
                  placeholder="Quality / Brand (e.g. Premium)"
                  placeholderTextColor={theme.COLORS.textSecondary}
                />
                <View style={styles.gridRow}>
                  <TextInput
                    style={[styles.textInput, styles.gridCol]}
                    value={newAccQty}
                    onChangeText={setNewAccQty}
                    placeholder="Qty"
                    placeholderTextColor={theme.COLORS.textSecondary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.textInput, styles.gridCol]}
                    value={newAccPrice}
                    onChangeText={setNewAccPrice}
                    placeholder="Price per unit"
                    placeholderTextColor={theme.COLORS.textSecondary}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.accAddBtn} onPress={handleAddAccessory}>
                    <Feather name="plus" size={20} color={theme.COLORS.surface} />
                  </TouchableOpacity>
                </View>
              </View>

              {accessories.length > 0 && (
                <View style={styles.accList}>
                  {accessories.map((item, idx) => (
                    <View key={idx} style={styles.accListItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.accItemName}>{item.item}</Text>
                        <Text style={styles.accItemMeta}>
                          {item.quantity} x ₹{item.price}
                        </Text>
                      </View>
                      <Text style={styles.accItemTotal}>₹{item.quantity * item.price}</Text>
                      <TouchableOpacity
                        style={styles.accRemoveBtn}
                        onPress={() => handleRemoveAccessory(idx)}>
                        <Feather name="x" size={16} color={theme.COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Buyer Follow-Up */}
              <Text style={styles.sectionHeader}>Buyer Follow-Up Program</Text>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setBuyerFollowUpActive(!buyerFollowUpActive)}>
                <View style={[styles.checkbox, buyerFollowUpActive ? styles.checkboxChecked : null]}>
                  {buyerFollowUpActive && <Feather name="check" size={12} color={theme.COLORS.surface} />}
                </View>
                <Text style={styles.checkboxLabel}>Enable 7/15/30 Day Follow-Up Schedule</Text>
              </TouchableOpacity>

              {buyerFollowUpActive && (
                <View style={styles.conditionalBlock}>
                  {['sevenDay', 'fifteenDay', 'thirtyDay'].map(period => (
                    <View key={period} style={styles.followUpCard}>
                      <Text style={styles.followUpCardTitle}>
                        {period === 'sevenDay' ? '7-Day' : period === 'fifteenDay' ? '15-Day' : '30-Day'} Check-in
                      </Text>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Health Status</Text>
                        <TextInput
                          style={styles.textInput}
                          value={buyerFollowUp[period].healthStatus}
                          onChangeText={(t) => setBuyerFollowUp({ ...buyerFollowUp, [period]: { ...buyerFollowUp[period], healthStatus: t } })}
                          placeholder="e.g. Active, Eating well"
                          placeholderTextColor={theme.COLORS.textSecondary}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Notes</Text>
                        <TextInput
                          style={[styles.textInput, styles.textArea]}
                          value={buyerFollowUp[period].comment}
                          onChangeText={(t) => setBuyerFollowUp({ ...buyerFollowUp, [period]: { ...buyerFollowUp[period], comment: t } })}
                          placeholder="Any concerns or updates?"
                          placeholderTextColor={theme.COLORS.textSecondary}
                          multiline
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.saveInvoiceBtn}
                onPress={handleSave}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color={theme.COLORS.surface} />
                ) : (
                  <Text style={styles.saveInvoiceBtnText}>Generate Receipt Bill</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Invoice Details Sheet Modal */}
      {selectedReceipt && (
        <Modal
          visible={billVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setBillVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.invoiceSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pet Sale Invoice Receipt</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setBillVisible(false)}>
                  <Feather name="x" size={20} color={theme.COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.invoiceScroll} showsVerticalScrollIndicator={false}>
                {/* Visual Bill Sheet */}
                <View style={styles.billSheet}>
                  <View style={styles.billHeader}>
                    <Feather name="heart" size={24} color={theme.COLORS.primary} />
                    <Text style={styles.billBrand}>PETZU breeder network</Text>
                    <Text style={styles.billSerial}>Invoice #{selectedReceipt.receiptId}</Text>
                  </View>

                  <View style={styles.billDivider} />

                  {/* Parties details */}
                  <View style={styles.partiesContainer}>
                    <View style={styles.partyBox}>
                      <Text style={styles.partyTitle}>SELLER (BREEDER)</Text>
                      <Text style={styles.partyName}>
                        {selectedReceipt.breederName || 'Petzu Partner'}
                      </Text>
                      <Text style={styles.partyText}>{selectedReceipt.shopName}</Text>
                      <Text style={styles.partyText}>
                        {selectedReceipt.shopFullAddress || selectedReceipt.location}
                      </Text>
                      <Text style={styles.partyText}>Ph: {selectedReceipt.phoneNumber}</Text>
                    </View>

                    {selectedReceipt.ownerName ? (
                      <View style={[styles.partyBox, { marginTop: 10 }]}>
                        <Text style={styles.partyTitle}>ACTUAL OWNER</Text>
                        <Text style={styles.partyName}>{selectedReceipt.ownerName}</Text>
                        <Text style={styles.partyText}>{selectedReceipt.ownerFullAddress}</Text>
                        <Text style={styles.partyText}>Ph: {selectedReceipt.ownerPhoneNumber}</Text>
                      </View>
                    ) : null}

                    <View style={[styles.partyBox, { marginTop: 10 }]}>
                      <Text style={styles.partyTitle}>BUYER (CUSTOMER)</Text>
                      <Text style={styles.partyName}>{selectedReceipt.buyerName}</Text>
                      <Text style={styles.partyText}>
                        {selectedReceipt.buyerAddress || selectedReceipt.buyerLocation}
                      </Text>
                      <Text style={styles.partyText}>Ph: {selectedReceipt.buyerPhoneNumber}</Text>
                    </View>
                  </View>

                  <View style={styles.billDivider} />

                  {/* Items list */}
                  <Text style={styles.billSectionTitle}>Items Charged</Text>

                  <View style={styles.billRowItem}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.billItemName}>
                        {selectedReceipt.breed} ({selectedReceipt.gender})
                      </Text>
                      <Text style={styles.billItemDesc}>
                        {selectedReceipt.category}
                        {selectedReceipt.petQuality ? ` • Quality: ${selectedReceipt.petQuality}` : ''}
                        {selectedReceipt.fish_category ? ` • Type: ${selectedReceipt.fish_category}` : ''}
                        {selectedReceipt.fish_sizeCm ? ` • Size: ${selectedReceipt.fish_sizeCm}cm` : ''}
                        {selectedReceipt.bird_colorVariant ? ` • Color: ${selectedReceipt.bird_colorVariant}` : ''}
                        {selectedReceipt.kciStatusPet === 'KCI Pet' && selectedReceipt.kciNumber ? ` • KCI: ${selectedReceipt.kciNumber}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.billItemQty}>1</Text>
                    <Text style={styles.billItemTotal}>
                      ₹{selectedReceipt.price?.toLocaleString()}
                    </Text>
                  </View>

                  {selectedReceipt.accessories &&
                    selectedReceipt.accessories.map((acc, i) => (
                      <View key={i} style={styles.billRowItem}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.billItemName}>{acc.item}</Text>
                          <Text style={styles.billItemDesc}>Accessory Product</Text>
                        </View>
                        <Text style={styles.billItemQty}>{acc.quantity}</Text>
                        <Text style={styles.billItemTotal}>
                          ₹{(acc.price * acc.quantity).toLocaleString()}
                        </Text>
                      </View>
                    ))}

                  <View style={styles.billDivider} />

                  {/* Calculations */}
                  <View style={styles.calculationSection}>
                    <View style={styles.calRow}>
                      <Text style={styles.calLabel}>Subtotal</Text>
                      <Text style={styles.calVal}>
                        ₹{calculateTotal(selectedReceipt).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.calRow}>
                      <Text style={styles.calLabel}>Tax / GST</Text>
                      <Text style={styles.calVal}>₹0.00 (Inclusive)</Text>
                    </View>
                    <View style={styles.billDivider} />
                    <View style={[styles.calRow, { marginTop: 4 }]}>
                      <Text style={styles.grandLabel}>Grand Total</Text>
                      <Text style={styles.grandVal}>
                        ₹{calculateTotal(selectedReceipt).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.footerNoteContainer}>
                    <Text style={styles.footerNoteTitle}>
                      Thank You for choosing breeder partner network!
                    </Text>
                    <Text style={styles.footerNoteText}>
                      Please monitor your pet&apos;s health during the initial weeks. Vaccinations
                      schedules must be kept updated.
                    </Text>
                  </View>
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
    paddingHorizontal: theme.SIZES.md,
    paddingTop: theme.SIZES.md,
  },
  revenueBanner: {
    borderRadius: theme.RADIUS.xl,
    overflow: 'hidden',
    marginBottom: theme.SIZES.md,
  },
  bannerGradient: {
    padding: theme.SIZES.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.COLORS.primary,
  },
  revenueLabel: {
    ...theme.TEXT.label,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  revenueValue: {
    ...theme.TEXT.h1,
    color: theme.COLORS.surface,
  },
  revenueStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.md,
  },
  revenueStatsText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.SIZES.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    height: theme.SIZES.inputHeight,
    paddingHorizontal: theme.SIZES.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
    fontWeight: theme.FONTS.medium,
  },
  createBtn: {
    backgroundColor: theme.COLORS.primary,
    height: theme.SIZES.inputHeight,
    paddingHorizontal: theme.SIZES.md,
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  createBtnText: {
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
  },
  card: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.md,
    marginBottom: theme.SIZES.md,
    ...theme.SHADOWS.sm,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.SIZES.sm,
  },
  receiptId: {
    ...theme.TEXT.h3,
  },
  receiptDate: {
    ...theme.TEXT.bodySecondary,
    marginTop: 2,
    fontWeight: theme.FONTS.semiBold,
  },
  totalBadge: {
    backgroundColor: theme.COLORS.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.RADIUS.sm,
  },
  totalBadgeText: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.black,
    color: theme.COLORS.primary,
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
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  infoVal: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
    flex: 1,
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
  actionBtn: {
    height: 36,
    borderRadius: theme.RADIUS.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: theme.COLORS.primary + '15',
    borderColor: theme.COLORS.primary + '30',
  },
  viewBtnText: {
    color: theme.COLORS.primary,
    fontSize: 12,
    fontWeight: theme.FONTS.bold,
  },
  editBtn: {
    backgroundColor: theme.COLORS.secondary + '20',
    borderColor: theme.COLORS.secondary + '40',
  },
  editBtnText: {
    color: theme.COLORS.secondary,
    fontSize: 12,
    fontWeight: theme.FONTS.bold,
  },
  deleteBtn: {
    width: 36,
    paddingHorizontal: 0,
    justifyContent: 'center',
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
  // Form Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  formContainer: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    height: '85%',
    paddingTop: 20,
    ...theme.SHADOWS.lg,
  },
  closeBtn: {
    padding: 4,
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
  formScroll: {
    padding: theme.SIZES.lg,
  },
  sectionHeader: {
    ...theme.TEXT.h3,
    color: theme.COLORS.primary,
    marginTop: 10,
    marginBottom: theme.SIZES.md,
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
    minHeight: 60,
    textAlignVertical: 'top',
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
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  gridCol: {
    flex: 1,
  },
  selectWrapper: {
    height: theme.SIZES.inputHeight,
    justifyContent: 'center',
  },
  genderOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.COLORS.canvas,
    borderRadius: theme.RADIUS.md,
    marginRight: 6,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: theme.COLORS.secondary + '15',
    borderColor: theme.COLORS.secondary,
  },
  genderOptionText: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.bold,
  },
  genderOptionTextActive: {
    color: theme.COLORS.secondary,
  },
  kciGroup: {
    backgroundColor: theme.COLORS.canvas,
    padding: 14,
    borderRadius: theme.RADIUS.lg,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  accessorySubform: {
    backgroundColor: theme.COLORS.canvas,
    padding: 14,
    borderRadius: theme.RADIUS.lg,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
    gap: 10,
  },
  accInput: {
    backgroundColor: theme.COLORS.surface,
  },
  accAddBtn: {
    width: theme.SIZES.inputHeight,
    height: theme.SIZES.inputHeight,
    borderRadius: theme.RADIUS.lg,
    backgroundColor: theme.COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accList: {
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.COLORS.surface,
    marginBottom: 20,
  },
  accListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  accItemName: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
  },
  accItemMeta: {
    ...theme.TEXT.label,
    marginTop: 2,
  },
  accItemTotal: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.black,
    marginRight: 12,
  },
  accRemoveBtn: {
    padding: 4,
  },
  conditionalBlock: {
    backgroundColor: theme.COLORS.primary + '0A',
    padding: 14,
    borderRadius: theme.RADIUS.lg,
    marginBottom: theme.SIZES.md,
    borderWidth: 1,
    borderColor: theme.COLORS.primary + '20',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.COLORS.primary + '10',
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.primary + '30',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  uploadBtnText: {
    ...theme.TEXT.bodySecondary,
    color: theme.COLORS.primary,
    fontWeight: theme.FONTS.bold,
  },
  fileThumbContainer: {
    marginTop: 8,
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: theme.RADIUS.md,
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.COLORS.error,
    borderRadius: 12,
    padding: 2,
  },
  followUpCard: {
    backgroundColor: theme.COLORS.surface,
    padding: 12,
    borderRadius: theme.RADIUS.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  followUpCardTitle: {
    ...theme.TEXT.label,
    color: theme.COLORS.text,
    marginBottom: 8,
  },
  saveInvoiceBtn: {
    backgroundColor: theme.COLORS.primary,
    paddingVertical: 14,
    borderRadius: theme.RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveInvoiceBtnText: {
    color: theme.COLORS.surface,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.body.fontSize,
  },
  // Invoice Sheet modal styling
  invoiceSheet: {
    backgroundColor: theme.COLORS.surface,
    borderTopLeftRadius: theme.RADIUS.xxl,
    borderTopRightRadius: theme.RADIUS.xxl,
    height: '90%',
    paddingTop: 20,
    ...theme.SHADOWS.lg,
  },
  invoiceScroll: {
    flex: 1,
    padding: theme.SIZES.lg,
  },
  billSheet: {
    backgroundColor: theme.COLORS.canvas,
    borderRadius: theme.RADIUS.xl,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    padding: 20,
    marginBottom: 40,
  },
  billHeader: {
    alignItems: 'center',
    marginBottom: theme.SIZES.md,
  },
  billBrand: {
    ...theme.TEXT.label,
    color: theme.COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  billSerial: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
    marginTop: 4,
  },
  billDivider: {
    height: 1.5,
    backgroundColor: theme.COLORS.borderDark,
    marginVertical: theme.SIZES.md,
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
    ...theme.TEXT.label,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  partyName: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.black,
    marginBottom: 2,
  },
  partyText: {
    ...theme.TEXT.bodySecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  billSectionTitle: {
    ...theme.TEXT.label,
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
    borderColor: theme.COLORS.borderLight,
  },
  billItemName: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
  },
  billItemDesc: {
    ...theme.TEXT.label,
    marginTop: 2,
  },
  billItemQty: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
    width: 30,
    textAlign: 'center',
  },
  billItemTotal: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
    textAlign: 'right',
    minWidth: 80,
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
  calLabel: {
    ...theme.TEXT.bodySecondary,
    fontWeight: theme.FONTS.semiBold,
  },
  calVal: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.bold,
  },
  grandLabel: {
    ...theme.TEXT.body,
    fontWeight: theme.FONTS.black,
  },
  grandVal: {
    ...theme.TEXT.h2,
    color: theme.COLORS.primary,
  },
  footerNoteContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: theme.COLORS.surface,
    padding: 14,
    borderRadius: theme.RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.COLORS.borderLight,
  },
  footerNoteTitle: {
    ...theme.TEXT.label,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
  },
  footerNoteText: {
    fontSize: 10,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
