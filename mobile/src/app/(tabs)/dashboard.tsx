import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';

const lockIcon = require('@/assets/images/sign-in/lock.svg');

const accountActions = [
  {
    title: 'Sign in',
    description: 'Access your LuferaOne account.',
    href: '/sign-in',
    icon: lockIcon,
  },
  {
    title: 'Create account',
    description: 'Get started with LuferaOne.',
    href: '/sign-up',
    icon: require('@/assets/images/sign-in/person.svg'),
  },
] as const;

const signInMethods = [
  { label: 'Email and password', icon: require('@/assets/images/sign-in/email.svg') },
  { label: 'Google', icon: require('@/assets/images/sign-in/google.svg') },
  { label: 'Facebook', icon: require('@/assets/images/sign-in/facebook.svg') },
];

export default function DashboardScreen() {
  const { width, fontScale } = useWindowDimensions();
  const availableWidth = width / Math.max(1, fontScale);
  const compact = availableWidth < 360;
  const wide = availableWidth >= 680;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.content, compact && styles.compactContent, wide && styles.wideContent]}>
          <View style={styles.brand}>
            <View style={styles.brandMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={styles.brandInitial}>L</Text>
            </View>
            <Text style={styles.brandName}>
              Lufera<Text style={styles.brandAccent}>One</Text>
            </Text>
          </View>

          <View style={[styles.hero, compact && styles.compactHero, wide && styles.wideHero]}>
            <View pointerEvents="none" style={styles.outerRing} />
            <View pointerEvents="none" style={styles.innerRing} />
            <View style={styles.heroMark}>
              <Image source={lockIcon} accessible={false} style={styles.actionIcon} />
            </View>
            <View style={styles.heroCopy}>
              <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle, wide && styles.wideTitle]}>
                Dashboard
              </Text>
              <Text style={styles.intro}>Sign in to your LuferaOne account or create one to get started.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>Account access</Text>
            <View style={[styles.actions, wide && styles.actionRow]}>
              {accountActions.map(({ title, description, href, icon }, index) => (
                <Link key={href} href={href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={title}
                    accessibilityHint={description}
                    style={({ pressed }) => [
                      styles.action,
                      wide && styles.wideAction,
                      index === 0 && styles.primaryAction,
                      pressed && styles.pressed,
                    ]}>
                    <View style={[styles.actionMark, index === 0 && styles.primaryMark]}>
                      <Image source={icon} accessible={false} style={styles.actionIcon} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{title}</Text>
                      <Text style={styles.description}>{description}</Text>
                    </View>
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={styles.arrowMark}>
                      <View style={styles.arrow} />
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>

          <View style={[styles.methods, compact && styles.compactMethods]}>
            <Text accessibilityRole="header" style={styles.methodsHeading}>Sign-in methods</Text>
            <View style={styles.methodList}>
              {signInMethods.map(({ label, icon }) => (
                <View key={label} style={styles.method}>
                  <Image source={icon} accessible={false} style={styles.methodIcon} />
                  <Text style={styles.methodLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F8' },
  scroll: { paddingBottom: BottomTabInset + 24 },
  content: { alignSelf: 'center', width: '100%', maxWidth: 960, padding: 24, gap: 26 },
  compactContent: { padding: 16, gap: 20 },
  wideContent: { padding: 36, gap: 32 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#006D6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  brandName: { flexShrink: 1, color: '#172C2E', fontSize: 24, fontWeight: '700', letterSpacing: -0.8 },
  brandAccent: { color: '#007779' },
  hero: {
    overflow: 'hidden',
    backgroundColor: '#103638',
    borderRadius: 24,
    padding: 26,
    gap: 20,
  },
  compactHero: { padding: 20 },
  wideHero: { padding: 38, gap: 24 },
  outerRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: '#376467',
    right: -98,
    bottom: -178,
  },
  innerRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#194547',
    right: -63,
    bottom: -143,
  },
  heroMark: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#CFEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { gap: 8 },
  title: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1.2 },
  compactTitle: { fontSize: 29 },
  wideTitle: { fontSize: 48 },
  intro: { color: '#D1E6E5', maxWidth: 440, fontSize: 16 },
  section: { gap: 12 },
  heading: { color: '#172C2E', fontSize: 21, fontWeight: '700', letterSpacing: -0.35 },
  actions: { gap: 12 },
  actionRow: { flexDirection: 'row' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    gap: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E4E4',
    borderRadius: 16,
  },
  wideAction: { flex: 1, padding: 18 },
  primaryAction: { borderColor: '#92C8C3', backgroundColor: '#EAF7F4' },
  pressed: { backgroundColor: '#DDF1EE', borderColor: '#548E89' },
  actionMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECF3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMark: { backgroundColor: '#CFEDE8' },
  actionIcon: { width: 22, height: 22 },
  actionText: { flex: 1, minWidth: 0, gap: 4 },
  actionTitle: { color: '#172C2E', fontSize: 16, fontWeight: '700' },
  description: { color: '#415B60', fontSize: 14 },
  arrowMark: { width: 16, alignItems: 'center' },
  arrow: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#006D6D',
    transform: [{ rotate: '45deg' }],
  },
  methods: { borderTopWidth: 1, borderColor: '#D7E4E4', paddingTop: 20, gap: 12 },
  compactMethods: { paddingTop: 16 },
  methodsHeading: { color: '#172C2E', fontSize: 16, fontWeight: '700' },
  methodList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E4E4',
    borderRadius: 12,
  },
  methodIcon: { width: 17, height: 17 },
  methodLabel: { flexShrink: 1, color: '#415B60', fontSize: 14, fontWeight: '500' },
});
