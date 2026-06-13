import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import theme from '../constants/theme';

const ACCOUNT_TYPES = [
  { label: 'Auto-Detect', value: '' },
  { label: 'Pet Breeder', value: 'Vendor' },
  { label: 'Vet Hospital', value: 'Vet Hospital' },
  { label: 'Pet Trainer', value: 'Pet Trainer' },
  { label: 'Pet Grooming Shop', value: 'Pet Grooming Shop' },
  { label: 'Pet Boarding Shop', value: 'Pet Boarding Shop' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError('');

    const loginData = {
      email: email.trim(),
      password,
      accountType,
    };

    const result = await login(loginData);

    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => {
        useAuthStore.getState().checkAuth();
      }, 1500);
    } else {
      setSubmitError(result.message);
      if (result.requiresAccountType) {
        setFormErrors((prev) => ({ ...prev, accountType: 'Please select your account type' }));
      }
    }
  };

  const getSelectedLabel = () => {
    const found = ACCOUNT_TYPES.find((t) => t.value === accountType);
    return found ? found.label : 'Auto-Detect';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color="#7c3aed" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your Petzu vendor account</Text>
            </View>

            {/* Success Overlay state */}
            {loginSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successBadge}>
                  <Feather name="check-circle" size={50} color="#ffffff" />
                </View>
                <Text style={styles.successTitle}>Login Successful!</Text>
                <Text style={styles.successSubtitle}>Redirecting to your dashboard...</Text>
              </View>
            ) : (
              <View style={styles.card}>
                {submitError ? (
                  <View style={styles.errorBanner}>
                    <Feather
                      name="alert-circle"
                      size={18}
                      color="#b91c1c"
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{submitError}</Text>
                  </View>
                ) : null}

                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="mail" size={14} color="#7c3aed" /> Email Address
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.email ? styles.inputError : null]}
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {formErrors.email ? (
                    <Text style={styles.errorHelp}>{formErrors.email}</Text>
                  ) : null}
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.label}>
                      <Feather name="lock" size={14} color="#7c3aed" /> Password
                    </Text>
                  </View>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        formErrors.password ? styles.inputError : null,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (formErrors.password)
                          setFormErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#7c3aed" />
                    </TouchableOpacity>
                  </View>
                  {formErrors.password ? (
                    <Text style={styles.errorHelp}>{formErrors.password}</Text>
                  ) : null}
                </View>

                {/* Account Type dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Feather name="briefcase" size={14} color="#7c3aed" /> Account Type (Optional)
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      formErrors.accountType ? styles.inputError : null,
                    ]}
                    onPress={() => setShowDropdown(true)}>
                    <Text
                      style={[styles.dropdownValue, !accountType ? styles.placeholderText : null]}>
                      {getSelectedLabel()}
                    </Text>
                    <Feather name="chevron-down" size={20} color="#7c3aed" />
                  </TouchableOpacity>
                  {formErrors.accountType ? (
                    <Text style={styles.errorHelp}>{formErrors.accountType}</Text>
                  ) : (
                    <Text style={styles.fieldHelp}>
                      Leave as &quot;Auto-Detect&quot; unless you have multiple shops
                    </Text>
                  )}
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.signInButtonWrapper}
                  onPress={handleSubmit}
                  disabled={isLoggingIn}>
                  <View style={styles.signInButton}>
                    {isLoggingIn ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.signInText}>Sign In</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Footer redirection */}
                <View style={styles.formFooter}>
                  <Text style={styles.footerLabel}>Don&apos;t have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.footerLink}>Sign up here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Account Type Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account Type</Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ACCOUNT_TYPES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    item.value === accountType ? styles.modalOptionSelected : null,
                  ]}
                  onPress={() => {
                    setAccountType(item.value);
                    setShowDropdown(false);
                    if (formErrors.accountType) {
                      setFormErrors((prev) => ({ ...prev, accountType: '' }));
                    }
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      item.value === accountType ? styles.modalOptionTextSelected : null,
                    ]}>
                    {item.label}
                  </Text>
                  {item.value === accountType ? (
                    <Feather name="check" size={18} color="#7c3aed" />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.canvas,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.SIZES.lg,
    paddingBottom: theme.SIZES.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: theme.SIZES.md,
    marginBottom: theme.SIZES.lg,
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.md,
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.sm,
  },
  backText: {
    marginLeft: 6,
    color: theme.COLORS.primary,
    fontSize: theme.TEXT.bodySecondary.fontSize,
    fontWeight: theme.FONTS.semiBold,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: theme.SIZES.xl,
  },
  title: {
    ...theme.TEXT.h1,
    marginBottom: theme.SIZES.sm,
  },
  subtitle: {
    ...theme.TEXT.body,
    color: theme.COLORS.textSecondary,
  },
  card: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.RADIUS.xl,
    padding: theme.SIZES.lg,
    ...theme.SHADOWS.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.COLORS.errorLight,
    borderWidth: 1,
    borderColor: theme.COLORS.error,
    padding: theme.SIZES.md,
    borderRadius: theme.RADIUS.md,
    marginBottom: theme.SIZES.lg,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: theme.COLORS.error,
    fontSize: 13,
    fontWeight: theme.FONTS.semiBold,
    flex: 1,
  },
  inputGroup: {
    marginBottom: theme.SIZES.lg,
  },
  label: {
    ...theme.TEXT.label,
    marginBottom: theme.SIZES.sm,
  },
  input: {
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  inputError: {
    borderColor: theme.COLORS.error,
  },
  errorHelp: {
    color: theme.COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: theme.FONTS.medium,
    marginLeft: 4,
  },
  fieldHelp: {
    color: theme.COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
    paddingHorizontal: theme.SIZES.md,
    height: theme.SIZES.inputHeight,
  },
  dropdownValue: {
    fontSize: theme.TEXT.body.fontSize,
    color: theme.COLORS.text,
  },
  placeholderText: {
    color: theme.COLORS.textSecondary,
  },
  signInButtonWrapper: {
    borderRadius: theme.RADIUS.lg,
    marginTop: theme.SIZES.sm,
    marginBottom: theme.SIZES.md,
    ...theme.SHADOWS.md,
  },
  signInButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.SIZES.buttonHeight,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
  },
  signInText: {
    color: theme.COLORS.surface,
    fontSize: 16,
    fontWeight: theme.FONTS.bold,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerLabel: {
    color: '#475569',
    fontSize: 14,
  },
  footerLink: {
    color: '#7c3aed',
    fontWeight: '700',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '60%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#f8f5ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 15,
    color: '#475569',
  },
  modalOptionTextSelected: {
    color: '#7c3aed',
    fontWeight: '700',
  },
});
