import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';

interface Props {
  onBack?: () => void;
  onNavigateToSignIn?: () => void;
  onSuccess?: (userData: { email: string; phone: string; companyId: string }) => void;
  onSetUpProfile?: (userData: { email: string; phone: string; companyId: string }) => void;
}

interface CountryOption {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'INA', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'VNM', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'USA', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'SGP', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MYS', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'GBR', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
];

export const SignUpScreen: React.FC<Props> = ({
  onBack,
  onNavigateToSignIn,
  onSuccess,
  onSetUpProfile,
}) => {
  // Form fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus & Validation
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Agreement & Modals
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Email Verification modal state (Screen 2 & 3: SignUp/EmailVerification)
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  // Welcome Success modal state (Screen 4: SignUp/Success)
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Keyboard visibility state (prevents footer from squeezing form when keyboard opens)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Please enter your phone number';
    } else if (trimmedPhone.replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!companyId.trim()) {
      newErrors.companyId = 'Please enter your Company ID';
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please accept the Terms & Conditions and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (!agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setResendCooldown(60);
      setShowVerificationModal(true);
      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 350);
    }, 450);
  };

  // Handle OTP digit changes
  const handleOtpChange = (val: string, index: number) => {
    setOtpError('');

    // Handle paste of multiple digits
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < cleaned.length; i++) {
        newDigits[i] = cleaned[i];
      }
      setOtpDigits(newDigits);
      const nextIdx = Math.min(cleaned.length, 5);
      otpInputs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResendVerificationCode = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    Alert.alert('Code Resent', `A new 6-digit verification code has been sent to ${email.trim()}.`);
  };

  const handleVerificationSubmit = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setShowVerificationModal(false);
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 300);
    }, 550);
  };

  const handleSetUpProfilePress = () => {
    setShowSuccessModal(false);
    const data = {
      email: email.trim(),
      phone: `${selectedCountry.dialCode} ${phone.trim()}`,
      companyId: companyId.trim(),
    };
    if (onSetUpProfile) {
      onSetUpProfile(data);
    } else {
      onSuccess?.(data);
    }
  };

  const handleExploreAppPress = () => {
    setShowSuccessModal(false);
    onSuccess?.({
      email: email.trim(),
      phone: `${selectedCountry.dialCode} ${phone.trim()}`,
      companyId: companyId.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Bar with Back Button */}
      <View style={styles.navBar}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <View style={styles.logoInner}>
                <View style={styles.logoBar} />
                <View style={[styles.logoBar, styles.logoBarShort]} />
                <View style={styles.logoBar} />
              </View>
            </View>
            <Text style={styles.brandTitle}>Work Mate</Text>
            <Text style={styles.brandSubtitle}>Register Using Your Credentials</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* 1. Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'email' && styles.inputBoxFocused,
                  Boolean(errors.email) && styles.inputBoxError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={
                    errors.email
                      ? '#EF4444'
                      : focusedField === 'email'
                      ? '#6F3FF3'
                      : '#9CA3AF'
                  }
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Your Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {Boolean(errors.email) && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* 2. Phone Number Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'phone' && styles.inputBoxFocused,
                  Boolean(errors.phone) && styles.inputBoxError,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowCountryModal(true)}
                  style={styles.countrySelector}
                >
                  <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                  <Ionicons name="chevron-down" size={14} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.phoneDivider} />

                <Text style={styles.dialCodePrefix}>{selectedCountry.dialCode}</Text>

                <TextInput
                  style={styles.textInput}
                  placeholder="0000 0000 0000"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                />
              </View>
              {Boolean(errors.phone) && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            {/* 3. Company ID Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Company ID</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'companyId' && styles.inputBoxFocused,
                  Boolean(errors.companyId) && styles.inputBoxError,
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={19}
                  color={
                    errors.companyId
                      ? '#EF4444'
                      : focusedField === 'companyId'
                      ? '#6F3FF3'
                      : '#9CA3AF'
                  }
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Company ID"
                  placeholderTextColor="#9CA3AF"
                  value={companyId}
                  onChangeText={(val) => {
                    setCompanyId(val);
                    if (errors.companyId)
                      setErrors((prev) => ({ ...prev, companyId: '' }));
                  }}
                  onFocus={() => setFocusedField('companyId')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
              </View>
              {Boolean(errors.companyId) && (
                <Text style={styles.errorText}>{errors.companyId}</Text>
              )}
            </View>

            {/* 4. Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'password' && styles.inputBoxFocused,
                  Boolean(errors.password) && styles.inputBoxError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={
                    errors.password
                      ? '#EF4444'
                      : focusedField === 'password'
                      ? '#6F3FF3'
                      : '#9CA3AF'
                  }
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="My Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {Boolean(errors.password) && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* 5. Confirm Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'confirmPassword' && styles.inputBoxFocused,
                  Boolean(errors.confirmPassword) && styles.inputBoxError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={
                    errors.confirmPassword
                      ? '#EF4444'
                      : focusedField === 'confirmPassword'
                      ? '#6F3FF3'
                      : '#9CA3AF'
                  }
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm My Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {Boolean(errors.confirmPassword) && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and Conditions Agreement */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowTermsModal(true)}
              style={styles.agreementRow}
            >
              <Checkbox
                value={agreedToTerms}
                onValueChange={(val) => {
                  if (val) {
                    setShowTermsModal(true);
                  } else {
                    setAgreedToTerms(false);
                  }
                }}
                color={agreedToTerms ? '#6F3FF3' : undefined}
                style={styles.checkbox}
              />
              <View style={styles.agreementTextContainer}>
                <Text style={styles.agreementNormalText}>
                  I agree with{' '}
                  <Text style={styles.agreementLinkText}>
                    terms & conditions
                  </Text>
                  {' and '}
                  <Text style={styles.agreementLinkText}>
                    privacy policy
                  </Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginTop: 2 }} />
            </TouchableOpacity>
            {Boolean(errors.terms) && (
              <Text style={[styles.errorText, { marginTop: -6, marginBottom: 12 }]}>
                {errors.terms}
              </Text>
            )}

            {/* Primary Sign Up Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={isLoading}
              style={[
                styles.signUpButton,
                isLoading && styles.signUpButtonDisabled,
              ]}
            >
              <Text style={styles.signUpButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Pinned Bottom Footer (Hidden during typing so it does not push or jump the form) */}
        {!isKeyboardVisible && (
          <View style={styles.bottomFixedFooter}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateToSignIn}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={styles.signInLinkText}>Sign In here</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ==================== COUNTRY PICKER MODAL ==================== */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.modalHeaderTitle}>Select Country</Text>

            <ScrollView style={{ maxHeight: 320 }}>
              {COUNTRIES.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCountry(c);
                      setShowCountryModal(false);
                    }}
                    style={[
                      styles.countryItem,
                      isSelected && styles.countryItemSelected,
                    ]}
                  >
                    <Text style={styles.countryFlag}>{c.flag}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.countryItemName}>{c.name}</Text>
                      <Text style={styles.countryItemSub}>{c.code}</Text>
                    </View>
                    <Text style={styles.countryItemDial}>{c.dialCode}</Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#6F3FF3"
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== TERMS & PRIVACY POLICY MODAL ==================== */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tncModalContent}>
            <View style={styles.sheetHandle} />

            <Text style={styles.tncModalTitle}>
              Terms & Conditions and{'\n'}Privacy Policy
            </Text>

            <ScrollView
              style={styles.tncScrollView}
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={styles.tncHeading}>Terms and Conditions:</Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Acceptance: </Text>
                By using the Work Mate app, you agree to comply with all applicable
                terms and conditions.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Usage: </Text>
                This app is for personal use only and may not be used for commercial
                purposes without permission.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Account: </Text>
                You are responsible for the security of your account and all
                activities that occur within it.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Content: </Text>
                You must not upload content that violates copyright, privacy or
                applicable laws.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Changes: </Text>
                We reserve the right to change the terms and conditions at any time
                and will notify you of these changes through the app or via email.
              </Text>

              <Text style={[styles.tncHeading, { marginTop: 18 }]}>
                Privacy Policy:
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Data Collection: </Text>
                We collect personal data such as name, email, and location to
                process transactions and improve our services.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Data Usage: </Text>
                Your data is used for internal purposes such as account management,
                usage analysis, and service offerings.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Security: </Text>
                We protect your data with appropriate security measures to prevent
                unauthorized access.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Data Sharing: </Text>
                We do not share your personal data with third parties without your
                consent, except as required by law.
              </Text>
              <Text style={styles.tncBody}>
                <Text style={styles.tncBold}>Your Rights: </Text>
                You can access, update, or delete your personal data at any time
                through account settings or by contacting our customer support.
              </Text>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.tncActionButtons}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setAgreedToTerms(true);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  setShowTermsModal(false);
                }}
                style={styles.agreeButton}
              >
                <Text style={styles.agreeButtonText}>I Agree</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowTermsModal(false)}
                style={styles.declineButton}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== SCREEN 2 & 3: EMAIL VERIFICATION MODAL ==================== */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.sheetCardWithFloatingBadge}>
            {/* Top Floating Badge with Mail & Red Notification Dot */}
            <View style={styles.floatingModalBadge}>
              <Ionicons name="mail" size={26} color="#FFFFFF" />
              <View style={styles.badgeNotificationDot} />
            </View>

            <View style={styles.sheetHandle} />

            <Text style={styles.sheetModalTitle}>Email Verification Sent!</Text>
            <Text style={styles.sheetModalSubtitle}>
              A verification code will be sent to the email{' '}
              <Text style={styles.highlightText}>
                {email.trim() || 'Hello@work.com'}
              </Text>{' '}
              for your account verification process.
            </Text>

            {/* 6 OTP Input Boxes */}
            <View style={styles.otpRow}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    otpInputs.current[idx] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    Boolean(digit) && styles.otpBoxFilled,
                    Boolean(otpError) && styles.otpBoxError,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
            </View>
            {Boolean(otpError) && (
              <Text style={styles.otpErrorText}>{otpError}</Text>
            )}

            {/* Resend Link */}
            <View style={styles.resendRow}>
              <Text style={styles.resendNormalText}>
                Haven't received the verification code?{' '}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResendVerificationCode}
                disabled={resendCooldown > 0}
              >
                <Text
                  style={[
                    styles.resendLinkText,
                    resendCooldown > 0 && styles.resendDisabled,
                  ]}
                >
                  {resendCooldown > 0 ? `Resend It (${resendCooldown}s)` : 'Resend It.'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleVerificationSubmit}
              disabled={isVerifying}
              style={[
                styles.sheetPrimaryButton,
                isVerifying && styles.sheetButtonDisabled,
              ]}
            >
              <Text style={styles.sheetPrimaryButtonText}>
                {isVerifying ? 'Verifying...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== SCREEN 4: WELCOME SUCCESS MODAL ==================== */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheetCardWithFloatingBadge}>
            {/* Top Floating Badge with Profile Icon */}
            <View style={styles.floatingModalBadge}>
              <Ionicons name="person" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.sheetHandle} />

            <Text style={styles.sheetModalTitle}>Welcome To Work Mate!</Text>
            <Text style={styles.sheetModalSubtitle}>
              To enhance your user experience, please set up your profile first.
              This will help us tailor the app to your needs and ensure you get
              the most out of our features!
            </Text>

            {/* Actions */}
            <View style={styles.welcomeActionsContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSetUpProfilePress}
                style={styles.sheetPrimaryButton}
              >
                <Text style={styles.sheetPrimaryButtonText}>Set Up My Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleExploreAppPress}
                style={styles.sheetSecondaryButton}
              >
                <Text style={styles.sheetSecondaryButtonText}>
                  Explore The App First
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  logoBar: {
    width: 5,
    height: 20,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  logoBarShort: {
    height: 12,
    opacity: 0.9,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  formSection: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    paddingHorizontal: 14,
  },
  inputBoxFocused: {
    borderColor: '#6F3FF3',
    backgroundColor: '#FFFFFF',
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputPrefixIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  dialCodePrefix: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 6,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    borderColor: '#D1D5DB',
  },
  agreementTextContainer: {
    flex: 1,
  },
  agreementNormalText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
    fontWeight: '400',
  },
  agreementLinkText: {
    color: '#6F3FF3',
    fontWeight: '600',
    textDecorationLine: 'none',
  },
  signUpButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    opacity: 0.65,
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  bottomFixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  signInLinkText: {
    fontSize: 13,
    color: '#6F3FF3',
    fontWeight: '700',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  countryItemSelected: {
    backgroundColor: '#F3E8FF',
  },
  countryFlag: {
    fontSize: 22,
  },
  countryItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  countryItemSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  countryItemDial: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6F3FF3',
  },

  /* TnC & Privacy Policy Modal */
  tncModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: height * 0.90,
  },
  tncModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  tncScrollView: {
    maxHeight: height * 0.60,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tncHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  tncBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4B5563',
    marginBottom: 8,
  },
  tncBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  tncActionButtons: {
    marginTop: 18,
    gap: 10,
  },
  agreeButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  agreeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  declineButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* Verification & Welcome Modals Styles */
  sheetCardWithFloatingBadge: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 36,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    position: 'relative',
    overflow: 'visible',
  },
  floatingModalBadge: {
    position: 'absolute',
    top: -29,
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  badgeNotificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  sheetModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sheetModalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  highlightText: {
    color: '#111827',
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  otpBoxFilled: {
    borderColor: '#6F3FF3',
    backgroundColor: '#FAF5FF',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  otpErrorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  resendNormalText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resendLinkText: {
    fontSize: 12,
    color: '#6F3FF3',
    fontWeight: '700',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  sheetPrimaryButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  sheetButtonDisabled: {
    opacity: 0.65,
  },
  sheetPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetSecondaryButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  sheetSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  welcomeActionsContainer: {
    marginTop: 12,
    marginBottom: 6,
  },
});
