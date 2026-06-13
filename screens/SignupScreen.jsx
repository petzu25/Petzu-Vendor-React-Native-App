import React, { useState, useEffect, useRef } from 'react';
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import axios from '../lib/axios';
import theme from '../constants/theme';

const ACCOUNT_TYPES = [
  { label: 'Pet Breeder', value: 'Vendor' },
  { label: 'Vet Hospital', value: 'Vet Hospital' },
  { label: 'Pet Trainer', value: 'Pet Trainer' },
  { label: 'Pet Grooming Shop', value: 'Pet Grooming Shop' },
  { label: 'Pet Boarding Shop', value: 'Pet Boarding Shop' },
];

const ACCOUNT_FIELDS = {
  Vendor: ['vendorShopName', 'gstNumber', 'location', 'shopAddress'],
  'Pet Grooming Shop': ['vendorShopName', 'gstNumber', 'location', 'shopAddress'],
  'Vet Hospital': ['doctorLicenseNumber', 'clinicName', 'location', 'clinicAddress'],
  'Pet Trainer': ['aadharNumber', 'location'],
  'Pet Boarding Shop': ['shopName', 'location', 'shopAddress'],
};

const FIELD_LABELS = {
  vendorShopName: 'Shop Name',
  shopName: 'Boarding Facility Name',
  gstNumber: 'GST Number (Optional)',
  location: 'Location (City/Area)',
  shopAddress: 'Complete Shop Address',
  doctorLicenseNumber: 'Doctor License Number (Optional)',
  clinicName: 'Clinic Name',
  clinicAddress: 'Complete Clinic Address',
  aadharNumber: 'Aadhar Number',
};

const FIELD_PLACEHOLDERS = {
  vendorShopName: 'Enter your shop name',
  shopName: 'Enter boarding facility name',
  gstNumber: 'Enter GST number (optional)',
  location: 'City, State (e.g. Mumbai, MH)',
  shopAddress: 'Enter complete shop address',
  doctorLicenseNumber: 'Enter license number (optional)',
  clinicName: 'Enter clinic name',
  clinicAddress: 'Enter complete clinic address',
  aadharNumber: 'Enter 12-digit Aadhar number',
};

