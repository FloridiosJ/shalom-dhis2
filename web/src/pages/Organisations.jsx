import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppHeader from '../components/AppHeader';
import { organisationService } from '../services/organisations';

const Organisations = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Synode',
    parentId: null
  });

  const queryClient = useQueryClient();

  // Query pour récupérer les organisations
  const {
    data: organisations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['organisations'],
    queryFn: organisationService.getAll
  });

  // Mutation pour créer une organisation
  const createMutation = useMutation({
    mutationFn: organisationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Mutation pour mettre à jour une organisation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => organisationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      setShowModal(false);
      resetForm();
    },
    onError: (error) => {
      alert(`Erreur lors de la modification: ${error.message}`);
    }
  });

  // Mutation pour supprimer une organisation
  const deleteMutation = useMutation({
    mutationFn: organisationService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
    },
    onError: (error) => {
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({ name: '', type: 'Synode', parentId: null });
    setEditingOrg(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      type: org.type,
      parentId: org.parentId
    });
    setShowModal(true);
  };

  const handleDelete = (org) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${org.name}" ?`)) {
      deleteMutation.mutate(org.id);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Synode': '#3b82f6', // blue
      'SynodaLehibe': '#10b981', // green
      'Faritra': '#f59e0b', // amber
      'Sampana': '#ef4444', // red
      'Dispensaire': '#8b5cf6' // purple
    };
    return colors[type] || '#6b7280';
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <AppHeader />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)'
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
            <p style={{ color: '#6b7280' }}>Chargement des organisations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <AppHeader />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)'
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            color: '#dc2626'
          }}>
            Erreur: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <AppHeader />
      <div style={{ padding: '2rem' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              Organisations
            </h1>
            <p style={{ color: '#6b7280' }}>
              Gérer la hiérarchie des organisations de santé
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>

        {/* Tableau */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {organisations.length === 0 ? (
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
              <p>Aucune organisation trouvée</p>
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
                      Type
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      Enfants
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
                  {organisations.map((org, index) => (
                    <tr
                      key={org.id}
                      style={{
                        borderBottom: index < organisations.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        color: '#1f2937',
                        fontWeight: '500'
                      }}>
                        {org.name}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          backgroundColor: getTypeColor(org.type),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {org.type}
                        </span>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: '#6b7280'
                      }}>
                        {org.children?.length || 0}
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
                            onClick={() => handleEdit(org)}
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
                            onClick={() => handleDelete(org)}
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

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                {editingOrg ? 'Modifier l\'organisation' : 'Nouvelle organisation'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nom de l'organisation
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Entrez le nom de l'organisation"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Type d'organisation
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="Synode">Synode</option>
                  <option value="SynodaLehibe">Synoda Lehibe</option>
                  <option value="Faritra">Faritra</option>
                  <option value="Sampana">Sampana</option>
                </select>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '0.5rem 0 0 0'
                }}>
                  Choisissez le type d'organisation dans la hiérarchie
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (createMutation.isLoading || updateMutation.isLoading) ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: (createMutation.isLoading || updateMutation.isLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!createMutation.isLoading && !updateMutation.isLoading) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!createMutation.isLoading && !updateMutation.isLoading) {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0px)';
                    }
                  }}
                >
                  {(createMutation.isLoading || updateMutation.isLoading) ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingOrg ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      </div>
    </div>
  );
}

export default Organisations;