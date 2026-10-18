import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ForgotPasswordStep = 'email' | 'otp' | 'new_password' | 'success';

interface Props {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (email: string, newPassword: string) => void;
}

export const ForgotPasswordModal: React.FC<Props> = ({
  visible,
  initialEmail = '',
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<ForgotPasswordStep>('email');

  // Step 1: Email
  const [email, setEmail] = useState(initialEmail);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2: OTP
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef<(TextInput | null)[]>([]);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Reset or initialize state when opening
  useEffect(() => {
    if (visible) {
      setStep('email');
      setEmail(initialEmail || '');
      setEmailError('');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setResendCooldown(60);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [visible, initialEmail]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (visible && step === 'otp' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, step, resendCooldown]);

  // Step 1: Send verification code
  const handleSendCode = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setResendCooldown(60);
    setStep('otp');
    setTimeout(() => {
      otpInputs.current[0]?.focus();
    }, 200);
  };

  // Step 2: OTP input handlers
  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // Pasted full OTP
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((char, i) => {
        newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      if (chars.length === 6) {
        otpInputs.current[5]?.focus();
      } else {
        otpInputs.current[chars.length]?.focus();
      }
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    if (otpError) setOtpError('');

    if (cleaned && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    Alert.alert('Code Resent', `A new verification code has been sent to ${email || 'your email'}.`);
    otpInputs.current[0]?.focus();
  };

  const handleSubmitOtp = () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the code.');
      return;
    }
    setOtpError('');
    setStep('new_password');
  };

  // Step 3: Set New Password
  const handleSubmitNewPassword = () => {
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setStep('success');
  };

  // Step 4: Finished -> Go to Sign In
  const handleSuccessSignIn = () => {
    onSuccess(email.trim(), newPassword);
    onClose();
  };

  const isEmailButtonActive = Boolean(email.trim());
  const isOtpButtonActive = otpDigits.every((d) => d !== '');
  const isPasswordButtonActive = Boolean(newPassword && confirmPassword);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.backdropDismiss}
        />

        <View style={styles.sheetCard}>
          {/* Top Floating Purple Shield Badge */}
          <View style={styles.floatingBadge}>
            <Ionicons name="shield-checkmark" size={26} color="#FFFFFF" />
          </View>

          {/* Sheet Handle */}
          <View style={styles.sheetHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* ==================== 1. STEP: EMAIL ==================== */}
            {step === 'email' && (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  A verification code will be sent to your email to reset your password.
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View
                    style={[
                      styles.inputBox,
                      emailFocused && styles.inputBoxFocused,
                      Boolean(emailError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? '#6F3FF3' : '#9CA3AF'}
                      style={styles.prefixIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="My email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                  {Boolean(emailError) && (
                    <Text style={styles.errorText}>{emailError}</Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSendCode}
                  disabled={!isEmailButtonActive}
                  style={[
                    styles.primaryBtn,
                    !isEmailButtonActive && styles.primaryBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      !isEmailButtonActive && styles.primaryBtnTextDisabled,
                    ]}
                  >
                    Send Verification Code
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ==================== 2. STEP: OTP ==================== */}
            {step === 'otp' && (
              <>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  A verification code has been sent to{' '}
                  <Text style={{ fontWeight: '700', color: '#111827' }}>
                    {email || 'Torvald@work.com'}
                  </Text>
                  , check your email to continue the password reset process.
                </Text>

                {/* 6 OTP Boxes */}
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
                      maxLength={idx === 0 ? 6 : 1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {Boolean(otpError) && (
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                )}

                {/* Resend Link */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendNormalText}>
                    {"Haven't received the verification code? "}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0}
                  >
                    <Text
                      style={[
                        styles.resendLinkText,
                        resendCooldown > 0 && styles.resendDisabled,
                      ]}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend it.'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmitOtp}
                  disabled={!isOtpButtonActive}
                  style={[
                    styles.primaryBtn,
                    !isOtpButtonActive && styles.primaryBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      !isOtpButtonActive && styles.primaryBtnTextDisabled,
                    ]}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ==================== 3. STEP: NEW PASSWORD ==================== */}
            {step === 'new_password' && (
              <>
                <Text style={styles.title}>Set a New Password</Text>
                <Text style={styles.subtitle}>
                  Please set a new password to secure your Work Mate account.
                </Text>

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputBox,
                      newPasswordFocused && styles.inputBoxFocused,
                      Boolean(passwordError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={newPasswordFocused ? '#6F3FF3' : '#9CA3AF'}
                      style={styles.prefixIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Input Password"
                      placeholderTextColor="#9CA3AF"
                      value={newPassword}
                      onChangeText={(val) => {
                        setNewPassword(val);
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      onFocus={() => setNewPasswordFocused(true)}
                      onBlur={() => setNewPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <View
                    style={[
                      styles.inputBox,
                      confirmPasswordFocused && styles.inputBoxFocused,
                      Boolean(passwordError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={confirmPasswordFocused ? '#6F3FF3' : '#9CA3AF'}
                      style={styles.prefixIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-Enter Your Password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {Boolean(passwordError) && (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmitNewPassword}
                  disabled={!isPasswordButtonActive}
                  style={[
                    styles.primaryBtn,
                    !isPasswordButtonActive && styles.primaryBtnDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      !isPasswordButtonActive && styles.primaryBtnTextDisabled,
                    ]}
                  >
                    Submit
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ==================== 4. STEP: SUCCESS ==================== */}
            {step === 'success' && (
              <>
                <Text style={styles.title}>Password Has Been Created</Text>
                <Text style={styles.subtitle}>
                  To explore your account, click the Sign In button and enter your email along with your new password.
                </Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSuccessSignIn}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  floatingBadge: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 26,
    marginTop: 6,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  fieldGroup: {
    marginBottom: 16,
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
    height: 50,
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
  prefixIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  otpBoxFilled: {
    borderColor: '#6F3FF3',
    backgroundColor: '#FFFFFF',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  otpErrorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  resendNormalText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resendLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F3FF3',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  primaryBtn: {
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
    marginTop: 6,
    marginBottom: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#EDE9FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryBtnTextDisabled: {
    color: '#8B5CF6',
  },
});
