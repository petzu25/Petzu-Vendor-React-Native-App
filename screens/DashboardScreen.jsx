import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

// Import Grooming components
import GroomingMyShop from './grooming/GroomingMyShop';
import GroomingOwnerProfile from './grooming/GroomingOwnerProfile';
import GroomingCharges from './grooming/GroomingCharges';

// Import Breeder components
import AvailablePets from './breeder/AvailablePets';
import SoldoutPets from './breeder/SoldoutPets';
import MatingPets from './breeder/MatingPets';
import SaleReceipts from './breeder/SaleReceipts';
import MatingReceipts from './breeder/MatingReceipts';
import BreederShop from './breeder/BreederShop';
import BreederProfile from './breeder/BreederProfile';
import TrashBin from './breeder/TrashBin';

// Import Boarding components
import BoardingMyShop from './boarding/BoardingMyShop';
import BoardingOwnerProfile from './boarding/BoardingOwnerProfile';
import BoardingCharges from './boarding/BoardingCharges';

// Import Vet components
import VetMyShop from './vet/VetMyShop';
import VetOwnerProfile from './vet/VetOwnerProfile';
import VaccinationTable from './vet/VaccinationTable';

// Import Admin components
import AdminClients from './admin/AdminClients';
import AdminVendors from './admin/AdminVendors';
import AdminPets from './admin/AdminPets';

// Import Trainer components
import TrainerProfile from './trainer/TrainerProfile';
import TrainerTrainingPackages from './trainer/TrainerTrainingPackages';

