import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDashboardStats} from '../hooks/useDashboardStats';
import {useNavigation} from '@react-navigation/native';

interface DashboardCardProps {
  icon: string;
  label: string;
  count: number;
  iconColor?: string;
  iconBackground?: string;
  isLoading?: boolean;
  onPress?: () => void;
}

function DashboardCard({
  icon,
  label,
  count,
  iconColor = '#2196F3',
  iconBackground = '#E3F2FD',
  isLoading = false,
  onPress,
}: DashboardCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper onPress={onPress} style={styles.cardTouchable}>
      <Card 
        style={styles.card}
        accessible={true}
        accessibilityLabel={`${label}: ${isLoading ? 'chargement' : count}`}
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
            <Text variant="headlineMedium" style={styles.cardCount}>
              {count}
            </Text>
          )}
        </Card.Content>
      </Card>
    </CardWrapper>
  );
}

interface ActionCardProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function ActionCard({icon, label, onPress}: ActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionCardContainer}>
      <Card style={styles.actionCard}>
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconContainer, styles.actionIconContainer]}>
            <Icon name={icon} size={28} color="#2196F3" />
          </View>
          <Text variant="bodyMedium" style={styles.actionCardLabel} numberOfLines={2}>
            {label}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  
  // Fetch real dashboard statistics from API
  const {stats, loading, error} = useDashboardStats();

  // Use real data or show fallback during loading
  const dashboardData = stats || {
    consultationsCount: 0,
    patientsRecentsCount: 0,
    syncRequiredCount: 0,
  };

  const handleConsultationsPress = () => {
    navigation.navigate('Consultation');
  };

  const handlePatientsPress = () => {
    navigation.navigate('Patient');
  };

  const handleSyncPress = () => {
    navigation.navigate('Sync');
  };

  const handleNewPatient = () => {
    // Navigate to Patient tab
    navigation.navigate('Patient');
  };

  const handleExport = () => {
    // TODO: Implement export/share functionality
    // ShareService.share(dashboardData);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Shalom Mobile
          </Text>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Icon name="share-variant" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Statistique Mensuel
          </Text>
        </View>

        {/* Dashboard Cards Grid */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardRow}>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="clipboard-text"
                label="Consultation"
                count={dashboardData.consultationsCount}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
                isLoading={loading}
                onPress={handleConsultationsPress}
              />
            </View>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="account-group"
                label="Patients Récents"
                count={dashboardData.patientsRecentsCount}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
                isLoading={loading}
                onPress={handlePatientsPress}
              />
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="sync"
                label="Synchronisation"
                count={0}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
                isLoading={false}
                onPress={handleSyncPress}
              />
            </View>
            <View style={styles.cardWrapper}>
              <ActionCard
                icon="account-plus"
                label="Nouveau Patient"
                onPress={handleNewPatient}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#212121',
  },
  exportButton: {
    padding: 8,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#212121',
  },
  cardsGrid: {
    padding: 16,
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  cardWrapper: {
    flex: 1,
  },
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
    height: 32,
  },
  cardCount: {
    fontWeight: 'bold',
    color: '#212121',
  },
  loadingContainer: {
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardContainer: {
    flex: 1,
  },
  actionCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2196F3',
    minHeight: 140,
  },
  actionIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  actionCardLabel: {
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '600',
    height: 32,
  },
});
