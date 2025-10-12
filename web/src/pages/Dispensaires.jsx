import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  dispensaireService  from '../services/dispensaires';
import { organisationService } from '../services/organisations';
import styles from './Dispensaires.module.css';

const Dispensaires = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingDispensaire, setEditingDispensaire] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    organisationId: ''
  });

  const queryClient = useQueryClient();

  // Query pour récupérer les dispensaires
  const {
    data: dispensaires = [],
    isLoading: dispensairesLoading,
    error: dispensairesError
  } = useQuery({
    queryKey: ['dispensaires'],
    queryFn: dispensaireService.getAll
  });

  // Query pour récupérer les organisations
  const {
    data: organisations = [],
    isLoading: organisationsLoading
  } = useQuery({
    queryKey: ['organisations'],
    queryFn: organisationService.getAll
  });

  // Mutation pour créer un dispensaire
  const createMutation = useMutation({
    mutationFn: dispensaireService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispensaires'] });
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Mutation pour mettre à jour un dispensaire
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dispensaireService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispensaires'] });
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Erreur lors de la modification: ${error.message}`);
    }
  });

  // Mutation pour supprimer un dispensaire
  const deleteMutation = useMutation({
    mutationFn: dispensaireService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispensaires'] });
    },
    onError: (error) => {
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      organisationId: ''
    });
    setEditingDispensaire(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingDispensaire) {
      updateMutation.mutate({ id: editingDispensaire.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (dispensaire) => {
    setEditingDispensaire(dispensaire);
    setFormData({
      name: dispensaire.name || '',
      organisationId: dispensaire.organisationId || ''
    });
    setShowModal(true);
  };

  const handleDelete = (dispensaire) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${dispensaire.name}" ?`)) {
      deleteMutation.mutate(dispensaire.id);
    }
  };

  // Filtrer les dispensaires selon le terme de recherche
  const filteredDispensaires = dispensaires.filter(dispensaire =>
    dispensaire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispensaire.organisation?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (dispensairesLoading || organisationsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Chargement des dispensaires...</p>
        </div>
      </div>
    );
  }

  if (dispensairesError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          color: '#dc2626'
        }}>
          Erreur: {dispensairesError.message}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>
              Dispensaires
            </h1>
            <p className={styles.headerSubtitle}>
              Gérer les dispensaires et centres de santé
            </p>
          </div>

          <div className={styles.headerActions}>
            {/* Barre de recherche */}
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>
                <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Rechercher un dispensaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className={styles.addBtn}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Dispensaires', value: dispensaires.length, color: '#3b82f6' },
            { label: 'Organisations', value: new Set(dispensaires.map(d => d.organisationId)).size, color: '#10b981' },
            { label: 'Synode', value: dispensaires.filter(d => d.organisation?.type === 'Synode').length, color: '#f59e0b' },
            { label: 'Sampana', value: dispensaires.filter(d => d.organisation?.type === 'Sampana').length, color: '#8b5cf6' }
          ].map((stat, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '0.5rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {filteredDispensaires.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              color: '#6b7280'
            }}>
              <svg style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                color: '#d1d5db'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>{searchTerm ? 'Aucun dispensaire trouvé pour cette recherche' : 'Aucun dispensaire trouvé'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Nom
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Organisation
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Type Organisation
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispensaires.map((dispensaire, index) => (
                    <tr
                      key={dispensaire.id}
                      style={{
                        borderBottom: index < filteredDispensaires.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        color: '#1f2937',
                        fontWeight: '500'
                      }}>
                        {dispensaire.name}
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#6b7280'
                      }}>
                        {dispensaire.organisation?.name || 'Non assigné'}
                      </td>
                      <td style={{
                        padding: '1rem'
                      }}>
                        {dispensaire.organisation?.type && (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {dispensaire.organisation.type}
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'right'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            onClick={() => handleEdit(dispensaire)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#f3f4f6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#374151',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(dispensaire)}
                            disabled={deleteMutation.isLoading}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: '#fef2f2',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc2626',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Dispensaires;