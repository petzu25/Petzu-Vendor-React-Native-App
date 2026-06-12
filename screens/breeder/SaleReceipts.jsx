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
import { LinearGradient } from 'expo-linear-gradient';
import axios from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';

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
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [kciStatusPet, setKciStatusPet] = useState('Non-KCI Pet');
  const [kciNumber, setKciNumber] = useState('');
  const [kciName, setKciName] = useState('');

  // Accessories
  const [accessories, setAccessories] = useState([]);
  const [newAccName, setNewAccName] = useState('');
  const [newAccQty, setNewAccQty] = useState('1');
  const [newAccPrice, setNewAccPrice] = useState('');

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
    setPetQuality('Pet Quality');
    setPetLineage('None');
    setDateOfBirth('');
    setPetSaleDate(new Date().toISOString().split('T')[0]);
    setVaccinationDetails('');
    setMicrochipNumber('');
    setKciStatusPet('Non-KCI Pet');
    setKciNumber('');
    setKciName('');
    setAccessories([]);
    setNewAccName('');
    setNewAccQty('1');
    setNewAccPrice('');
    // Auto-fill seller from authUser
    setBreederName(authUser?.fullName || authUser?.breederName || '');
    setShopName(authUser?.shopName || '');
    setShopFullAddress(authUser?.shopAddress || '');
    setSellerLocation(authUser?.location || '');
    setSellerPhone(authUser?.phoneNumber || '');
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
    setPetQuality(receipt.petQuality || 'Pet Quality');
    setPetLineage(receipt.petLineage || 'None');
    setDateOfBirth(
      receipt.dateOfBirth ? new Date(receipt.dateOfBirth).toISOString().split('T')[0] : ''
    );
    setPetSaleDate(
      receipt.petSaleDate
        ? new Date(receipt.petSaleDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setVaccinationDetails(receipt.vaccinationDetails || '');
    setMicrochipNumber(receipt.microchipNumber || '');
    setKciStatusPet(receipt.kciStatusPet || 'Non-KCI Pet');
    setKciNumber(receipt.kciNumber || '');
    setKciName(receipt.kciName || '');
    setAccessories(receipt.accessories || []);
    setNewAccName('');
    setNewAccQty('1');
    setNewAccPrice('');
    // Seller
    setBreederName(receipt.breederName || authUser?.fullName || '');
    setShopName(receipt.shopName || authUser?.shopName || '');
    setShopFullAddress(receipt.shopFullAddress || authUser?.shopAddress || '');
    setSellerLocation(receipt.location || authUser?.location || '');
    setSellerPhone(receipt.phoneNumber || authUser?.phoneNumber || '');
    setFormVisible(true);
  };

  const handleAddAccessory = () => {
    if (!newAccName || !newAccPrice) {
      Alert.alert('Error', 'Accessory name and price are required.');
      return;
    }
    const quantity = parseInt(newAccQty) || 1;
    const price = parseFloat(newAccPrice) || 0;
    setAccessories((prev) => [...prev, { item: newAccName, quantity, price }]);
    setNewAccName('');
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
      const payload = {
        // Buyer
        buyerName,
        buyerPhoneNumber: buyerPhone,
        buyerAddress,
        buyerLocation,
        // Pet
        category,
        breed,
        gender,
        price: parseFloat(petPrice),
        petQuality,
        petLineage,
        dateOfBirth,
        petSaleDate,
        vaccinationDetails,
        microchipNumber,
        kciStatusPet,
        kciNumber,
        kciName,
        accessories,
        // Seller (required by model)
        breederName,
        phoneNumber: sellerPhone,
        shopName,
        shopFullAddress,
        location: sellerLocation,
      };

      if (editingReceipt) {
        await axios.put(`/petsalereceipts/${editingReceipt._id}`, payload);
        Alert.alert('Success', 'Receipt updated successfully');
      } else {
        await axios.post('/petsalereceipts/create', payload);
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
          colors={['#7c3aed', '#5b21b6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}>
          <View>
            <Text style={styles.revenueLabel}>Total Receipts Revenue</Text>
            <Text style={styles.revenueValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.revenueStats}>
            <Text style={styles.revenueStatsText}>{receipts.length} Sales</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Search and Generate button */}
      <View style={styles.controlsRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, Breed, Buyer..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={handleOpenAdd}>
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={styles.createBtnText}>New Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Receipts List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7c3aed" />
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
            <Feather name="clipboard" size={32} color="#7c3aed" />
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
                <Feather name="x" size={20} color="#64748b" />
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
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Mobile Number (10 digits) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={buyerPhone}
                  onChangeText={(text) => setBuyerPhone(text.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94a3b8"
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
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={buyerAddress}
                  onChangeText={setBuyerAddress}
                  placeholder="Enter full address"
                  placeholderTextColor="#94a3b8"
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
                  placeholderTextColor="#94a3b8"
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
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quality Description</Text>
                <TextInput
                  style={styles.textInput}
                  value={petQuality}
                  onChangeText={setPetQuality}
                  placeholder="e.g. Show Quality / Pedigree"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Microchip Number (If applicable)</Text>
                <TextInput
                  style={styles.textInput}
                  value={microchipNumber}
                  onChangeText={setMicrochipNumber}
                  placeholder="Enter chip code"
                  placeholderTextColor="#94a3b8"
                />
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
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>KCI Pedigree Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={kciName}
                      onChangeText={setKciName}
                      placeholder="Registered pedigree name"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              )}

              {/* Accessories Checklist */}
              <Text style={styles.sectionHeader}>Billing Accessories / Products</Text>

              <View style={styles.accessorySubform}>
                <TextInput
                  style={[styles.textInput, styles.accInput]}
                  value={newAccName}
                  onChangeText={setNewAccName}
                  placeholder="Accessory / Food item name"
                  placeholderTextColor="#94a3b8"
                />
                <View style={styles.gridRow}>
                  <TextInput
                    style={[styles.textInput, styles.gridCol]}
                    value={newAccQty}
                    onChangeText={setNewAccQty}
                    placeholder="Qty"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.textInput, styles.gridCol]}
                    value={newAccPrice}
                    onChangeText={setNewAccPrice}
                    placeholder="Price per unit"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.accAddBtn} onPress={handleAddAccessory}>
                    <Feather name="plus" size={20} color="#ffffff" />
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
                        <Feather name="trash-2" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.saveInvoiceBtn}
                onPress={handleSave}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
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
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.invoiceScroll} showsVerticalScrollIndicator={false}>
                {/* Visual Bill Sheet */}
                <View style={styles.billSheet}>
                  <View style={styles.billHeader}>
                    <Feather name="heart" size={24} color="#7c3aed" />
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

                    <View style={styles.partyBox}>
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
                        {selectedReceipt.category} • Quality: {selectedReceipt.petQuality}
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#f5f3ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  totalBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7c3aed',
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
  // Form Modal styling
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
    color: '#7c3aed',
    marginTop: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderColor: '#7c3aed',
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
    height: 48,
    justifyContent: 'center',
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
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  genderOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  genderOptionTextActive: {
    color: '#2563eb',
  },
  kciGroup: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accessorySubform: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  accInput: {
    backgroundColor: '#ffffff',
  },
  accAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accList: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  accListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  accItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  accItemMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  accItemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginRight: 12,
  },
  accRemoveBtn: {
    padding: 4,
  },
  saveInvoiceBtn: {
    backgroundColor: '#7c3aed',
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
  // Invoice Sheet modal styling
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
    color: '#7c3aed',
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
  billItemQty: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  billItemTotal: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '750',
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
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  calVal: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '700',
  },
  grandLabel: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '850',
  },
  grandVal: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '900',
  },
  footerNoteContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerNoteTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textAlign: 'center',
  },
  footerNoteText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
