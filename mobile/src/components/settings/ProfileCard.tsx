import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {User} from '../../types';

interface ProfileCardProps {
  user: User | null;
}

/**
 * ProfileCard component displays user profile information
 * Shows user name and agent identifier with proper visual separation
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({user}) => {
  if (!user) {
    return null;
  }

  const displayName = `${user.prenom} ${user.nom}`;
  const agentId = user.login;

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.sectionTitle}>
        PROFIL AGENT
      </Text>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Agent Name Row */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon name="account" size={24} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {displayName}
              </Text>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Nom
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Agent ID Row */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Icon name="badge-account" size={24} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text variant="bodyLarge" style={styles.infoValue}>
                {agentId}
              </Text>
              <Text variant="bodySmall" style={styles.infoLabel}>
                Identifiant Agent
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9E9E9E',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 60,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoValue: {
    color: '#212121',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoLabel: {
    color: '#757575',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});
