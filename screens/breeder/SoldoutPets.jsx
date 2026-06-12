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
import axios from '../../lib/axios';

export default function SoldoutPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // View Details Modal
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
        // Filter sold out pets
        const soldOut = res.data.data.filter((p) => p.status === 'Sold Out');
        setPets(soldOut);
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error('Error fetching sold out pets:', error);
      Alert.alert('Error', 'Failed to load sold out pets.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (petId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/aboutpet/updatePets/${petId}`, { status: newStatus });
      Alert.alert('Success', `Pet re-listed as ${newStatus}`);
      fetchPets();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update pet status.');
      setLoading(false);
    }
  };

  const handleDelete = (petId) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to permanently delete this sales record? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`/aboutpet/deletePets/${petId}`);
              Alert.alert('Success', 'Sales record deleted');
              fetchPets();
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert('Error', 'Failed to delete listing.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredPets = pets.filter(
    (pet) =>
      (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPetCard = ({ item }) => {
    const mainPhoto = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={[styles.cardImage, styles.grayscaleImage]} />
          ) : (
            <View style={styles.placeholderCardImage}>
              <Feather name="image" size={32} color="#cbd5e1" />
            </View>
          )}
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD OUT</Text>
          </View>
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
              <Feather name="calendar" size={12} color="#64748b" />
              <Text style={styles.metaText}>
                Sold: {new Date(item.updatedAt).toLocaleDateString()}
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
              <Feather name="eye" size={14} color="#64748b" />
              <Text style={styles.btnText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange(item._id, 'Available')}
              style={[styles.cardBtn, styles.relistBtn]}>
              <Feather name="refresh-cw" size={14} color="#f97316" />
              <Text style={[styles.btnText, styles.relistText]}>Re-list</Text>
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
            placeholder="Search sold history..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Fetching sales history...</Text>
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
            <Feather name="tag" size={32} color="#f97316" />
          </View>
          <Text style={styles.emptyTitle}>No Sales History</Text>
          <Text style={styles.emptySubtitle}>
            Pets marked as &quot;Sold Out&quot; will appear in this tab.
          </Text>
        </View>
      )}

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
                <Text style={styles.modalTitle}>Sold Pet Information</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setViewModalVisible(false)}>
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.viewScroll}>
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
                    <Text style={styles.viewBreed}>{selectedPet.breed || 'Unknown Breed'}</Text>
                    <Text style={styles.viewPrice}>₹{selectedPet.price?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{selectedPet.category}</Text>
                    </View>
                    <Text style={styles.viewNegotiable}>
                      {selectedPet.priceNegotiable ? 'Negotiable' : 'Fixed Price'}
                    </Text>
                  </View>

                  <View style={styles.infoCardGrid}>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Age</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.age || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Gender</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.gender || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Quality</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.petQuality || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoCardItem}>
                      <Text style={styles.infoCardLabel}>Lineage</Text>
                      <Text style={styles.infoCardVal}>{selectedPet.petLineage || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailList}>
                    <View style={styles.detailRowItem}>
                      <Text style={styles.detailLabelItem}>KCI Status</Text>
                      <Text style={styles.detailValueItem}>
                        {selectedPet.kciStatusPet || 'Non-KCI Pet'}
                      </Text>
                    </View>
                    <View style={styles.detailRowItem}>
                      <Text style={styles.detailLabelItem}>Microchip Number</Text>
                      <Text style={styles.detailValueItem}>
                        {selectedPet.microchipNumber || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRowItem}>
                      <Text style={styles.detailLabelItem}>Vaccinations</Text>
                      <Text style={styles.detailValueItem}>
                        {selectedPet.vaccinationDetails || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRowItem}>
                      <Text style={styles.detailLabelItem}>Sold Date</Text>
                      <Text style={styles.detailValueItem}>
                        {new Date(selectedPet.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.descriptionHeader}>Additional Details</Text>
                  <Text style={styles.descriptionText}>
                    {selectedPet.additionalDetails || 'No additional details provided.'}
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
  grayscaleImage: {
    opacity: 0.65,
  },
  placeholderCardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#1e293b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  soldBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
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
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
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
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
  },
  viewBtn: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  relistBtn: {
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
  },
  trashBtn: {
    width: 38,
    paddingHorizontal: 0,
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  relistText: {
    color: '#ea580c',
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
    backgroundColor: '#fff7ed',
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
    color: '#f97316',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewNegotiable: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
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
  detailList: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  detailRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailLabelItem: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValueItem: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '700',
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
