import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SexOption =
  | 'Femme'
  | 'Homme'
  | 'Autre'
  | 'Je préfère ne pas répondre';

export type RegistrationData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: SexOption | null;
  contact: string;
  password: string;
  confirm: string;
  profilePhotoUri: string | null;
};

type RegistrationContextValue = {
  data: RegistrationData;
  followedSuggestionIds: string[];
  updateField: <K extends keyof RegistrationData>(
    key: K,
    value: RegistrationData[K],
  ) => void;
  toggleFollow: (suggestionId: string) => void;
};

const emptyRegistration: RegistrationData = {
  firstName: '',
  lastName: '',
  birthDate: '',
  sex: null,
  contact: '',
  password: '',
  confirm: '',
  profilePhotoUri: null,
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegistrationData>(emptyRegistration);
  const [followedSuggestionIds, setFollowedSuggestionIds] = useState<string[]>(
    [],
  );

  const updateField: RegistrationContextValue['updateField'] = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const toggleFollow: RegistrationContextValue['toggleFollow'] = (
    suggestionId,
  ) => {
    setFollowedSuggestionIds((current) =>
      current.includes(suggestionId)
        ? current.filter((id) => id !== suggestionId)
        : [...current, suggestionId],
    );
  };

  const contextValue = useMemo(
    () => ({
      data,
      followedSuggestionIds,
      updateField,
      toggleFollow,
    }),
    [data, followedSuggestionIds],
  );

  return (
    <RegistrationContext.Provider value={contextValue}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}
