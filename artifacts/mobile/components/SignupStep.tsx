import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Linking,
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

type SignupPage =
  | 'firstName'
  | 'lastName'
  | 'birthDate'
  | 'sex'
  | 'contact'
  | 'password'
  | 'confirm'
  | 'photo';
type FieldKey = keyof RegistrationData;
type FieldErrors = Partial<Record<FieldKey, string>>;

const sexOptions: SexOption[] = [
  'Femme',
  'Homme',
  'Autre',
  'Je préfère ne pas répondre',
];

const nextRoutes: Record<SignupPage, Href | null> = {
  firstName: '/register-name',
  lastName: '/register-about',
  birthDate: '/register-sex',
  sex: '/register-contact',
  contact: '/register-password',
  password: '/register-confirm',
  confirm: '/register-photo',
  photo: null,
};

const previousRoutes: Record<SignupPage, Href> = {
  firstName: '/',
  lastName: '/register',
  birthDate: '/register-name',
  sex: '/register-about',
  contact: '/register-sex',
  password: '/register-contact',
  confirm: '/register-password',
  photo: '/register-confirm',
};

const pageCopy: Record<SignupPage, { title: string; subtitle: string }> = {
  firstName: {
    title: 'Quel est votre prénom ?',
    subtitle: 'Le prénom que vos proches verront sur votre profil.',
  },
  lastName: {
    title: 'Et votre nom ?',
    subtitle: 'Ajoutez votre nom pour compléter votre identité.',
  },
  birthDate: {
    title: 'Quelle est votre date de naissance ?',
    subtitle: 'Indiquez votre date de naissance au format jour, mois, année.',
  },
  sex: {
    title: 'Comment vous identifiez-vous ?',
    subtitle: 'Choisissez une réponse, ou préférez ne pas répondre.',
  },
  contact: {
    title: 'Quel est votre numéro ou e-mail ?',
    subtitle: 'Utilisez un contact valide pour sécuriser votre compte.',
  },
  password: {
    title: 'Créez un mot de passe',
    subtitle: 'Utilisez au moins 8 caractères pour protéger votre compte.',
  },
  confirm: {
    title: 'Confirmez votre mot de passe',
    subtitle: 'Saisissez à nouveau le mot de passe choisi.',
  },
  photo: {
    title: 'Photo de profil',
    subtitle: 'Ajoutez une image pour personnaliser votre profil.',
  },
};

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

