import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#f3e8ff', '#e0f2fe', '#e0e7ff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Decorative Blob */}
        <View style={styles.topBlob} />

        <View style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            <LinearGradient colors={['#a855f7', '#3b82f6']} style={styles.logoGradient}>
              <Feather name="shield" size={50} color="#ffffff" />
            </LinearGradient>
            <View style={styles.sparkleIcon}>
              <Feather name="star" size={24} color="#eab308" />
            </View>
          </View>

          {/* Title & Slogan */}
          <View style={styles.titleSection}>
            <Text style={styles.brandName}>PETZU</Text>
            <Text style={styles.title}>Vendor Portal</Text>
            <Text style={styles.subtitle}>
              Grow your pet care business. Connect with thousands of pet parents, manage
              appointments, and access records.
            </Text>
          </View>

          {/* Glass Card Actions */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeader}>Select an option to get started</Text>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.loginBtnWrapper}
              onPress={() => navigation.navigate('Login')}>
              <LinearGradient
                colors={['#9333ea', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>Sign In</Text>
                <Feather name="arrow-right" size={20} color="#ffffff" style={styles.btnIcon} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.signupBtn}
              onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupBtnText}>Create Vendor Account</Text>
              <Feather name="user-plus" size={18} color="#4f46e5" style={styles.btnIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Petzu, Inc. All rights reserved.</Text>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  sparkleIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8b5cf6',
    letterSpacing: 3,
    marginBottom: 6,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e1b4b',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginBtnWrapper: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.15)',
  },
  signupBtnText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  footer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});