export default function DashboardScreen() {
  const { authUser, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'myshop' | 'profile' | 'charges'

  return (
    <LinearGradient colors={['#f3e8ff', '#e0f2fe', '#e0e7ff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Container */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.nameText}>{authUser?.fullName || 'Vendor Partner'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Feather name="log-out" size={20} color="#b91c1c" />
            </TouchableOpacity>
          </View>

          {/* Role Badge or Groomer Tabs Selector */}
          {role?.toLowerCase() === 'pet grooming shop' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'myshop', label: 'My Shop', icon: 'home' },
                  { id: 'profile', label: 'Owner Profile', icon: 'user' },
                  { id: 'charges', label: 'Grooming Charges', icon: 'dollar-sign' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : role?.toLowerCase() === 'vendor' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'available_pets', label: 'Available', icon: 'heart' },
                  { id: 'sold_out_pets', label: 'Sold Out', icon: 'shopping-bag' },
                  { id: 'mating_pets', label: 'Mating', icon: 'activity' },
                  { id: 'sale_receipts', label: 'Sale Bills', icon: 'file-text' },
                  { id: 'mating_receipts', label: 'Mating Bills', icon: 'clipboard' },
                  { id: 'shop_details', label: 'My Shop', icon: 'home' },
                  { id: 'owner_profile', label: 'Owner Profile', icon: 'user' },
                  { id: 'trash_bin', label: 'Trash Bin', icon: 'trash-2' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : role?.toLowerCase() === 'pet boarding shop' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'boarding_myshop', label: 'My Shop', icon: 'home' },
                  { id: 'boarding_profile', label: 'Owner Profile', icon: 'user' },
                  { id: 'boarding_charges', label: 'Boarding Charges', icon: 'dollar-sign' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : role?.toLowerCase() === 'pet trainer' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'trainer_profile', label: 'My Profile', icon: 'user' },
                  { id: 'trainer_packages', label: 'Training Packages', icon: 'award' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : role?.toLowerCase() === 'vet hospital' || role?.toLowerCase() === 'doctor' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'vet_myshop', label: 'My Shop', icon: 'home' },
                  { id: 'vet_profile', label: 'Owner Profile', icon: 'user' },
                  { id: 'vet_vaccinations', label: 'Vaccination Table', icon: 'activity' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : role?.toLowerCase() === 'admin' ? (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}>
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid' },
                  { id: 'admin_clients', label: 'Clients', icon: 'users' },
                  { id: 'admin_vendors', label: 'Vendors', icon: 'briefcase' },
                  { id: 'admin_pets', label: 'My Pets', icon: 'heart' },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}>
                      <Feather
                        name={tab.icon}
                        size={14}
                        color={isActive ? '#ffffff' : '#64748b'}
                        style={styles.tabIcon}
                      />
                      <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.badgeContainer}>
              <View style={styles.roleBadge}>
                <Feather name="shield" size={16} color="#7c3aed" />
                <Text style={styles.roleBadgeText}>{role || 'Vendor'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Main Content Area */}
        {activeTab === 'overview' ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Profile Card */}
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Feather name="user" size={18} color="#7c3aed" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Username</Text>
                  <Text style={styles.detailValue}>{authUser?.username || 'Not Set'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Feather name="mail" size={18} color="#7c3aed" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Email Address</Text>
                  <Text style={styles.detailValue}>{authUser?.email || 'Not Set'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Feather name="phone" size={18} color="#7c3aed" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <Text style={styles.detailValue}>{authUser?.phoneNumber || 'Not Set'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Feather name="map-pin" size={18} color="#7c3aed" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{authUser?.location || 'Not Set'}</Text>
                </View>
              </View>

              {authUser?.vendorShopName || authUser?.shopName || authUser?.clinicName ? (
                <View style={styles.detailRow}>
                  <Feather name="home" size={18} color="#7c3aed" style={styles.detailIcon} />
                  <View>
                    <Text style={styles.detailLabel}>Facility / Business Name</Text>
                    <Text style={styles.detailValue}>
                      {authUser.vendorShopName || authUser.shopName || authUser.clinicName}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Feather name="info" size={20} color="#6b21a8" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                {role?.toLowerCase() === 'pet grooming shop'
                  ? 'You are logged into the Petzu Vendor Portal. Tap the navigation tabs at the top to configure your Shop info, edit Owner Profile, or manage Grooming Service Charges.'
                  : role?.toLowerCase() === 'vet hospital' || role?.toLowerCase() === 'doctor'
                    ? 'You are logged into the Petzu Vet Hospital Portal. Tap the navigation tabs at the top to configure your Clinic details, edit Owner Profile, or manage the Vaccination Table.'
                    : role?.toLowerCase() === 'pet boarding shop'
                      ? 'You are logged into the Petzu Boarding Portal. Tap the navigation tabs at the top to configure your Boarding Shop details, edit Owner Profile, or manage Boarding Charges.'
                      : role?.toLowerCase() === 'pet trainer'
                        ? 'You are logged into the Petzu Pet Trainer Portal. Tap the navigation tabs to update your Profile or manage your Training Packages.'
                        : role?.toLowerCase() === 'admin'
                          ? 'You are logged into the Petzu Admin Panel. Use the tabs above to manage Clients, verify Vendors across all categories, and create Pet Listings.'
                          : 'You are logged into the Petzu Breeder Portal. Tap the navigation tabs at the top to configure your Shop info, edit Owner Profile, manage Breeder listings, or generate receipts.'}
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.componentContainer}>
            {activeTab === 'myshop' ? (
              <GroomingMyShop />
            ) : activeTab === 'profile' ? (
              <GroomingOwnerProfile />
            ) : activeTab === 'charges' ? (
              <GroomingCharges />
            ) : activeTab === 'available_pets' ? (
              <AvailablePets />
            ) : activeTab === 'sold_out_pets' ? (
              <SoldoutPets />
            ) : activeTab === 'mating_pets' ? (
              <MatingPets />
            ) : activeTab === 'sale_receipts' ? (
              <SaleReceipts />
            ) : activeTab === 'mating_receipts' ? (
              <MatingReceipts />
            ) : activeTab === 'shop_details' ? (
              <BreederShop />
            ) : activeTab === 'owner_profile' ? (
              <BreederProfile />
            ) : activeTab === 'trash_bin' ? (
              <TrashBin />
            ) : activeTab === 'boarding_myshop' ? (
              <BoardingMyShop />
            ) : activeTab === 'boarding_profile' ? (
              <BoardingOwnerProfile />
            ) : activeTab === 'boarding_charges' ? (
              <BoardingCharges />
            ) : activeTab === 'vet_myshop' ? (
              <VetMyShop />
            ) : activeTab === 'vet_profile' ? (
              <VetOwnerProfile />
            ) : activeTab === 'vet_vaccinations' ? (
              <VaccinationTable />
            ) : activeTab === 'admin_clients' ? (
              <AdminClients />
            ) : activeTab === 'admin_vendors' ? (
              <AdminVendors />
            ) : activeTab === 'admin_pets' ? (
              <AdminPets />
            ) : activeTab === 'trainer_profile' ? (
              <TrainerProfile />
            ) : activeTab === 'trainer_packages' ? (
              <TrainerTrainingPackages />
            ) : null}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e1b4b',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    marginLeft: 6,
  },
  // Tabs styles
  tabsContainer: {
    marginBottom: 8,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  tabButtonActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  // Content styles
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  componentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 14,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 16,
    backgroundColor: '#f5f3ff',
    padding: 10,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6b21a8',
    flex: 1,
    lineHeight: 18,
  },
});