export function SignupStep({ page }: { page: SignupPage }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, updateField } = useRegistration();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const copy = pageCopy[page];

  const updateText = (field: FieldKey, value: string) => {
    updateField(field, value);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice('');
  };

  const goBack = () => {
    Keyboard.dismiss();
    router.replace(previousRoutes[page]);
  };

  const finishMockRegistration = () => {
    Keyboard.dismiss();
    setErrors({});
    setNotice(
      'Votre parcours est terminé. Cette maquette ne crée pas de compte et ne transmet aucune donnée.',
    );
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const continueRegistration = () => {
    const nextErrors: FieldErrors = {};

    if (page === 'firstName' && !data.firstName.trim()) {
      nextErrors.firstName = 'Saisissez votre prénom.';
    }
    if (page === 'lastName' && !data.lastName.trim()) {
      nextErrors.lastName = 'Saisissez votre nom.';
    }
    if (page === 'birthDate' && !isValidBirthDate(data.birthDate)) {
      nextErrors.birthDate =
        'Saisissez une date réelle au format JJ/MM/AAAA, antérieure à aujourd’hui.';
    }
    if (page === 'sex' && !data.sex) {
      nextErrors.sex =
        'Choisissez une réponse, y compris « Je préfère ne pas répondre ».';
    }
    if (page === 'contact' && !isValidPhoneOrEmail(data.contact.trim())) {
      nextErrors.contact =
        'Saisissez un e-mail ou un numéro de téléphone valide.';
    }
    if (page === 'password' && data.password.length < 8) {
      nextErrors.password =
        'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (page === 'confirm') {
      if (!data.confirm) {
        nextErrors.confirm = 'Confirmez votre mot de passe.';
      } else if (data.password !== data.confirm) {
        nextErrors.confirm = 'Les mots de passe ne correspondent pas.';
      }
    }
    if (page === 'photo' && !data.profilePhotoUri) {
      nextErrors.profilePhotoUri =
        'Ajoutez une photo ou passez cette étape.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (page === 'photo') {
      finishMockRegistration();
      return;
    }

    Keyboard.dismiss();
    const nextRoute = nextRoutes[page];
    if (nextRoute) {
      if (Platform.OS !== 'web') void Haptics.selectionAsync();
      router.replace(nextRoute);
    }
  };

  const passwordAccessory = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
      }
      hitSlop={10}
      onPress={() => setShowPassword((current) => !current)}
      style={styles.eyeButton}
    >
      <Feather
        name={showPassword ? 'eye-off' : 'eye'}
        size={18}
        color={colors.mutedForeground}
      />
    </Pressable>
  );

  const showPermissionMessage = (
    purpose: string,
    canAskAgain: boolean,
  ) => {
    if (!canAskAgain && Platform.OS !== 'web') {
      Alert.alert(
        'Autorisation nécessaire',
        `Autorisez l’accès à ${purpose} dans les réglages de votre téléphone.`,
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'Ouvrir les réglages',
            onPress: () => {
              void Linking.openSettings().catch(() => undefined);
            },
          },
        ],
      );
      return;
    }
    Alert.alert(
      'Autorisation nécessaire',
      `Autorisez l’accès à ${purpose} pour continuer.`,
    );
  };

  const chooseProfilePhoto = async (source: 'gallery' | 'camera') => {
    if (isPickingPhoto) return;
    setIsPickingPhoto(true);
    setErrors((current) => ({ ...current, profilePhotoUri: undefined }));

    try {
      if (source === 'gallery' && Platform.OS !== 'web') {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showPermissionMessage('votre galerie photo', permission.canAskAgain);
          return;
        }
      }

      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showPermissionMessage('votre appareil photo', permission.canAskAgain);
          return;
        }
      }

      const result =
        source === 'gallery'
          ? await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.85,
            })
          : await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              cameraType: ImagePicker.CameraType.front,
              quality: 0.85,
            });

      if (!result.canceled && result.assets[0]?.uri) {
        updateField('profilePhotoUri', result.assets[0].uri);
        setNotice('');
      }
    } catch {
      Alert.alert(
        'Photo indisponible',
        'Impossible d’ouvrir cette option. Vérifiez les autorisations de votre téléphone et réessayez.',
      );
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const renderPhotoChoice = (
    title: string,
    icon: 'image' | 'camera',
    testID: string,
    onPress: () => void,
  ) => (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isPickingPhoto}
      onPress={onPress}
      style={({ pressed }) => [
        styles.photoChoice,
        {
          borderColor: colors.border,
          backgroundColor: colors.card,
          borderRadius: colors.radius - 4,
        },
        pressed && styles.pressed,
        isPickingPhoto && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.photoChoiceIcon,
          { backgroundColor: colors.secondary },
        ]}
      >
        <Feather name={icon} size={19} color={colors.accent} />
      </View>
      <Text style={[styles.photoChoiceText, { color: colors.foreground }]}>
        {title}
      </Text>
      <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
    </Pressable>
  );

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
          {page === 'firstName' ? (
            <FormField
              label="Prénom"
              placeholder="Votre prénom"
              value={data.firstName}
              onChangeText={(value) => updateText('firstName', value)}
              error={errors.firstName}
              autoCapitalize="words"
              autoComplete="given-name"
              testID="first-name-input"
              returnKeyType="done"
              onSubmitEditing={continueRegistration}
            />
          ) : null}

          {page === 'lastName' ? (
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
          ) : null}

          {page === 'birthDate' ? (
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
          ) : null}

          {page === 'sex' ? (
            <View style={styles.sexSection}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.secondaryForeground },
                ]}
              >
                Sexe
              </Text>
              <View style={styles.sexOptions}>
                {sexOptions.map((option) => {
                  const selected = data.sex === option;
                  return (
                    <Pressable
                      key={option}
                      testID={`sex-option-${option}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      aria-checked={selected}
                      accessibilityLabel={option}
                      onPress={() => {
                        updateField('sex', option);
                        setErrors((current) => ({
                          ...current,
                          sex: undefined,
                        }));
                      }}
                      style={({ pressed }) => [
                        styles.sexOption,
                        {
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selected
                            ? colors.secondary
                            : colors.input,
                          borderRadius: colors.radius - 4,
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
              {errors.sex ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {errors.sex}
                </Text>
              ) : null}
            </View>
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
              returnKeyType="done"
              onSubmitEditing={continueRegistration}
              accessory={passwordAccessory}
            />
          ) : null}

          {page === 'confirm' ? (
            <FormField
              label="Confirmation du mot de passe"
              placeholder="Répétez votre mot de passe"
              value={data.confirm}
              onChangeText={(value) => updateText('confirm', value)}
              error={errors.confirm}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry={!showPassword}
              testID="confirm-password-input"
              returnKeyType="done"
              onSubmitEditing={continueRegistration}
              accessory={passwordAccessory}
            />
          ) : null}

          {page === 'photo' ? (
            <>
              <View style={styles.photoPreviewWrap}>
                {data.profilePhotoUri ? (
                  <Image
                    source={{ uri: data.profilePhotoUri }}
                    accessibilityLabel="Aperçu de la photo de profil"
                    style={[
                      styles.photoPreview,
                      { borderColor: colors.accent },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.photoPlaceholder,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={48}
                      color={colors.mutedForeground}
                    />
                  </View>
                )}
                {isPickingPhoto ? (
                  <ActivityIndicator
                    testID="photo-picker-loading"
                    color={colors.primary}
                    style={styles.photoLoading}
                  />
                ) : null}
              </View>
              {renderPhotoChoice(
                'Ajouter une photo depuis la galerie',
                'image',
                'photo-gallery-button',
                () => void chooseProfilePhoto('gallery'),
              )}
              {renderPhotoChoice(
                'Prendre une photo avec l’appareil photo',
                'camera',
                'photo-camera-button',
                () => void chooseProfilePhoto('camera'),
              )}
              {errors.profilePhotoUri ? (
                <Text
                  style={[styles.errorText, { color: colors.destructive }]}
                >
                  {errors.profilePhotoUri}
                </Text>
              ) : null}
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
              <Feather name="check-circle" size={17} color={colors.accent} />
              <Text
                style={[styles.noticeText, { color: colors.secondaryForeground }]}
              >
                {notice}
              </Text>
            </View>
          ) : null}
        </View>

        {page === 'photo' && !notice ? (
          <Pressable
            testID="skip-photo-button"
            accessibilityRole="button"
            onPress={finishMockRegistration}
            disabled={isPickingPhoto}
            style={({ pressed }) => [
              styles.skipButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
              isPickingPhoto && styles.disabled,
            ]}
          >
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
              Passer cette étape
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          testID="signup-continue-button"
          accessibilityRole="button"
          onPress={continueRegistration}
          disabled={isPickingPhoto || !!notice}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: colors.primary, borderRadius: colors.radius },
            pressed && styles.pressed,
            (isPickingPhoto || !!notice) && styles.disabled,
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
  errorText: {
    marginTop: 5,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  sexSection: {
    gap: 9,
  },
  sexOptions: {
    gap: 10,
  },
  sexOption: {
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sexOptionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  eyeButton: {
    padding: 4,
  },
  photoPreviewWrap: {
    minHeight: 174,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  photoPreview: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
  },
  photoPlaceholder: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLoading: {
    position: 'absolute',
  },
  photoChoice: {
    minHeight: 68,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoChoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoChoiceText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
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
  disabled: {
    opacity: 0.52,
  },
});
