import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VyronexBrand } from '@/components/VyronexBrand';

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        pointerEvents="none"
        style={[
          styles.orbit,
          { borderColor: colors.primary, opacity: 0.16 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbitInner,
          { borderColor: colors.accent, opacity: 0.12 },
        ]}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topInset + 12,
            paddingBottom: bottomInset + 20,
          },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline}>
          <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.toplineText, { color: colors.mutedForeground }]}>
            UN ESPACE À PART
          </Text>
          <Feather name="shield" size={14} color={colors.accent} />
        </View>

        <View style={styles.hero}>
          <View
            style={[
              styles.markHalo,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <VyronexBrand />
          </View>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Le lien, autrement.
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            Un espace social pensé pour vos idées, vos passions et les
            personnes qui comptent.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            testID="create-account-button"
            accessibilityRole="button"
            accessibilityLabel="Créer un compte"
            onPress={() => router.push('/register')}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              Créer un compte
            </Text>
            <Feather
              name="arrow-up-right"
              size={18}
              color={colors.primaryForeground}
            />
          </Pressable>

          <Pressable
            testID="sign-in-button"
            accessibilityRole="button"
            accessibilityLabel="Se connecter"
            onPress={() => router.push('/login')}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
              Se connecter
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerRule, { backgroundColor: colors.border }]} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            VOTRE CERCLE. VOTRE SIGNATURE.
          </Text>
          <Text style={[styles.versionText, { color: colors.accent }]}>
            VYRONEX · MAQUETTE
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  orbit: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    top: '21%',
    alignSelf: 'center',
  },
  orbitInner: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1,
    top: '25%',
    alignSelf: 'center',
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  toplineText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2.2,
  },
  hero: {
    alignItems: 'center',
    marginTop: 20,
  },
  markHalo: {
    width: 216,
    height: 216,
    borderRadius: 108,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    marginTop: 26,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 30,
    letterSpacing: -1.1,
  },
  description: {
    maxWidth: 300,
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
  },
  actions: {
    gap: 12,
    marginTop: 28,
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerRule: {
    width: 38,
    height: 1,
    marginBottom: 14,
  },
  footerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.7,
  },
  versionText: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.6,
  },
});
