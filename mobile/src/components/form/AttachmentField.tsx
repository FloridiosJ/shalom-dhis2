import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  AccessibilityRole,
} from 'react-native';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Attachment} from '../../types/consultation';

interface AttachmentFieldProps {
  value: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export default function AttachmentField({
  value,
  onChange,
}: AttachmentFieldProps) {
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permission Caméra',
            message:
              "L'application a besoin d'accéder à votre caméra pour prendre des photos.",
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAddPhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission refusée',
        "L'application a besoin de la permission caméra pour prendre des photos.",
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Erreur', "Impossible d'accéder à la caméra");
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          const newAttachment: Attachment = {
            id: Date.now().toString(),
            uri: asset.uri || '',
            name: asset.fileName || `photo-${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          };
          onChange([...value, newAttachment]);
        }
      },
    );
  }, [value, onChange]);

  const handleAddFile = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          const newAttachment: Attachment = {
            id: Date.now().toString(),
            uri: asset.uri || '',
            name: asset.fileName || `file-${Date.now()}`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          };
          onChange([...value, newAttachment]);
        }
      },
    );
  }, [value, onChange]);

  const handleRemoveAttachment = useCallback(
    (id: string) => {
      Alert.alert(
        'Supprimer',
        'Voulez-vous supprimer cette pièce jointe ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => {
              onChange(value.filter(a => a.id !== id));
            },
          },
        ],
      );
    },
    [value, onChange],
  );

  const renderAttachmentItem = useCallback(
    ({item}: {item: Attachment}) => (
      <View style={styles.attachmentItem}>
        <View style={styles.attachmentInfo}>
          <Icon
            name={
              item.type.startsWith('image/')
                ? 'image'
                : 'file-document-outline'
            }
            size={24}
            color="#2196F3"
          />
          <View style={styles.attachmentText}>
            <Text style={styles.attachmentName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.size && (
              <Text style={styles.attachmentSize}>
                {(item.size / 1024).toFixed(1)} KB
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveAttachment(item.id)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel={`Supprimer ${item.name}`}>
          <Icon name="close-circle" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    ),
    [handleRemoveAttachment],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pièces Jointes</Text>

      <View style={styles.buttonsContainer}>
        <Button
          mode="outlined"
          onPress={handleAddPhoto}
          style={styles.button}
          icon="camera"
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Ajouter une photo">
          Ajouter une photo
        </Button>

        <Button
          mode="outlined"
          onPress={handleAddFile}
          style={styles.button}
          icon="paperclip"
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Ajouter un fichier">
          Ajouter un fichier
        </Button>
      </View>

      {value.length > 0 && (
        <FlatList
          data={value}
          renderItem={renderAttachmentItem}
          keyExtractor={item => item.id}
          style={styles.attachmentList}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderColor: '#2196F3',
  },
  attachmentList: {
    marginTop: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 56,
  },
  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});
