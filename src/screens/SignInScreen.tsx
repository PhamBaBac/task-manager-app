import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Checkbox } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

type AuthMode = 'email' | 'phone' | 'employee' | 'otp';

interface Props {
  onBack?: () => void;
  onSuccess?: (userEmailOrPhone: string) => void;
  onNavigateToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export const SignInScreen: React.FC<Props> = ({
  onBack,
  onSuccess,
  onNavigateToSignUp,
  onForgotPassword,
}) => {
  const insets = useSafeAreaInsets();
  const [authMode, setAuthMode] = useState<AuthMode>('email');
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

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Phone form state
  const [countryCode, setCountryCode] = useState('INA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Employee ID form state
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [isEmployeeIdFocused, setIsEmployeeIdFocused] = useState(false);
  const [isEmployeePasswordFocused, setIsEmployeePasswordFocused] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState('');
  const [employeePasswordError, setEmployeePasswordError] = useState('');

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputs = useRef<Array<TextInput | null>>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Timer for OTP resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authMode === 'otp' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, resendCooldown]);

  // Handle Back Button
  const handleBackPress = () => {
    if (authMode === 'otp') {
      setAuthMode('phone');
    } else if (authMode === 'phone' || authMode === 'employee') {
      setAuthMode('email');
    } else {
      onBack?.();
    }
  };

  // Email Sign In submission
  const handleEmailSignIn = () => {
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email hasn't registered to any account");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Email hasn't registered to any account");
      return;
    }

