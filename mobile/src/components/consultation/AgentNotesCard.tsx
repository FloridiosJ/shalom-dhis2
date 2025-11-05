import React, {memo} from 'react';
import {View, StyleSheet, AccessibilityRole} from 'react-native';
import {Text, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AgentNotesCardProps {
  notes?: string;
}

/**
 * AgentNotesCard - Displays agent's notes for a consultation
 * Reusable component for showing free-text notes
 */
const AgentNotesCard = memo(({notes}: AgentNotesCardProps) => {
  return (
    <Card style={styles.card} accessibilityRole={'region' as AccessibilityRole}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="note-text" size={24} color="#2196F3" />
          <Text variant="titleLarge" style={styles.title}>
            Notes de l'agent
          </Text>
        </View>

        {!notes || notes.trim() === '' ? (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={48} color="#BDBDBD" />
            <Text variant="bodyMedium" style={styles.emptyText}>
              Aucune note disponible
            </Text>
          </View>
        ) : (
          <View
            style={styles.notesContainer}
            accessibilityRole={'text' as AccessibilityRole}
            accessibilityLabel={`Notes: ${notes}`}>
            <Text variant="bodyLarge" style={styles.notesText}>
              {notes}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
});

AgentNotesCard.displayName = 'AgentNotesCard';

export default AgentNotesCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#212121',
  },
  notesContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notesText: {
    color: '#212121',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
