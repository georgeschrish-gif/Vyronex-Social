import { Image, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

type VyronexBrandProps = {
  compact?: boolean;
};

export function VyronexBrand({ compact = false }: VyronexBrandProps) {
  const colors = useColors();
  const markSize = compact ? 46 : 174;

  return (
    <View style={styles.brand}>
      <Image
        source={require('../assets/images/icon.png')}
        style={{ width: markSize, height: markSize }}
        resizeMode="contain"
        accessibilityLabel="Emblème géométrique VYRONEX"
      />
      <Text
        style={[
          styles.wordmark,
          compact && styles.wordmarkCompact,
          { color: colors.foreground },
        ]}
      >
        VYRONEX
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: 3,
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: 6,
    paddingLeft: 6,
  },
  wordmarkCompact: {
    marginTop: -2,
    fontSize: 16,
    letterSpacing: 3,
    paddingLeft: 3,
  },
});
