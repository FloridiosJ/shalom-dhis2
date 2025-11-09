import React, { useState } from 'react';
import CreateOrEditUserModal from '../components/CreateOrEditUserModal';
import { USER_ROLES, SPECIALITES } from '../constants';

/**
 * Test page to demonstrate the refactored user modal
 * This page can be used without backend connection
 */
const TestUserModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Mock dispensaires data
  const mockDispensaires = [
    { id: '1', name: 'Dispensaire Central' },
    { id: '2', name: 'Dispensaire Nord' },
    { id: '3', name: 'Dispensaire Sud' },
  ];

  // Mock user for edit mode
  const mockUser = {
    id: '1',
    email: 'john.doe@example.com',
    login: '1234',
    nom: 'Doe',
    prenom: 'John',
    role: 'agent',
    specialite: 'infirmier',
    dispensaireId: '1',
    isActive: true,
  };

  const handleSaved = (user) => {
    console.log('User saved:', user);
    alert('Utilisateur enregistré avec succès!');
  };

  return (
    <div style={{ 
      padding: '40px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Test du Modal Utilisateur
        </h1>
        <p style={{
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          Cliquez sur les boutons ci-dessous pour tester les différents modes du modal
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={() => { setEditingUser(null); setModalOpen(true); }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            ➕ Créer un nouvel utilisateur
          </button>
          
          <button
            onClick={() => { setEditingUser(mockUser); setModalOpen(true); }}
            style={{
              background: 'white',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: '8px',
              padding: '16px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ✏️ Modifier un utilisateur existant
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            ℹ️ Informations
          </h3>
          <ul style={{ 
            color: '#64748b', 
            fontSize: '0.9rem',
            lineHeight: '1.8',
            margin: 0,
            paddingLeft: '20px',
          }}>
            <li>Le modal est maintenant composé de composants réutilisables</li>
            <li>Design conforme à la maquette fournie</li>
            <li>Accessibilité améliorée (labels, ARIA, focus)</li>
            <li>Toggle switch pour le statut Actif/Inactif</li>
            <li>Prénom et Nom côte à côte</li>
            <li>Boutons Générer pour Login et Mot de passe</li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <CreateOrEditUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        dispensaires={mockDispensaires}
        user={editingUser}
      />
    </div>
  );
};

export default TestUserModal;
