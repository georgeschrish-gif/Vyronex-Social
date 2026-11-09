import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { FormField } from '@/components/AuthFlow';
import { VyronexBrand } from '@/components/VyronexBrand';
import {
  type RegistrationData,
  type SexOption,
  useRegistration,
} from '@/context/RegistrationContext';
import { useColors } from '@/hooks/useColors';

type SignupPage = 'identity' | 'details' | 'contact' | 'password';
type FieldKey = keyof RegistrationData;
type FieldErrors = Partial<Record<FieldKey, string>>;

const sexOptions: SexOption[] = [
  'Femme',
  'Homme',
  'Autre',
  'Je préfère ne pas répondre',
];

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhoneOrEmail(value: string) {
  if (isValidEmail(value)) return true;
  const digits = value.replace(/\D/g, '');
  return (
    /^\+?[\d\s().-]+$/.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

const pageCopy: Record<SignupPage, { title: string; subtitle: string }> = {
  identity: {
    title: 'Comment vous appelez-vous ?',
    subtitle: 'Indiquez le nom que votre cercle pourra reconnaître.',
  },
  details: {
    title: 'Quelques informations sur vous',
    subtitle: 'Votre date de naissance est nécessaire pour votre profil.',
  },
  contact: {
    title: 'Comment vous joindre ?',
    subtitle: 'Choisissez un numéro ou une adresse e-mail pour votre compte.',
  },
  password: {
    title: 'Sécurisez votre compte',
    subtitle: 'Choisissez un mot de passe et confirmez-le.',
  },
};

export function SignupStep({ page }: { page: SignupPage }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, updateField } = useRegistration();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const updateText = (field: FieldKey, value: string) => {
    updateField(field, value);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice('');
  };

  const goBack = () => {
    Keyboard.dismiss();
    if (page === 'identity') {
      router.replace('/');
      return;
    }
    router.back();
  };

  const continueRegistration = () => {
    const nextErrors: FieldErrors = {};

    if (page === 'identity') {
      if (!data.firstName.trim()) {
        nextErrors.firstName = 'Saisissez votre prénom.';
      }
      if (!data.lastName.trim()) {
        nextErrors.lastName = 'Saisissez votre nom.';
      }
    }

    if (page === 'details' && !isValidBirthDate(data.birthDate)) {
      nextErrors.birthDate =
        'Saisissez une date réelle au format JJ/MM/AAAA, antérieure à aujourd’hui.';
    }

    if (page === 'contact' && !isValidPhoneOrEmail(data.contact.trim())) {
      nextErrors.contact =
        'Saisissez un e-mail ou un numéro de téléphone valide.';
    }

    if (page === 'password') {
      if (data.password.length < 8) {
        nextErrors.password =
          'Le mot de passe doit contenir au moins 8 caractères.';
      }
      if (data.password !== data.confirm) {
        nextErrors.confirm = 'Les mots de passe ne correspondent pas.';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    Keyboard.dismiss();
    if (page === 'identity') {
      void Haptics.selectionAsync();
      router.push('/register-about');
    } else if (page === 'details') {
      void Haptics.selectionAsync();
      router.push('/register-contact');
    } else if (page === 'contact') {
      void Haptics.selectionAsync();
      router.push('/register-password');
    } else {
      setNotice(
        'Informations validées. Cette maquette ne crée pas de compte et ne transmet aucune donnée.',
      );
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const passwordAccessory = (field: 'password' | 'confirm') => {
    const visible = field === 'password' ? showPassword : showConfirm;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        hitSlop={10}
        onPress={() =>
          field === 'password'
            ? setShowPassword((current) => !current)
            : setShowConfirm((current) => !current)
        }
        style={styles.eyeButton}
      >
        <Feather
          name={visible ? 'eye-off' : 'eye'}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>
    );
  };

  const copy = pageCopy[page];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topInset + 12,
            paddingBottom: bottomInset + 24,
          },
        ]}
        bottomOffset={76}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            testID="signup-back-button"
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={goBack}
            hitSlop={10}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={17} color={colors.mutedForeground} />
            <Text style={[styles.backText, { color: colors.mutedForeground }]}>
              Retour
            </Text>
          </Pressable>
          <VyronexBrand compact />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {copy.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {copy.subtitle}
          </Text>
        </View>

        <View style={styles.form}>
          {page === 'identity' ? (
            <>
              <FormField
                label="Prénom"
                placeholder="Votre prénom"
                value={data.firstName}
                onChangeText={(value) => updateText('firstName', value)}
                error={errors.firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                testID="first-name-input"
                returnKeyType="next"
              />
              <FormField
                label="Nom"
                placeholder="Votre nom"
                value={data.lastName}
                onChangeText={(value) => updateText('lastName', value)}
                error={errors.lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                testID="last-name-input"
                returnKeyType="done"
                onSubmitEditing={continueRegistration}
              />
            </>
          ) : null}

          {page === 'details' ? (
            <>
              <FormField
                label="Date de naissance"
                placeholder="JJ/MM/AAAA"
                value={data.birthDate}
                onChangeText={(value) =>
                  updateText('birthDate', formatBirthDate(value))
                }
                error={errors.birthDate}
                autoCapitalize="none"
                keyboardType="number-pad"
                testID="birth-date-input"
                returnKeyType="done"
                onSubmitEditing={continueRegistration}
              />
              <View style={styles.sexSection}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  Sexe{' '}
                  <Text style={{ color: colors.mutedForeground }}>
                    (facultatif)
                  </Text>
                </Text>
                <View style={styles.sexOptions}>
                  {sexOptions.map((option) => {
                    const selected = data.sex === option;
                    return (
                      <Pressable
                        key={option}
                        testID={`sex-option-${option}`}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={option}
                        onPress={() => updateField('sex', option)}
                        style={({ pressed }) => [
                          styles.sexOption,
                          {
                            borderColor: selected
                              ? colors.primary
                              : colors.border,
                            backgroundColor: selected
                              ? colors.secondary
                              : colors.input,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          numberOfLines={2}
                          style={[
                            styles.sexOptionText,
                            {
                              color: selected
                                ? colors.foreground
                                : colors.mutedForeground,
                            },
                          ]}
                        >
                          {option}
                        </Text>
                        {selected ? (
                          <Feather
                            name="check"
                            size={15}
                            color={colors.primary}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}

          {page === 'contact' ? (
            <FormField
              label="Téléphone ou adresse e-mail"
              placeholder="Ex. nom@exemple.com ou +..."
              value={data.contact}
              onChangeText={(value) => updateText('contact', value)}
              error={errors.contact}
              autoCapitalize="none"
              autoComplete="off"
              testID="contact-input"
              returnKeyType="done"
              onSubmitEditing={continueRegistration}
            />
          ) : null}

          {page === 'password' ? (
            <>
              <FormField
                label="Mot de passe"
                placeholder="8 caractères minimum"
                value={data.password}
                onChangeText={(value) => updateText('password', value)}
                error={errors.password}
                autoCapitalize="none"
                autoComplete="new-password"
                secureTextEntry={!showPassword}
                testID="password-input"
                returnKeyType="next"
                accessory={passwordAccessory('password')}
              />
              <FormField
                label="Confirmer le mot de passe"
                placeholder="Répétez le mot de passe"
                value={data.confirm}
                onChangeText={(value) => updateText('confirm', value)}
                error={errors.confirm}
                autoCapitalize="none"
                autoComplete="new-password"
                secureTextEntry={!showConfirm}
                testID="confirm-password-input"
                returnKeyType="done"
                onSubmitEditing={continueRegistration}
                accessory={passwordAccessory('confirm')}
              />
            </>
          ) : null}

          {notice ? (
            <View
              accessibilityRole="alert"
              style={[
                styles.notice,
                { borderColor: colors.accent, backgroundColor: colors.card },
              ]}
            >
              <Feather name="info" size={17} color={colors.accent} />
              <Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>
                {notice}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          testID="signup-continue-button"
          accessibilityRole="button"
          onPress={continueRegistration}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.continueText, { color: colors.primaryForeground }]}>
            Continuer
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={colors.primaryForeground}
          />
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
  },
  backText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  headerSpacer: {
    width: 64,
  },
  intro: {
    marginTop: 42,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 9,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: 18,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  sexSection: {
    gap: 9,
  },
  sexOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sexOption: {
    width: '48%',
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  sexOptionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 15,
  },
  eyeButton: {
    padding: 4,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  noticeText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  continueButton: {
    minHeight: 58,
    marginTop: 'auto',
    marginBottom: 8,
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
