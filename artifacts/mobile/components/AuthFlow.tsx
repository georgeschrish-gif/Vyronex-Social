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
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { VyronexBrand } from '@/components/VyronexBrand';
import { useColors } from '@/hooks/useColors';

type AuthMode = 'login' | 'register';
type FieldKey =
  | 'firstName'
  | 'lastName'
  | 'birthDate'
  | 'contact'
  | 'password'
  | 'confirm';
type FieldErrors = Partial<Record<FieldKey, string>>;
type SexOption = 'Femme' | 'Homme' | 'Autre' | 'Je préfère ne pas répondre';

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
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isRealDate && date <= new Date();
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

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  testID: string;
  error?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  accessory?: React.ReactNode;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  testID,
  error,
  autoCapitalize = 'sentences',
  autoComplete,
  keyboardType,
  secureTextEntry,
  returnKeyType,
  onSubmitEditing,
  accessory,
}: FieldProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.secondaryForeground }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputFrame,
          {
            backgroundColor: colors.input,
            borderColor: error
              ? colors.destructive
              : focused
                ? colors.primary
                : colors.border,
          },
        ]}
      >
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.foreground }]}
        />
        {accessory}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function AuthFlow({ mode }: { mode: AuthMode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const isRegister = mode === 'register';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<SexOption | null>(null);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState('');

  const togglePassword = (field: 'password' | 'confirm') => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        (field === 'password' ? showPassword : showConfirm)
          ? 'Masquer le mot de passe'
          : 'Afficher le mot de passe'
      }
      hitSlop={10}
      onPress={() =>
        field === 'password'
          ? setShowPassword((visible) => !visible)
          : setShowConfirm((visible) => !visible)
      }
      style={styles.eyeButton}
    >
      <Feather
        name={
          (field === 'password' ? showPassword : showConfirm)
            ? 'eye-off'
            : 'eye'
        }
        size={18}
        color={colors.mutedForeground}
      />
    </Pressable>
  );

  const submit = () => {
    const nextErrors: FieldErrors = {};
    const normalizedContact = contact.trim();

    if (isRegister && !firstName.trim()) {
      nextErrors.firstName = 'Saisissez votre prénom.';
    }
    if (isRegister && !lastName.trim()) {
      nextErrors.lastName = 'Saisissez votre nom.';
    }
    if (isRegister && !isValidBirthDate(birthDate)) {
      nextErrors.birthDate =
        'Saisissez une date valide au format JJ/MM/AAAA.';
    }
    const validContact = isRegister
      ? isValidPhoneOrEmail(normalizedContact)
      : isValidEmail(normalizedContact);
    if (!validContact) {
      nextErrors.contact = isRegister
        ? 'Saisissez un e-mail ou un numéro de téléphone valide.'
        : 'Saisissez une adresse e-mail valide.';
    }
    if (password.length < 8) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (isRegister && password !== confirm) {
      nextErrors.confirm = 'Les mots de passe ne correspondent pas.';
    }

    setErrors(nextErrors);
    setNotice('');
    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    Keyboard.dismiss();
    setNotice(
      isRegister
        ? 'Champs validés. Cette maquette ne crée pas de compte et ne transmet aucune donnée.'
        : 'Maquette uniquement : aucune donnée n’a été envoyée ni enregistrée.',
    );
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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
            testID="back-home-button"
            accessibilityRole="button"
            accessibilityLabel="Retour à l’accueil"
            onPress={() => router.replace('/')}
            hitSlop={12}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <VyronexBrand compact />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>
            {isRegister ? 'VOTRE ESPACE COMMENCE ICI' : 'ACCÈS À VOTRE ESPACE'}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isRegister ? 'Rejoignez VYRONEX.' : 'Bon retour.'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {isRegister
              ? 'Créez votre présence et retrouvez votre cercle.'
              : 'Connectez-vous pour retrouver votre cercle.'}
          </Text>
        </View>

        <View style={styles.form}>
          {isRegister ? (
            <>
              <FormField
                label="Prénom"
                placeholder="Votre prénom"
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  if (errors.firstName) {
                    setErrors((current) => ({ ...current, firstName: undefined }));
                  }
                }}
                error={errors.firstName}
                autoCapitalize="words"
                autoComplete="given-name"
                testID="first-name-input"
                returnKeyType="next"
              />
              <FormField
                label="Nom"
                placeholder="Votre nom"
                value={lastName}
                onChangeText={(value) => {
                  setLastName(value);
                  if (errors.lastName) {
                    setErrors((current) => ({ ...current, lastName: undefined }));
                  }
                }}
                error={errors.lastName}
                autoCapitalize="words"
                autoComplete="family-name"
                testID="last-name-input"
                returnKeyType="next"
              />
              <FormField
                label="Date de naissance"
                placeholder="JJ/MM/AAAA"
                value={birthDate}
                onChangeText={(value) => {
                  setBirthDate(formatBirthDate(value));
                  if (errors.birthDate) {
                    setErrors((current) => ({ ...current, birthDate: undefined }));
                  }
                }}
                error={errors.birthDate}
                autoCapitalize="none"
                keyboardType="number-pad"
                testID="birth-date-input"
                returnKeyType="next"
              />
              <View style={styles.sexSection}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.secondaryForeground },
                  ]}
                >
                  Sexe <Text style={{ color: colors.mutedForeground }}>(facultatif)</Text>
                </Text>
                <View style={styles.sexOptions}>
                  {sexOptions.map((option) => {
                    const selected = sex === option;
                    return (
                      <Pressable
                        key={option}
                        testID={`sex-option-${option}`}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={option}
                        onPress={() => setSex(option)}
                        style={({ pressed }) => [
                          styles.sexOption,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.secondary : colors.input,
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

          <FormField
            label={isRegister ? 'Téléphone ou adresse e-mail' : 'Adresse e-mail'}
            placeholder={
              isRegister
                ? 'Ex. nom@exemple.com ou +...'
                : 'nom@exemple.com'
            }
            value={contact}
            onChangeText={(value) => {
              setContact(value);
              if (errors.contact) {
                setErrors((current) => ({ ...current, contact: undefined }));
              }
            }}
            error={errors.contact}
            autoCapitalize="none"
            autoComplete={isRegister ? 'off' : 'email'}
            keyboardType={isRegister ? 'default' : 'email-address'}
            testID={isRegister ? 'contact-input' : 'email-input'}
            returnKeyType="next"
          />

          <FormField
            label="Mot de passe"
            placeholder="8 caractères minimum"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (errors.password) {
                setErrors((current) => ({ ...current, password: undefined }));
              }
            }}
            error={errors.password}
            autoCapitalize="none"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            secureTextEntry={!showPassword}
            testID="password-input"
            returnKeyType={isRegister ? 'next' : 'done'}
            onSubmitEditing={isRegister ? undefined : submit}
            accessory={togglePassword('password')}
          />

          {isRegister ? (
            <FormField
              label="Confirmer le mot de passe"
              placeholder="Répétez le mot de passe"
              value={confirm}
              onChangeText={(value) => {
                setConfirm(value);
                if (errors.confirm) {
                  setErrors((current) => ({ ...current, confirm: undefined }));
                }
              }}
              error={errors.confirm}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!showConfirm}
              testID="confirm-password-input"
              returnKeyType="done"
              onSubmitEditing={submit}
              accessory={togglePassword('confirm')}
            />
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

          <Pressable
            testID="auth-submit-button"
            accessibilityRole="button"
            onPress={submit}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {isRegister ? 'Continuer' : 'Se connecter'}
            </Text>
            <Feather
              name="arrow-up-right"
              size={18}
              color={colors.primaryForeground}
            />
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
              {isRegister ? 'Déjà membre ?' : 'Pas encore de compte ?'}
            </Text>
            <Pressable
              testID="switch-auth-mode"
              accessibilityRole="button"
              onPress={() =>
                router.replace(isRegister ? '/login' : '/register')
              }
              hitSlop={8}
            >
              <Text style={[styles.switchLink, { color: colors.accent }]}>
                {isRegister ? 'Se connecter' : 'Créer un compte'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          VERSION DE DÉMONSTRATION · AUCUNE DONNÉE N’EST TRANSMISE
        </Text>
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
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  intro: {
    marginTop: 30,
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.8,
  },
  title: {
    marginTop: 12,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.9,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  form: {
    gap: 16,
  },
  fieldWrap: {
    gap: 8,
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
  inputFrame: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
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
  submitButton: {
    minHeight: 58,
    marginTop: 5,
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  switchText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  switchLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  disclaimer: {
    marginTop: 'auto',
    paddingTop: 34,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 8,
    letterSpacing: 1,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
