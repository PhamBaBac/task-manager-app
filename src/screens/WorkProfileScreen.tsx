import React, { useState } from 'react';
import {
  Alert,
  Image,
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

export interface UserProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  position: string;
  address: string;
  avatarUri?: string;
  email: string;
  phone: string;
}

interface Props {
  initialData?: Partial<UserProfileData>;
  onBack?: () => void;
  onSaveProfileSuccess?: (data: UserProfileData) => void;
}

const POSITIONS = [
  'Junior Full Stack Developer',
  'Senior Frontend Engineer',
  'Backend Engineer',
  'UI/UX Product Designer',
  'Mobile App Developer',
  'Project Manager',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const YEARS_LIST = Array.from({ length: 65 }, (_, i) => 2024 - i);

export const WorkProfileScreen: React.FC<Props> = ({
  initialData,
  onBack,
  onSaveProfileSuccess,
}) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    initialData?.avatarUri || null
  );

  // Focus & dropdown states
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calendar states
  const [calYear, setCalYear] = useState(1991);
  const [calMonth, setCalMonth] = useState(10); // November (0-indexed)
  const [tempDay, setTempDay] = useState(10);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // Confirmation and Success modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUpdatedModal, setShowUpdatedModal] = useState(false);

  const openDatePicker = () => {
    if (dateOfBirth) {
      const parts = dateOfBirth.split(' ');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = MONTH_NAMES.indexOf(parts[1]);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d)) setTempDay(d);
        if (m >= 0) setCalMonth(m);
        if (!isNaN(y)) setCalYear(y);
      }
    }
    setIsYearPickerOpen(false);
    setShowDatePicker(true);
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const handleConfirmDate = () => {
    const formatted = `${tempDay < 10 ? '0' : ''}${tempDay} ${MONTH_NAMES[calMonth]} ${calYear}`;
    setDateOfBirth(formatted);
    setShowDatePicker(false);
  };

  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const handleUpdatePress = () => {
    if (!firstName.trim()) {
      Alert.alert('Required Field', 'Please enter your first name.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    setShowConfirmModal(false);
    setTimeout(() => {
      setShowUpdatedModal(true);
    }, 300);
  };

  const handleGoToProfile = () => {
    setShowUpdatedModal(false);
    const profile: UserProfileData = {
      firstName: firstName.trim() || 'Torvald',
      lastName: lastName.trim() || 'Grumpy',
      dateOfBirth: dateOfBirth.trim() || '10 November 1991',
      position: position.trim() || 'Junior Full Stack Developer',
      address: address.trim() || 'Jakarta, Indonesia',
      avatarUri: avatarUri || PRESET_AVATARS[0],
      email: initialData?.email || 'Torvald@work.com',
      phone: initialData?.phone || '+6282121090290',
    };
    onSaveProfileSuccess?.(profile);
  };

  const toggleAvatar = () => {
    if (!avatarUri) {
      setAvatarUri(PRESET_AVATARS[0]);
      return;
    }
    const nextIdx =
      (PRESET_AVATARS.findIndex((uri) => uri === avatarUri) + 1) %
      PRESET_AVATARS.length;
    setAvatarUri(PRESET_AVATARS[nextIdx]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navBarTitle}>My Work Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Personal Data Information */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Data Information</Text>
            <Text style={styles.sectionSubtitle}>Your personal data information</Text>
          </View>

          {/* Photo Upload Box */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleAvatar}
            style={styles.photoUploadContainer}
          >
            {avatarUri ? (
              <View style={styles.avatarPreviewWrapper}>
                <Image source={{ uri: avatarUri }} style={styles.avatarPreviewImage} />
                <View style={styles.avatarPlusBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </View>
            ) : (
              <View style={styles.photoUploadPlaceholder}>
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="image-outline" size={28} color="#6F3FF3" />
                  <View style={styles.avatarPlusBadge}>
                    <Ionicons name="add" size={12} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            )}
            <Text style={styles.photoUploadTitle}>
              {avatarUri ? 'Update Photo' : 'Upload Photo'}
            </Text>
            <Text style={styles.photoUploadSubtitle}>
              Format should be in .jpeg, .png with max size 5mb
            </Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'firstName' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={focusedField === 'firstName' ? '#6F3FF3' : '#9CA3AF'}
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Torvald"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'lastName' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={focusedField === 'lastName' ? '#6F3FF3' : '#9CA3AF'}
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Grumpy"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openDatePicker}
                style={[
                  styles.inputBox,
                  focusedField === 'dob' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#9CA3AF"
                  style={styles.inputPrefixIcon}
                />
                <Text
                  style={[
                    styles.selectText,
                    !dateOfBirth && styles.selectPlaceholderText,
                  ]}
                >
                  {dateOfBirth || 'Date of Birth'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Position */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Position</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPositionPicker(true)}
                style={[
                  styles.inputBox,
                  focusedField === 'position' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={19}
                  color="#9CA3AF"
                  style={styles.inputPrefixIcon}
                />
                <Text
                  style={[
                    styles.selectText,
                    !position && styles.selectPlaceholderText,
                  ]}
                >
                  {position || 'Current Position'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Address Section */}
            <View style={[styles.sectionHeader, { marginTop: 12 }]}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.sectionSubtitle}>Your current domicile</Text>
            </View>

            {/* Address Input */}
            <View style={styles.fieldGroup}>
              <View
                style={[
                  styles.inputBox,
                  focusedField === 'address' && styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={19}
                  color={focusedField === 'address' ? '#6F3FF3' : '#9CA3AF'}
                  style={styles.inputPrefixIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your address"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Update Profile Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUpdatePress}
            style={styles.updateButton}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ==================== 1. CONFIRM UPDATE MODAL ==================== */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Top Floating Badge */}
            <View style={styles.floatingModalBadge}>
              <Ionicons name="person" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>Update Profile</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to update your profile? This will help us
              tailor your user experience and provide personalized services.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmUpdate}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryBtnText}>Yes, Update Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowConfirmModal(false)}
                style={styles.modalSecondaryBtn}
              >
                <Text style={styles.modalSecondaryBtnText}>No, Let Me Check</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== 2. PROFILE UPDATED SUCCESS MODAL ==================== */}
      <Modal
        visible={showUpdatedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdatedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Top Floating Badge */}
            <View style={styles.floatingModalBadge}>
              <Ionicons name="person" size={26} color="#FFFFFF" />
            </View>

            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>Profile Updated!</Text>
            <Text style={styles.modalSubtitle}>
              Your profile has been successfully updated, please check your new
              profile data.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleGoToProfile}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryBtnText}>View My Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== 3. POSITION PICKER MODAL ==================== */}
      <Modal
        visible={showPositionPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPositionPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowPositionPicker(false)}
          style={styles.modalOverlay}
        >
          <View
            style={styles.pickerModalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.pickerHeaderTitle}>Select Position</Text>
            {POSITIONS.map((pos) => {
              const isSelected = pos === position;
              return (
                <TouchableOpacity
                  key={pos}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPosition(pos);
                    setShowPositionPicker(false);
                  }}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected,
                    ]}
                  >
                    {pos}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#6F3FF3" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== 4. DOB CALENDAR PICKER MODAL ==================== */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
          style={styles.modalOverlay}
        >
          <View
            style={styles.calendarModalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />

            {/* Header: Title and Close button */}
            <View style={styles.calendarHeaderRow}>
              <Text style={styles.calendarHeaderTitle}>Select Date of Birth</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.calendarCloseBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigation Row */}
            <View style={styles.calNavRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={prevMonth}
                style={styles.calNavArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-back" size={20} color="#1F2937" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsYearPickerOpen(!isYearPickerOpen)}
                style={styles.calMonthYearBtn}
              >
                <Text style={styles.calMonthYearText}>
                  {MONTH_NAMES[calMonth]} {calYear}
                </Text>
                <Ionicons
                  name={isYearPickerOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#6F3FF3"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={nextMonth}
                style={styles.calNavArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-forward" size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* If Year Picker Mode is Active: Grid of Years */}
            {isYearPickerOpen ? (
              <ScrollView
                style={styles.yearScrollContainer}
                contentContainerStyle={styles.yearGrid}
                showsVerticalScrollIndicator={false}
              >
                {YEARS_LIST.map((y) => {
                  const isCurYear = y === calYear;
                  return (
                    <TouchableOpacity
                      key={y}
                      activeOpacity={0.7}
                      onPress={() => {
                        setCalYear(y);
                        setIsYearPickerOpen(false);
                      }}
                      style={[
                        styles.yearGridItem,
                        isCurYear && styles.yearGridItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.yearGridText,
                          isCurYear && styles.yearGridTextSelected,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <>
                {/* Days of Week Header */}
                <View style={styles.calWeekRow}>
                  {DAYS_OF_WEEK.map((d) => (
                    <Text key={d} style={styles.calWeekDayText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View style={styles.calDaysGrid}>
                  {/* Empty leading cells */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={styles.calDayCell} />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = dayNum === tempDay;
                    return (
                      <TouchableOpacity
                        key={`day-${dayNum}`}
                        activeOpacity={0.7}
                        onPress={() => setTempDay(dayNum)}
                        style={styles.calDayCell}
                      >
                        <View
                          style={[
                            styles.calDayInner,
                            isSelected && styles.calDayInnerSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calDayText,
                              isSelected && styles.calDayTextSelected,
                            ]}
                          >
                            {dayNum}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Selected Date Summary & Confirm Action */}
            <View style={styles.calFooter}>
              <View style={styles.calSelectedSummary}>
                <Text style={styles.calSelectedLabel}>Selected Date</Text>
                <Text style={styles.calSelectedValue}>
                  {tempDay} {MONTH_NAMES[calMonth]} {calYear}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmDate}
                style={styles.calConfirmBtn}
              >
                <Text style={styles.calConfirmBtnText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default WorkProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  photoUploadContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    marginBottom: 20,
  },
  avatarPreviewWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoUploadPlaceholder: {
    marginBottom: 10,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  photoUploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  photoUploadSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 260,
  },
  formContainer: {
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
  inputPrefixIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  selectPlaceholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  bottomBar: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  updateButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
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
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  modalActions: {
    gap: 10,
  },
  modalPrimaryBtn: {
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
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  /* Pickers */
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  pickerHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#FAF5FF',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  pickerItemTextSelected: {
    color: '#6F3FF3',
    fontWeight: '700',
  },

  /* Calendar Date Picker */
  calendarModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  calendarHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  calendarCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  calNavArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calMonthYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calMonthYearText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6F3FF3',
  },
  calWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  calWeekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calDayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  calDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDayInnerSelected: {
    backgroundColor: '#6F3FF3',
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  calDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  calDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  yearScrollContainer: {
    maxHeight: 220,
    marginBottom: 16,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  yearGridItem: {
    width: '23%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  yearGridItemSelected: {
    backgroundColor: '#6F3FF3',
  },
  yearGridText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  yearGridTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calSelectedSummary: {
    flex: 1,
    marginRight: 12,
  },
  calSelectedLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  calSelectedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  calConfirmBtn: {
    backgroundColor: '#6F3FF3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#6F3FF3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  calConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
