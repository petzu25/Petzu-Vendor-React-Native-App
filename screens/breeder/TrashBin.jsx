import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from '../../lib/axios';

export default function TrashBin() {
  const [trashedItems, setTrashedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchTrashedItems();
  }, []);

  const fetchTrashedItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/trash');
      if (res.data && res.data.success) {
        setTrashedItems(res.data.data || []);
      } else {
        setTrashedItems([]);
      }
    } catch (error) {
      console.error('Error fetching trashed items:', error);
      Alert.alert('Error', 'Failed to load trash bin items.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (item) => {
    Alert.alert(
      'Restore Item',
      `Are you sure you want to restore "${item.title || 'this item'}" back to your active list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              setActioning(true);
              await axios.put(`/trash/restore/${item._id}`, {
                collectionType: item.collectionType,
              });
              Alert.alert('Success', 'Item restored successfully');
              fetchTrashedItems();
            } catch (error) {
              console.error('Error restoring item:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to restore item.');
            } finally {
              setActioning(false);
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (item) => {
    Alert.alert(
      'Delete Permanently',
      `Are you sure you want to permanently delete "${item.title || 'this item'}"? This action is irreversible and the item will be gone forever.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              setActioning(true);
              await axios.delete(
                `/trash/permanentDelete/${item._id}?collectionType=${item.collectionType}`
              );
              Alert.alert('Success', 'Item deleted permanently');
              fetchTrashedItems();
            } catch (error) {
              console.error('Error permanently deleting item:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete item.');
            } finally {
              setActioning(false);
            }
          },
        },
      ]
    );
  };

  const daysRemaining = (trashedAt) => {
    if (!trashedAt) return 30;
    const trashedDate = new Date(trashedAt);
    const diffMs = Date.now() - trashedDate.getTime();
    const daysInTrash = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysInTrash);
  };

  const getFriendlyType = (type) => {
    switch (type) {
      case 'AboutPet':
        return 'Pet Sale Listing';
      case 'AdoptionPet':
        return 'Adoption Listing';
      case 'MatingPet':
        return 'Mating Stud Listing';
      case 'PetSaleReceipt':
        return 'Pet Sale Receipt';
      case 'MatingPetReceipt':
        return 'Mating Receipt';
      default:
        return 'General Listing';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'AboutPet':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'MatingPet':
        return { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' };
      case 'PetSaleReceipt':
        return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'MatingPetReceipt':
        return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const renderTrashItem = ({ item }) => {
    const remaining = daysRemaining(item.trashedAt);
    const isUrgent = remaining <= 3;
    const typeStyle = getTypeColor(item.collectionType);
    const mainPhoto = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={[styles.cardImage, styles.grayscaleImage]} />
          ) : (
            <View style={styles.placeholderCardImage}>
              <Feather name="image" size={28} color="#cbd5e1" />
            </View>
          )}

          {/* Days Left Badge */}
          <View style={[styles.urgencyBadge, isUrgent ? styles.badgeUrgent : styles.badgeNormal]}>
            {isUrgent && (
              <Feather name="alert-triangle" size={10} color="#ffffff" style={{ marginRight: 3 }} />
            )}
            <Text style={styles.urgencyText}>
              {remaining} {remaining === 1 ? 'day' : 'days'} left
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title || 'Untitled Item'}
            </Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: typeStyle.bg, borderColor: typeStyle.border },
              ]}>
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                {getFriendlyType(item.collectionType)}
              </Text>
            </View>
          </View>

          <View style={styles.metaColumn}>
            {item.displayId && (
              <View style={styles.metaRow}>
                <Feather name="tag" size={12} color="#94a3b8" />
                <Text style={styles.metaText} numberOfLines={1}>
                  ID: {item.displayId}
                </Text>
              </View>
            )}
            {item.price ? (
              <View style={styles.metaRow}>
                <Feather name="dollar-sign" size={12} color="#059669" />
                <Text style={[styles.metaText, styles.priceText]}>
                  ₹{parseFloat(item.price).toLocaleString()}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Feather name="calendar" size={12} color="#94a3b8" />
              <Text style={styles.metaText}>
                Deleted: {new Date(item.trashedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleRestore(item)}
              style={[styles.cardBtn, styles.restoreBtn]}
              disabled={actioning}>
              <Feather name="rotate-ccw" size={13} color="#059669" />
              <Text style={styles.restoreBtnText}>Restore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePermanentDelete(item)}
              style={[styles.cardBtn, styles.deleteBtn]}
              disabled={actioning}>
              <Feather name="trash-2" size={13} color="#ef4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.infoBanner}>
        <Feather name="info" size={16} color="#475569" style={styles.bannerIcon} />
        <Text style={styles.bannerText}>
          Deleted items are retained here for 30 days before being permanently deleted.
        </Text>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Fetching trashed items...</Text>
        </View>
      ) : trashedItems.length > 0 ? (
        <FlatList
          data={trashedItems}
          renderItem={renderTrashItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="trash-2" size={32} color="#cbd5e1" />
          </View>
          <Text style={styles.emptyTitle}>Trash Bin is Empty</Text>
          <Text style={styles.emptySubtitle}>
            When you delete pet listings, receipts, or profiles, they will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
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
    paddingBottom: 24,
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
    flexDirection: 'row',
    minHeight: 130,
  },
  imageWrapper: {
    width: 100,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  grayscaleImage: {
    opacity: 0.5,
  },
  placeholderCardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencyBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 3,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  badgeNormal: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  badgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  urgencyText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  metaColumn: {
    gap: 4,
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  priceText: {
    color: '#059669',
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
  },
  restoreBtn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  restoreBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    minHeight: 250,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
