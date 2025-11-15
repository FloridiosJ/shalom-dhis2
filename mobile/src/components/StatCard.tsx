import React from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatCardProps {
  icon: string;
  label: string;
  count: number;
  iconColor?: string;
  iconBackground?: string;
  isLoading?: boolean;
  onPress?: () => void;
  subtitle?: string;
}

/**
 * Reusable StatCard component for displaying statistics
 * 
 * Features:
 * - Icon with customizable colors
 * - Label and count display
 * - Optional loading state
 * - Optional press handler
 * - Optional subtitle for additional context
 * 
 * Usage:
 * ```
 * <StatCard
 *   icon="clipboard-text"
 *   label="Consultations"
 *   count={42}
 *   subtitle="Ce mois"
 *   iconColor="#2196F3"
 *   iconBackground="#E3F2FD"
 *   onPress={() => navigate('Consultations')}
 * />
 * ```
 */
export function StatCard({
  icon,
  label,
  count,
  iconColor = '#2196F3',
  iconBackground = '#E3F2FD',
  isLoading = false,
  onPress,
  subtitle,
}: StatCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} style={styles.cardTouchable}>
      <Card
        style={styles.card}
        accessible={true}
        accessibilityLabel={`${label}: ${isLoading ? 'chargement' : count}${subtitle ? `, ${subtitle}` : ''}`}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLiveRegion="polite"
        accessibilityHint={onPress ? 'Appuyez pour voir les détails' : undefined}>
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconContainer, {backgroundColor: iconBackground}]}>
            <Icon name={icon} size={28} color={iconColor} />
          </View>
          <Text variant="bodySmall" style={styles.cardLabel} numberOfLines={2}>
            {label}
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={iconColor} />
            </View>
          ) : (
            <>
              <Text variant="headlineMedium" style={styles.cardCount}>
                {count}
              </Text>
              {subtitle && (
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  {subtitle}
                </Text>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  cardTouchable: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    minHeight: 140,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
    minHeight: 32,
  },
  cardCount: {
    fontWeight: 'bold',
    color: '#212121',
  },
  cardSubtitle: {
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
