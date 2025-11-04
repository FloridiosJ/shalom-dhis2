import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Text, Card, Menu, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DashboardCardProps {
  icon: string;
  label: string;
  count: number;
  iconColor?: string;
  iconBackground?: string;
}

function DashboardCard({
  icon,
  label,
  count,
  iconColor = '#2196F3',
  iconBackground = '#E3F2FD',
}: DashboardCardProps) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.iconContainer, {backgroundColor: iconBackground}]}>
          <Icon name={icon} size={28} color={iconColor} />
        </View>
        <Text variant="bodySmall" style={styles.cardLabel}>
          {label}
        </Text>
        <Text variant="headlineMedium" style={styles.cardCount}>
          {count}
        </Text>
      </Card.Content>
    </Card>
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
          <Text variant="bodyMedium" style={styles.actionCardLabel}>
            {label}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [dispensaireVisible, setDispensaireVisible] = useState(false);
  const [periodeVisible, setPeriodeVisible] = useState(false);
  const [selectedDispensaire, setSelectedDispensaire] = useState('Dispensaire');
  const [selectedPeriode, setSelectedPeriode] = useState('Période');

  // Placeholder data - would be replaced with real data from API/database
  const dashboardData = {
    consultationsCount: 12,
    patientsRecentsCount: 5,
    syncRequiredCount: 8,
  };

  const handleNewPatient = () => {
    // TODO: Navigation to patient creation screen
    // navigation.navigate('CreatePatient');
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

        {/* Filters Section */}
        <View style={styles.filtersContainer}>
          <Menu
            visible={dispensaireVisible}
            onDismiss={() => setDispensaireVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDispensaireVisible(true)}
                style={styles.filterButton}
                contentStyle={styles.filterButtonContent}
                icon="chevron-down">
                {selectedDispensaire}
              </Button>
            }>
            <Menu.Item
              onPress={() => {
                setSelectedDispensaire('Dispensaire A');
                setDispensaireVisible(false);
              }}
              title="Dispensaire A"
            />
            <Menu.Item
              onPress={() => {
                setSelectedDispensaire('Dispensaire B');
                setDispensaireVisible(false);
              }}
              title="Dispensaire B"
            />
            <Menu.Item
              onPress={() => {
                setSelectedDispensaire('Dispensaire C');
                setDispensaireVisible(false);
              }}
              title="Dispensaire C"
            />
          </Menu>

          <Menu
            visible={periodeVisible}
            onDismiss={() => setPeriodeVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setPeriodeVisible(true)}
                style={styles.filterButton}
                contentStyle={styles.filterButtonContent}
                icon="chevron-down">
                {selectedPeriode}
              </Button>
            }>
            <Menu.Item
              onPress={() => {
                setSelectedPeriode("Aujourd'hui");
                setPeriodeVisible(false);
              }}
              title="Aujourd'hui"
            />
            <Menu.Item
              onPress={() => {
                setSelectedPeriode('Cette semaine');
                setPeriodeVisible(false);
              }}
              title="Cette semaine"
            />
            <Menu.Item
              onPress={() => {
                setSelectedPeriode('Ce mois');
                setPeriodeVisible(false);
              }}
              title="Ce mois"
            />
          </Menu>
        </View>

        {/* Dashboard Cards Grid */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardRow}>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="clipboard-text"
                label="Consultations en attente"
                count={dashboardData.consultationsCount}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
              />
            </View>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="account-group"
                label="Patients Récents"
                count={dashboardData.patientsRecentsCount}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
              />
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardWrapper}>
              <DashboardCard
                icon="sync"
                label="Synchronisation requise"
                count={dashboardData.syncRequiredCount}
                iconColor="#2196F3"
                iconBackground="#E3F2FD"
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
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  filterButtonContent: {
    flexDirection: 'row-reverse',
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
  card: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
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
  },
  cardCount: {
    fontWeight: 'bold',
    color: '#212121',
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
  },
  actionIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  actionCardLabel: {
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '600',
  },
});
