import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  type ImageSourcePropType,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Text from '../components/Text';

const { width, height } = Dimensions.get('window');

// Exact proportional sizing matching the 390x844 reference artboard:
const BASE_WIDTH = Math.min(width * 0.90, 350);
const SCALE = BASE_WIDTH / 350;

const CARD1_W = 310 * SCALE;
const CARD1_H = (310 * (510 / 334)) * SCALE;
const CARD2_W = 265 * SCALE;
const CARD2_H = (265 * (248 / 278)) * SCALE;
const CARD2_TOP = 135 * SCALE;
const CARDS_CONTAINER_HEIGHT = CARD2_TOP + CARD2_H;

export interface OnboardingSlideData {
  id: string;
  badge?: string;
  title?: string;
  description?: string;
  card1: ImageSourcePropType;
  card2?: ImageSourcePropType;
}

const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'slide-1',
    badge: 'Smart Planning',
    title: 'Welcome to Workmate!',
    description:
      'Make Smart Decisions! Set clear timelines for projects and celebrate your achievements!',
    card1: require('../assets/Onboarding/TodayMeeting.png'),
    card2: require('../assets/Onboarding/TodayTask.png'),
  },
  {
    id: 'slide-2',
    badge: 'Working Period',
    title: 'Track Working Period',
    description:
      'Monitor your average working hours, analyze productive periods, and keep all projects on track!',
    card1: require('../assets/Onboarding/WorkingPeriod.png'),
    card2: require('../assets/Onboarding/TodayTask.png'),
  },
  {
    id: 'slide-3',
    badge: 'Working Level',
    title: 'Balance Your Workload',
    description:
      'Keep track of sprint story points, ensure balanced task distribution, and hit every milestone with confidence!',
    card1: require('../assets/Onboarding/WorkingLevel.png'),
    card2: require('../assets/Onboarding/TodayTask.png'),
  },
  {
    id: 'slide-4',
    badge: 'Team Success',
    description:
      'Gain end-to-end visibility across daily meetings, priorities, and sprint goals to deliver great results together!',
    card1: require('../assets/Onboarding/TodayMeeting.png'),
    card2: require('../assets/Onboarding/TodayTask.png'),
  },
];

interface Props {
  onComplete?: () => void;
  onSkip?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({
  onComplete,
  onSkip,
  onSignIn,
  onSignUp,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      onComplete?.();
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      onComplete?.();
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete?.();
    }
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < ONBOARDING_SLIDES.length) {
      setActiveIndex(newIndex);
    }
  };

  const renderVisualCards = (slide: OnboardingSlideData) => {
    return (
      <View style={styles.visualContainer}>
        {/* Soft Ambient Light Glow */}
        <View style={styles.ambientGlow} />

        {/* Centered Composition Wrapper: Card 1 and Card 2 overlapping and centered */}
        <View style={styles.cardsWrapper}>
          {/* Card 1: Back layer asset (TodayMeeting / WorkingPeriod / WorkingLevel) */}
          <Image
            source={slide.card1}
            style={styles.card1Image}
            resizeMode="contain"
          />

          {/* Card 2: Front layer asset (TodayTask) overlapping bottom-right of Card 1 */}
          {slide.card2 && (
            <Image
              source={slide.card2}
              style={styles.card2Image}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    );
  };

  const renderSlideItem = ({ item }: { item: OnboardingSlideData }) => {
    return (
      <View style={styles.slideContainer}>
        {/* Upper Visual illustration using asset images */}
        {renderVisualCards(item)}

        {/* Text Content */}
        <View style={styles.textContainer}>
          {item.title ? (
            <Text
              text={item.title}
              weight="800"
              size={25}
              color="#111827"
              textAlign="center"
              styles={styles.titleText}
            />
          ) : null}
          {item.description ? (
            <Text
              text={item.description}
              size={14}
              lineHeight={22}
              color="#4B5563"
              textAlign="center"
              styles={styles.descText}
            />
          ) : null}
        </View>
      </View>
    );
  };

  const isLastSlide = activeIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top Background Gradient */}
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA', '#EDE9FE', '#FFFFFF']}
        locations={[0, 0.38, 0.72, 1]}
        style={styles.gradientBg}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Slides Horizontal Scroll List */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          renderItem={renderSlideItem}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={styles.flatList}
        />

        {/* Bottom Navigation Section */}
        <View style={styles.bottomSection}>
          {/* Indicator Pills */}
          <View style={styles.indicatorContainer}>
            {ONBOARDING_SLIDES.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleDotPress(index)}
                  style={[
                    styles.indicatorPill,
                    isActive ? styles.indicatorActive : styles.indicatorInactive,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {isLastSlide ? (
              <>
                <Button
                  title="Sign In"
                  onPress={handleSignIn}
                  type="primary"
                  size="large"
                  radius={28}
                  styles={styles.nextButton}
                />
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  outline
                  size="large"
                  radius={28}
                  styles={styles.skipButton}
                />
              </>
            ) : (
              <>
                <Button
                  title="Next"
                  onPress={handleNext}
                  type="primary"
                  size="large"
                  radius={28}
                  styles={styles.nextButton}
                />
                <Button
                  title="Skip"
                  onPress={handleSkip}
                  outline
                  size="large"
                  radius={28}
                  styles={styles.skipButton}
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.58,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 8,
  },
  visualContainer: {
    width: width,
    height: CARDS_CONTAINER_HEIGHT + 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: Platform.OS === 'android' ? 14 : 6,
  },
  ambientGlow: {
    position: 'absolute',
    width: BASE_WIDTH * 0.75,
    height: BASE_WIDTH * 0.75,
    borderRadius: (BASE_WIDTH * 0.75) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    top: 10,
    alignSelf: 'center',
  },
  cardsWrapper: {
    width: BASE_WIDTH,
    height: CARDS_CONTAINER_HEIGHT,
    position: 'relative',
    alignSelf: 'center',
  },
  card1Image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD1_W,
    height: CARD1_H,
  },
  card2Image: {
    position: 'absolute',
    top: CARD2_TOP,
    right: 0,
    width: CARD2_W,
    height: CARD2_H,
  },
  textContainer: {
    paddingHorizontal: 32,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  descText: {
    maxWidth: 320,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  indicatorPill: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 28,
    backgroundColor: '#6F3FF3',
  },
  indicatorInactive: {
    width: 14,
    backgroundColor: '#E4D7FC',
  },
  buttonsContainer: {
    width: '100%',
  },
  nextButton: {
    marginBottom: 12,
  },
  skipButton: {
    marginBottom: 0,
  },
});
