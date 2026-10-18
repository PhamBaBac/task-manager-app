import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { UserProfileData } from './WorkProfileScreen';

interface Props {
  profileData?: UserProfileData;
  isWorkProfileCompleted?: boolean;
  onBack?: () => void;
  onSetUpWorkProfile?: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  onContinueToApp?: () => void;
}

interface Achievement {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Dedicated\nMember',
    icon: 'ribbon',
    bg: '#E0F2FE',
    color: '#0284C7',
  },
  {
    id: '2',
    title: 'Fast\nLearner',
    icon: 'rocket',
    bg: '#F3E8FF',
    color: '#7C3AED',
  },
  {
    id: '3',
    title: 'Employee Of\nThe Year',
    icon: 'trophy',
    bg: '#FEF3C7',
    color: '#D97706',
  },
  {
    id: '4',
    title: 'Top\nPerformer',
    icon: 'star',
    bg: '#FCE7F3',
    color: '#DB2777',
  },
];

export const ProfileScreen: React.FC<Props> = ({
  profileData,
  isWorkProfileCompleted = false,
  onBack,
  onSetUpWorkProfile,
  onEditProfile,
  onLogout,
  onContinueToApp,
}) => {
  const insets = useSafeAreaInsets();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fullName = profileData?.firstName && profileData?.lastName
    ? `${profileData.firstName} ${profileData.lastName}`
    : 'Torvald Grumpy';

  const userEmail = profileData?.email || 'Torvald@work.com';
  const userPhone = profileData?.phone || '+62 821 5000 5000';
  const position = profileData?.position || 'Junior Full Stack Developer';
  const avatarUri =
    profileData?.avatarUri ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

  const handleLogoutPress = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Work Mate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => onLogout?.(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6F3FF3" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top Purple Header: flat bottom, NO border radius, behind avatar */}
        <View style={[styles.purpleHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={styles.headerBackButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 38 }} />
          </View>
          {/* Space so the purple block extends down to the exact center of the avatar */}
          <View style={{ height: 44 }} />
        </View>

        {/* Purple Corner Wrapper: Ensures the rounded corners of whiteSection show PURPLE */}
        <View style={styles.purpleCornerWrapper}>
          {/* White Section: rounded top corners */}
          <View style={[styles.whiteSection, { paddingBottom: insets.bottom + 40 }]}>
            {/* Avatar positioned exactly across the dividing line */}
            <View style={styles.avatarBorderContainer}>
              {isWorkProfileCompleted ? (
                <>
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onEditProfile}
                    style={styles.avatarEditBadge}
                  >
                    <Ionicons name="pencil" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.placeholderAvatarBox}>
                  <Ionicons name="happy-outline" size={44} color="#8B5CF6" />
                </View>
              )}
            </View>

          {/* User Name & Role */}
          <View style={styles.userInfoRow}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{fullName}</Text>
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />
            </View>

            <Text style={styles.userRole}>
              {isWorkProfileCompleted ? position : userEmail}
            </Text>
          </View>

          {/* ================= IF INCOMPLETE (SignUp/CompleteProfile - Screen 1) ================= */}
          {!isWorkProfileCompleted ? (
            <>
              {/* ACCOUNT SECTION */}
              <View style={styles.sectionWrapper}>
                <Text style={styles.sectionHeaderLabel}>ACCOUNT</Text>
                <View style={styles.cardBox}>
                {/* My Work Profile - Trigger to set up work profile */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onSetUpWorkProfile}
                  style={styles.menuItemRow}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="briefcase-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { fontWeight: '700' }]}>My Work Profile</Text>
                  </View>
                  <View style={styles.setupActionPill}>
                    <Text style={styles.setupActionText}>Set Up Work Profile</Text>
                    <Ionicons name="chevron-forward" size={16} color="#6F3FF3" />
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="notifications-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="color-palette-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Appearance</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="help-circle-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Help</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* GENERAL SECTION */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeaderLabel}>GENERAL</Text>
              <View style={styles.cardBox}>
                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="document-text-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Terms of Service</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Privacy Policy</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="information-circle-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>FAQ & Help</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogoutPress}
                  style={styles.menuItemRow}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Log out</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* ================= IF COMPLETED (SignUp/WorkProfile - Screen 6 & 7) ================= */
          <>
            {/* ACHIEVEMENTS SECTION (Screen 7) */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeaderLabel}>Achievements</Text>
              <View style={styles.achievementsRow}>
                {ACHIEVEMENTS.map((item) => (
                  <View key={item.id} style={styles.achievementItem}>
                    <View style={[styles.achievementIconCircle, { backgroundColor: item.bg }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <Text style={styles.achievementTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CONTACT SECTION */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeaderLabel}>CONTACT</Text>
              <View style={styles.cardBox}>
                <View style={styles.contactRow}>
                  <View style={styles.contactIconBg}>
                    <Ionicons name="mail-outline" size={18} color="#6F3FF3" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{userEmail}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.contactRow}>
                  <View style={styles.contactIconBg}>
                    <Ionicons name="call-outline" size={18} color="#6F3FF3" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{userPhone}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ACCOUNT SECTION */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeaderLabel}>ACCOUNT</Text>
              <View style={styles.cardBox}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onEditProfile}
                  style={styles.menuItemRow}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="person-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Personal Data</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="folder-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Written Assets</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="card-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Payment & Tax</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="document-text-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Notes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* SETTINGS SECTION */}
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionHeaderLabel}>SETTINGS</Text>
              <View style={styles.cardBox}>
                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Change Password</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="moon-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: '#E5E7EB', true: '#6F3FF3' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />

                <TouchableOpacity activeOpacity={0.7} style={styles.menuItemRow}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="help-circle-outline" size={20} color="#6F3FF3" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>FAQ and Help</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleLogoutPress}
                  style={styles.menuItemRow}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
  },
  purpleHeader: {
    backgroundColor: '#6F3FF3',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  purpleCornerWrapper: {
    backgroundColor: '#6F3FF3',
  },
  headerBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  whiteSection: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    minHeight: 700,
  },
  avatarBorderContainer: {
    marginTop: -44,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 8,
    zIndex: 10,
    elevation: 6,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  placeholderAvatarBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6F3FF3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfoRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  userRole: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionWrapper: {
    marginBottom: 18,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 14,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  setupActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  setupActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F3FF3',
    marginRight: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F3F4F6',
  },
});