export default function SignupScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    email: '',
    password: '',
    accountType: 'Vendor',
    vendorShopName: '',
    shopName: '',
    gstNumber: '',
    shopAddress: '',
    doctorLicenseNumber: '',
    clinicName: '',
    location: '',
    clinicAddress: '',
    aadharNumber: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signup, isSigningUp } = useAuthStore();
  const availabilityTimers = useRef({});

  useEffect(() => {
    const timers = availabilityTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Password validation checks
  const getPasswordCriteria = () => {
    const p = formData.password;
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    };
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        errors.fullName = 'Name must be at least 2 characters';
      }

      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      } else if (!/^[a-zA-Z0-9_]{3,15}$/.test(formData.username)) {
        errors.username = 'Username must be 3-15 chars, letters/numbers/underscores only';
      }

      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[- ]/g, ''))) {
        errors.phoneNumber = 'Phone number must be a 10-digit number';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    } else if (step === 2) {
      if (!formData.accountType) {
        errors.accountType = 'Account type is required';
      } else {
        const fields = ACCOUNT_FIELDS[formData.accountType] || [];
        fields.forEach((field) => {
          const val = formData[field] || '';
          if (field === 'gstNumber' || field === 'doctorLicenseNumber') {
            // Optional, but if typed, validate format
            if (val.trim()) {
              if (
                field === 'gstNumber' &&
                !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.trim())
              ) {
                errors.gstNumber = 'Invalid GST format (e.g. 22AAAAA1111A1Z1)';
              }
            }
          } else {
            // Required field
            if (!val.trim()) {
              errors[field] = `${FIELD_LABELS[field]} is required`;
            } else if (field === 'aadharNumber' && !/^\d{12}$/.test(val.trim())) {
              errors.aadharNumber = 'Aadhar number must be a 12-digit number';
            }
          }
        });
      }
    } else if (step === 3) {
      const criteria = getPasswordCriteria();
      const meetsAll = Object.values(criteria).every(Boolean);
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!meetsAll) {
        errors.password = 'Password does not meet all criteria';
      }

      if (!termsAccepted) {
        errors.terms = 'You must accept the Terms and Conditions';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');

    // Trigger backend availability validation with debounce
    if (['username', 'email', 'phoneNumber'].includes(field)) {
      if (availabilityTimers.current[field]) {
        clearTimeout(availabilityTimers.current[field]);
      }

      const shouldCheck =
        (field === 'username' && val.trim().length >= 3) ||
        (field === 'email' && /\S+@\S+\.\S+/.test(val.trim())) ||
        (field === 'phoneNumber' && /^\d{10}$/.test(val.trim()));

      if (shouldCheck) {
        availabilityTimers.current[field] = setTimeout(async () => {
          try {
            const params = { field, value: val.trim() };
            if (formData.accountType) params.accountType = formData.accountType;
            const res = await axios.get('/vendors/availability', { params });
            if (res.data && res.data.available === false) {
              const takenMessages = {
                username: 'Username is already taken',
                email: 'Email is already in use',
                phoneNumber: 'Phone number is already in use',
              };
              setFormErrors((prev) => ({
                ...prev,
                [field]: takenMessages[field] || 'Not available',
              }));
            }
          } catch {
            // Silently ignore network checks failing
          }
        }, 500);
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setSubmitError('');
  };

  const getCleanedData = () => {
    const cleaned = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      password: formData.password,
      accountType: formData.accountType,
      termsAccepted,
    };

    const fields = ACCOUNT_FIELDS[formData.accountType] || [];
    fields.forEach((field) => {
      const val = formData[field] || '';
      if (val.trim()) {
        cleaned[field] = val.trim();
      }
    });

    return cleaned;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitError('');

    const submissionData = getCleanedData();
    const result = await signup(submissionData);

    if (result.success) {
      setSignupSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } else {
      setSubmitError(result.message);
    }
  };

  const getAccountTypeLabel = () => {
    const found = ACCOUNT_TYPES.find((t) => t.value === formData.accountType);
    return found ? found.label : 'Select Account Type';
  };

  const criteria = getPasswordCriteria();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Header / Back */}
            <View style={styles.topNav}>
              <TouchableOpacity
                onPress={currentStep > 1 ? prevStep : () => navigation.goBack()}
                style={styles.backButton}>
                <Feather name="arrow-left" size={20} color="#7c3aed" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.stepTitle}>Step {currentStep} of 3</Text>
            </View>

            {/* Step Progress Bar */}
            <View style={styles.progressContainer}>
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <View
                    style={[
                      styles.progressDot,
                      step < currentStep ? styles.progressDotDone : null,
                      step === currentStep ? styles.progressDotActive : null,
                    ]}>
                    {step < currentStep ? (
                      <Feather name="check" size={14} color="#ffffff" />
                    ) : (
                      <Text
                        style={[
                          styles.progressDotText,
                          step === currentStep ? styles.progressDotTextActive : null,
                        ]}>
                        {step}
                      </Text>
                    )}
                  </View>
                  {step < 3 ? (
                    <View
                      style={[
                        styles.progressLine,
                        step < currentStep ? styles.progressLineDone : null,
                      ]}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </View>

            {/* Header Text */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {currentStep === 1 && 'Personal Details'}
                {currentStep === 2 && 'Business Details'}
                {currentStep === 3 && 'Secure Your Account'}
              </Text>
              <Text style={styles.subtitle}>
                {currentStep === 1 && 'Let’s start with your basic vendor contact information'}
                {currentStep === 2 && 'Tell us about your services and operating facility'}
                {currentStep === 3 && 'Choose a strong password and accept terms to launch'}
              </Text>
            </View>

            {/* Main Form Body */}
            {signupSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successBadge}>
                  <Feather name="smile" size={50} color="#ffffff" />
                </View>
                <Text style={styles.successTitle}>Registration Successful!</Text>
                <Text style={styles.successSubtitle}>Taking you to the login screen...</Text>
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

                {/* Step 1 Content */}
                {currentStep === 1 ? (
                  <View>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={[styles.input, formErrors.fullName ? styles.inputError : null]}
                        placeholder="Enter your full name"
                        placeholderTextColor="#94a3b8"
                        value={formData.fullName}
                        onChangeText={(text) => handleInputChange('fullName', text)}
                      />
                      {formErrors.fullName ? (
                        <Text style={styles.errorHelp}>{formErrors.fullName}</Text>
                      ) : null}
                    </View>

                    {/* Username */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Username</Text>
                      <TextInput
                        style={[styles.input, formErrors.username ? styles.inputError : null]}
                        placeholder="Choose a username"
                        placeholderTextColor="#94a3b8"
                        value={formData.username}
                        onChangeText={(text) => handleInputChange('username', text)}
                        autoCapitalize="none"
                      />
                      {formErrors.username ? (
                        <Text style={styles.errorHelp}>{formErrors.username}</Text>
                      ) : null}
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Phone Number</Text>
                      <TextInput
                        style={[styles.input, formErrors.phoneNumber ? styles.inputError : null]}
                        placeholder="10-digit mobile number"
                        placeholderTextColor="#94a3b8"
                        value={formData.phoneNumber}
                        onChangeText={(text) => handleInputChange('phoneNumber', text)}
                        keyboardType="phone-pad"
                      />
                      {formErrors.phoneNumber ? (
                        <Text style={styles.errorHelp}>{formErrors.phoneNumber}</Text>
                      ) : null}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={[styles.input, formErrors.email ? styles.inputError : null]}
                        placeholder="you@example.com"
                        placeholderTextColor="#94a3b8"
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {formErrors.email ? (
                        <Text style={styles.errorHelp}>{formErrors.email}</Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Step 2 Content */}
                {currentStep === 2 ? (
                  <View>
                    {/* Account Type selection */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Account Type</Text>
                      <TouchableOpacity
                        style={styles.dropdownTrigger}
                        onPress={() => setShowAccountTypeModal(true)}>
                        <Text style={styles.dropdownValue}>{getAccountTypeLabel()}</Text>
                        <Feather name="chevron-down" size={20} color="#7c3aed" />
                      </TouchableOpacity>
                    </View>

                    {/* Dynamic Fields */}
                    {ACCOUNT_FIELDS[formData.accountType]?.map((field) => (
                      <View key={field} style={styles.inputGroup}>
                        <Text style={styles.label}>{FIELD_LABELS[field]}</Text>
                        {field === 'shopAddress' || field === 'clinicAddress' ? (
                          <TextInput
                            style={[
                              styles.input,
                              styles.textAreaInput,
                              formErrors[field] ? styles.inputError : null,
                            ]}
                            placeholder={FIELD_PLACEHOLDERS[field]}
                            placeholderTextColor="#94a3b8"
                            value={formData[field]}
                            onChangeText={(text) => handleInputChange(field, text)}
                            multiline={true}
                            numberOfLines={3}
                          />
                        ) : (
                          <TextInput
                            style={[styles.input, formErrors[field] ? styles.inputError : null]}
                            placeholder={FIELD_PLACEHOLDERS[field]}
                            placeholderTextColor="#94a3b8"
                            value={formData[field]}
                            onChangeText={(text) => handleInputChange(field, text)}
                          />
                        )}
                        {formErrors[field] ? (
                          <Text style={styles.errorHelp}>{formErrors[field]}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Step 3 Content */}
                {currentStep === 3 ? (
                  <View>
                    {/* Password input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Create Password</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={[
                            styles.input,
                            styles.passwordInput,
                            formErrors.password ? styles.inputError : null,
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          value={formData.password}
                          onChangeText={(text) => handleInputChange('password', text)}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}>
                          <Feather
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color="#7c3aed"
                          />
                        </TouchableOpacity>
                      </View>
                      {formErrors.password ? (
                        <Text style={styles.errorHelp}>{formErrors.password}</Text>
                      ) : null}

                      {/* Real-time Checklist */}
                      {formData.password.length > 0 ? (
                        <View style={styles.checklist}>
                          <View style={styles.checklistRow}>
                            <Feather
                              name={criteria.length ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={criteria.length ? '#10b981' : '#64748b'}
                              style={styles.checkIcon}
                            />
                            <Text
                              style={[
                                styles.checklistText,
                                criteria.length ? styles.checkSuccess : null,
                              ]}>
                              At least 8 characters
                            </Text>
                          </View>
                          <View style={styles.checklistRow}>
                            <Feather
                              name={criteria.uppercase ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={criteria.uppercase ? '#10b981' : '#64748b'}
                              style={styles.checkIcon}
                            />
                            <Text
                              style={[
                                styles.checklistText,
                                criteria.uppercase ? styles.checkSuccess : null,
                              ]}>
                              An uppercase letter
                            </Text>
                          </View>
                          <View style={styles.checklistRow}>
                            <Feather
                              name={criteria.lowercase ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={criteria.lowercase ? '#10b981' : '#64748b'}
                              style={styles.checkIcon}
                            />
                            <Text
                              style={[
                                styles.checklistText,
                                criteria.lowercase ? styles.checkSuccess : null,
                              ]}>
                              A lowercase letter
                            </Text>
                          </View>
                          <View style={styles.checklistRow}>
                            <Feather
                              name={criteria.number ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={criteria.number ? '#10b981' : '#64748b'}
                              style={styles.checkIcon}
                            />
                            <Text
                              style={[
                                styles.checklistText,
                                criteria.number ? styles.checkSuccess : null,
                              ]}>
                              A number
                            </Text>
                          </View>
                          <View style={styles.checklistRow}>
                            <Feather
                              name={criteria.specialChar ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={criteria.specialChar ? '#10b981' : '#64748b'}
                              style={styles.checkIcon}
                            />
                            <Text
                              style={[
                                styles.checklistText,
                                criteria.specialChar ? styles.checkSuccess : null,
                              ]}>
                              A special character (!@#$%^&*)
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>

                    {/* Terms and conditions switch */}
                    <View style={styles.termsContainer}>
                      <View style={styles.termsHeader}>
                        <Switch
                          value={termsAccepted}
                          onValueChange={(val) => {
                            setTermsAccepted(val);
                            if (formErrors.terms) setFormErrors((prev) => ({ ...prev, terms: '' }));
                          }}
                          trackColor={{ false: '#cbd5e1', true: '#c084fc' }}
                          thumbColor={termsAccepted ? '#7c3aed' : '#f1f5f9'}
                        />
                        <View style={styles.termsLabelRow}>
                          <Text style={styles.termsText}>I accept the </Text>
                          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                            <Text style={styles.termsLink}>Terms and Conditions</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      {formErrors.terms ? (
                        <Text style={styles.errorHelp}>{formErrors.terms}</Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Submit Actions */}
                <View style={styles.navRow}>
                  {currentStep > 1 ? (
                    <TouchableOpacity style={styles.navBtnBack} onPress={prevStep}>
                      <Feather name="chevron-left" size={18} color="#475569" />
                      <Text style={styles.navBtnBackText}>Back</Text>
                    </TouchableOpacity>
                  ) : null}

                  {currentStep < 3 ? (
                    <TouchableOpacity style={styles.navBtnNext} onPress={nextStep}>
                      <Text style={styles.navBtnNextText}>Continue</Text>
                      <Feather name="chevron-right" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.submitBtnWrapper}
                      onPress={handleSubmit}
                      disabled={isSigningUp}>
                      <View style={styles.submitBtn}>
                        {isSigningUp ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.submitBtnText}>Create Account</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Account Type Modal */}
      <Modal
        visible={showAccountTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAccountTypeModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountTypeModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Account Type</Text>
              <TouchableOpacity onPress={() => setShowAccountTypeModal(false)}>
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
                    formData.accountType === item.value ? styles.modalOptionSelected : null,
                  ]}
                  onPress={() => {
                    handleInputChange('accountType', item.value);
                    setShowAccountTypeModal(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      formData.accountType === item.value ? styles.modalOptionTextSelected : null,
                    ]}>
                    {item.label}
                  </Text>
                  {formData.accountType === item.value ? (
                    <Feather name="check" size={18} color="#7c3aed" />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}>
        <View style={styles.termsModalOverlay}>
          <View style={styles.termsModalContent}>
            <View style={styles.termsModalHeader}>
              <Text style={styles.termsModalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Feather name="x" size={22} color="#475569" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.termsBody}>
              <Text style={styles.termsHeading}>1. Acceptance of Terms</Text>
              <Text style={styles.termsParagraph}>
                By creating a vendor account on Petzu, you agree to comply with and be bound by the
                following terms and conditions of use.
              </Text>
              <Text style={styles.termsHeading}>2. Vendor Verification</Text>
              <Text style={styles.termsParagraph}>
                All vendor profiles are subject to review by administrative authorities. Providing
                false identification information (e.g. incorrect Aadhar, Licensure, or Shop Details)
                will result in immediate termination of the account.
              </Text>
              <Text style={styles.termsHeading}>3. Services & Fees</Text>
              <Text style={styles.termsParagraph}>
                Vendors are solely responsible for service provision. Commissions (e.g. 2% admin,
                98% shop) are applied as described at checkout/payment completion.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.termsCloseBtn} onPress={() => setShowTermsModal(false)}>
              <Text style={styles.termsCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  stepTitle: {
    fontSize: 14,
    fontWeight: theme.FONTS.bold,
    color: theme.COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: theme.COLORS.surface,
    borderColor: theme.COLORS.primary,
    borderWidth: 2,
    shadowColor: theme.COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressDotDone: {
    backgroundColor: theme.COLORS.primary,
    borderColor: theme.COLORS.primary,
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: theme.FONTS.bold,
    color: theme.COLORS.textSecondary,
  },
  progressDotTextActive: {
    color: theme.COLORS.primary,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  progressLineDone: {
    backgroundColor: theme.COLORS.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.SIZES.xl,
  },
  title: {
    ...theme.TEXT.h2,
    textAlign: 'center',
    marginBottom: theme.SIZES.sm,
  },
  subtitle: {
    ...theme.TEXT.body,
    color: theme.COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
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
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: theme.SIZES.sm,
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
  checklist: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  checklistText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  checkSuccess: {
    color: theme.COLORS.success,
    fontWeight: theme.FONTS.bold,
  },
  termsContainer: {
    marginBottom: theme.SIZES.lg,
    marginTop: theme.SIZES.sm,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    flexWrap: 'wrap',
    flex: 1,
  },
  termsText: {
    color: theme.COLORS.textSecondary,
    fontSize: theme.TEXT.bodySecondary.fontSize,
  },
  termsLink: {
    color: theme.COLORS.primary,
    fontWeight: theme.FONTS.bold,
    fontSize: theme.TEXT.bodySecondary.fontSize,
    textDecorationLine: 'underline',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.SIZES.sm,
    gap: 12,
  },
  navBtnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.SIZES.sm,
    paddingHorizontal: theme.SIZES.lg,
    backgroundColor: theme.COLORS.surface,
    borderWidth: 1.5,
    borderColor: theme.COLORS.borderDark,
    borderRadius: theme.RADIUS.lg,
  },
  navBtnBackText: {
    color: theme.COLORS.textSecondary,
    fontSize: theme.TEXT.body.fontSize,
    fontWeight: theme.FONTS.bold,
    marginLeft: 4,
  },
  navBtnNext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
  },
  navBtnNextText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.body.fontSize,
    fontWeight: theme.FONTS.bold,
    marginRight: 4,
  },
  submitBtnWrapper: {
    flex: 1,
    borderRadius: theme.RADIUS.lg,
    ...theme.SHADOWS.md,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.RADIUS.lg,
  },
  submitBtnText: {
    color: theme.COLORS.surface,
    fontSize: theme.TEXT.body.fontSize,
    fontWeight: theme.FONTS.bold,
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
    textAlign: 'center',
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
  termsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  termsModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '75%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  termsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 16,
  },
  termsModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  termsBody: {
    marginBottom: 20,
  },
  termsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  termsParagraph: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  termsCloseBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  termsCloseBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