    if (!password || password.length < 4) {
      setPasswordError('Wrong Password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.(trimmedEmail);
    }, 600);
  };

  // Phone Sign In submission -> switches to OTP
  const handlePhoneSignInSubmit = () => {
    setPhoneError('');
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    if (!cleanPhone || cleanPhone.length < 7) {
      setPhoneError("Phone number hasn't registered to any account");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setAuthMode('otp');
    }, 500);
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

  // OTP submission
  const handleOtpSubmit = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Please enter full 6-digit sign in code');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userIdent = phoneNumber
        ? `${countryCode === 'INA' ? '+62' : '+84'} ${phoneNumber.trim()}`
        : '+6282121090290';
      onSuccess?.(userIdent);
    }, 600);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    Alert.alert('Code Resent', 'A new 6-digit verification code has been sent.');
  };

  const handleOpenEmployeeSignIn = () => {
    setEmployeeIdError('');
    setEmployeePasswordError('');
    setAuthMode('employee');
  };

  const handleEmployeeSignInSubmit = () => {
    setEmployeeIdError('');
    setEmployeePasswordError('');

    const trimmedId = employeeId.trim();

    if (!trimmedId) {
      setEmployeeIdError("Employee ID hasn't registered to any account");
      return;
    }

    if (!employeePassword || employeePassword.length < 4) {
      setEmployeePasswordError('Wrong Password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.(trimmedId);
    }, 600);
  };

  const handleForgotPass = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        'Forgot Password',
        'Password reset link will be sent to your registered address.'
      );
    }
  };

  const toggleCountryCode = () => {
    setCountryCode((prev) => (prev === 'INA' ? '+84' : prev === '+84' ? '+62' : 'INA'));
  };

  const formattedTargetPhone = phoneNumber
    ? `${countryCode === 'INA' ? '+62' : countryCode} ${phoneNumber.trim()}`
    : '+6282121090290';

  const topSpacerHeight =
    authMode === 'otp'
      ? Math.round(Math.max(height * 0.38, 280))
      : authMode === 'phone'
      ? Math.round(Math.max(height * 0.16, 120))
      : Math.round(Math.max(height * 0.04, 24));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Dark Header Area */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={[styles.topBackdropSpacer, { height: topSpacerHeight }]} />
      </SafeAreaView>

      {/* Main White Card Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.cardContainer}>
          {/* Floating Phone Icon Badge for OTP step (matching Figma Screens 4 & 5) */}
          {authMode === 'otp' ? (
            <View style={styles.floatingPhoneBadge}>
              <Ionicons name="call" size={28} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              authMode === 'otp' && styles.scrollContentOtp,
            ]}
          >
            {/* ==================== 1. EMAIL SIGN IN ==================== */}
            {authMode === 'email' && (
              <>
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>Sign In</Text>
                  <Text style={styles.subtitleText}>Sign in to my account</Text>
                </View>

                {/* Email Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View
                    style={[
                      styles.inputBox,
                      Boolean(emailError) && styles.inputBoxError,
                      !emailError && isEmailFocused && styles.inputBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={
                        emailError
                          ? '#EF4444'
                          : isEmailFocused
                          ? '#6F3FF3'
                          : '#9CA3AF'
                      }
                      style={styles.inputLeftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="My Email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                    />
                  </View>
                  {Boolean(emailError) && (
                    <Text style={styles.errorText}>{emailError}</Text>
                  )}
                </View>

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputBox,
                      Boolean(passwordError) && styles.inputBoxError,
                      !passwordError && isPasswordFocused && styles.inputBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={
                        passwordError
                          ? '#EF4444'
                          : isPasswordFocused
                          ? '#6F3FF3'
                          : '#9CA3AF'
                      }
                      style={styles.inputLeftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="My Password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (passwordError) setPasswordError('');
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {Boolean(passwordError) && (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  )}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMeGroup}
                  >
                    <Checkbox
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      color={rememberMe ? '#6F3FF3' : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleForgotPass}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Sign In Button */}
                <Button
                  title="Sign In"
                  onPress={handleEmailSignIn}
                  type="primary"
                  size="large"
                  radius={28}
                  loading={isLoading}
                  styles={styles.primaryActionBtn}
                />

                {/* OR Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Alternative Sign In Buttons */}
                <Button
                  title="Sign In With Employee ID"
                  onPress={handleOpenEmployeeSignIn}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="card-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />

                <Button
                  title="Sign In With Phone"
                  onPress={() => {
                    setPhoneError('');
                    setAuthMode('phone');
                  }}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />
              </>
            )}

            {/* ==================== 2. PHONE SIGN IN ==================== */}
            {authMode === 'phone' && (
              <>
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>Sign In</Text>
                  <Text style={styles.subtitleText}>Sign in to my account</Text>
                </View>

                {/* Phone Number Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View
                    style={[
                      styles.phoneInputBox,
                      Boolean(phoneError) && styles.inputBoxError,
                      !phoneError && isPhoneFocused && styles.inputBoxFocused,
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={toggleCountryCode}
                      style={styles.countryPicker}
                    >
                      <Text style={styles.countryCodeText}>{countryCode}</Text>
                      <Ionicons name="chevron-down" size={14} color="#6B7280" />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.input}
                      placeholder="+62 821 0909 0000"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={(val) => {
                        setPhoneNumber(val);
                        if (phoneError) setPhoneError('');
                      }}
                      keyboardType="phone-pad"
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                    />
                  </View>
                  {Boolean(phoneError) && (
                    <Text style={styles.errorText}>{phoneError}</Text>
                  )}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMeGroup}
                  >
                    <Checkbox
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      color={rememberMe ? '#6F3FF3' : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleForgotPass}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Sign In Button */}
                <Button
                  title="Sign In"
                  onPress={handlePhoneSignInSubmit}
                  type="primary"
                  size="large"
                  radius={28}
                  loading={isLoading}
                  styles={styles.primaryActionBtn}
                />

                {/* OR Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Alternative Sign In Buttons */}
                <Button
                  title="Sign In With Employee ID"
                  onPress={handleOpenEmployeeSignIn}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="card-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />

                {/* Switch back to Email Sign In */}
                <Button
                  title="Sign In With Email"
                  onPress={() => {
                    setEmailError('');
                    setAuthMode('email');
                  }}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />
              </>
            )}

            {/* ==================== 3. EMPLOYEE ID SIGN IN ==================== */}
            {authMode === 'employee' && (
              <>
                <View style={styles.titleSection}>
                  <Text style={styles.titleText}>Sign In</Text>
                  <Text style={styles.subtitleText}>Sign in to my account</Text>
                </View>

                {/* Employee ID Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Employee ID</Text>
                  <View
                    style={[
                      styles.inputBox,
                      Boolean(employeeIdError) && styles.inputBoxError,
                      !employeeIdError && isEmployeeIdFocused && styles.inputBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={20}
                      color={
                        employeeIdError
                          ? '#EF4444'
                          : isEmployeeIdFocused
                          ? '#6F3FF3'
                          : '#9CA3AF'
                      }
                      style={styles.inputLeftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="My Employee ID"
                      placeholderTextColor="#9CA3AF"
                      value={employeeId}
                      onChangeText={(val) => {
                        setEmployeeId(val);
                        if (employeeIdError) setEmployeeIdError('');
                      }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      onFocus={() => setIsEmployeeIdFocused(true)}
                      onBlur={() => setIsEmployeeIdFocused(false)}
                    />
                  </View>
                  {Boolean(employeeIdError) && (
                    <Text style={styles.errorText}>{employeeIdError}</Text>
                  )}
                </View>

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputBox,
                      Boolean(employeePasswordError) && styles.inputBoxError,
                      !employeePasswordError && isEmployeePasswordFocused && styles.inputBoxFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={
                        employeePasswordError
                          ? '#EF4444'
                          : isEmployeePasswordFocused
                          ? '#6F3FF3'
                          : '#9CA3AF'
                      }
                      style={styles.inputLeftIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="My Password"
                      placeholderTextColor="#9CA3AF"
                      value={employeePassword}
                      onChangeText={(val) => {
                        setEmployeePassword(val);
                        if (employeePasswordError) setEmployeePasswordError('');
                      }}
                      secureTextEntry={!showEmployeePassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setIsEmployeePasswordFocused(true)}
                      onBlur={() => setIsEmployeePasswordFocused(false)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowEmployeePassword(!showEmployeePassword)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showEmployeePassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {Boolean(employeePasswordError) && (
                    <Text style={styles.errorText}>{employeePasswordError}</Text>
                  )}
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setRememberMe(!rememberMe)}
                    style={styles.rememberMeGroup}
                  >
                    <Checkbox
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      color={rememberMe ? '#6F3FF3' : undefined}
                      style={styles.checkbox}
                    />
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleForgotPass}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Sign In Button */}
                <Button
                  title="Sign In"
                  onPress={handleEmployeeSignInSubmit}
                  type="primary"
                  size="large"
                  radius={28}
                  loading={isLoading}
                  styles={styles.primaryActionBtn}
                />

                {/* OR Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Alternative Sign In Buttons */}
                <Button
                  title="Sign In With Email"
                  onPress={() => {
                    setEmailError('');
                    setAuthMode('email');
                  }}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />

                <Button
                  title="Sign In With Phone"
                  onPress={() => {
                    setPhoneError('');
                    setAuthMode('phone');
                  }}
                  outline
                  size="large"
                  radius={28}
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={19}
                      color="#6F3FF3"
                      style={{ marginRight: 8 }}
                    />
                  }
                  styles={styles.secondaryBtn}
                />
              </>
            )}

            {/* ==================== 4. OTP VERIFICATION ==================== */}
            {authMode === 'otp' && (
              <>
                <View style={styles.titleSectionOtp}>
                  <Text style={styles.titleText}>Sign In Phone Number</Text>
                  <Text style={styles.subtitleTextOtp}>
                    Sign in code has been sent to{' '}
                    <Text style={styles.highlightPhone}>{formattedTargetPhone}</Text>, check
                    your inbox to continue the sign in process.
                  </Text>
                </View>

                {/* 6 OTP Input Boxes */}
                <View style={styles.otpRow}>
                  {otpDigits.map((digit, idx) => {
                    const isFilled = digit.length > 0;
                    return (
                      <TextInput
                        key={idx}
                        ref={(ref) => {
                          otpInputs.current[idx] = ref;
                        }}
                        style={[
                          styles.otpBox,
                          isFilled && styles.otpBoxFilled,
                          Boolean(otpError) && styles.inputBoxError,
                        ]}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, idx)}
                        onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        textAlign="center"
                      />
                    );
                  })}
                </View>
                {Boolean(otpError) && (
                  <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>
                    {otpError}
                  </Text>
                )}

                {/* Resend Link */}
                <View style={styles.resendRow}>
                  <Text style={styles.resendNormalText}>
                    Haven't received the sign in code?{' '}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleResendOtp}
                    disabled={resendCooldown > 0}
                  >
                    <Text
                      style={[
                        styles.resendLinkText,
                        resendCooldown > 0 && styles.resendDisabled,
                      ]}
                    >
                      {resendCooldown > 0 ? `Resend In (${resendCooldown}s)` : 'Resend It.'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <Button
                  title="Submit"
                  onPress={handleOtpSubmit}
                  type="primary"
                  size="large"
                  radius={28}
                  loading={isLoading}
                  styles={styles.primaryActionBtn}
                />
              </>
            )}
          </ScrollView>

          {/* Fixed Bottom Footer pinned right against bottom of screen (hidden while typing) */}
          {!isKeyboardVisible && (
            <View
              style={[
                styles.bottomFixedFooter,
                { paddingBottom: Math.max(insets.bottom, 14) },
              ]}
            >
              {authMode === 'otp' ? (
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Sign with different method </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setAuthMode('phone')}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Text style={styles.signUpLinkText}>here.</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onNavigateToSignUp}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Text style={styles.signUpLinkText}>Sign Up Here</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B', // Dark indigo/navy matching Figma header
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBackdropSpacer: {
    height: Math.round(Math.max(height * 0.18, 145)),
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'visible',
    position: 'relative',
  },
  floatingPhoneBadge: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 16,
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
  sheetHandleContainer: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  scrollContentOtp: {
    paddingTop: 42,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSectionOtp: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '400',
    textAlign: 'center',
  },
  subtitleTextOtp: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 310,
  },
  highlightPhone: {
    color: '#111827',
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  inputBoxFocused: {
    borderColor: '#6F3FF3',
    backgroundColor: '#FAFAFF',
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF9F9',
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  rememberMeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderColor: '#D1D5DB',
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  forgotPassText: {
    fontSize: 13,
    color: '#6F3FF3',
    fontWeight: '600',
  },
  primaryActionBtn: {
    marginBottom: 14,
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  secondaryBtn: {
    marginBottom: 10,
  },
  bottomFixedFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  signUpLinkText: {
    fontSize: 13,
    color: '#6F3FF3',
    fontWeight: '700',
  },
  // OTP Styles
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  otpBoxFilled: {
    borderColor: '#6F3FF3',
    backgroundColor: '#FAFAFF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },
  resendNormalText: {
    fontSize: 13,
    color: '#6B7280',
  },
  resendLinkText: {
    fontSize: 13,
    color: '#6F3FF3',
    fontWeight: '700',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
});
