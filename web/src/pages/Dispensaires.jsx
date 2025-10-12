import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dispensaireService from '../services/dispensaires';
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

  const navigate = useNavigate();
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

  // Statistiques
  const stats = [
    { label: 'Total Dispensaires', value: dispensaires.length, color: '#3b82f6' },
    { label: 'Organisations', value: new Set(dispensaires.map(d => d.organisationId)).size, color: '#10b981' },
    { label: 'Synode', value: dispensaires.filter(d => d.organisation?.type === 'Synode').length, color: '#f59e0b' },
    { label: 'Sampana', value: dispensaires.filter(d => d.organisation?.type === 'Sampana').length, color: '#8b5cf6' }
  ];

  if (dispensairesLoading || organisationsLoading) {
    return (
      <div className={styles.pageBg}>
        <div className={styles.loading}>Chargement des dispensaires...</div>
      </div>
    );
  }

  if (dispensairesError) {
    return (
      <div className={styles.pageBg}>
        <div className={styles.errorMsg}>Erreur: {dispensairesError.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.pageBg}>
      <div className={styles.card}>
        {/* Header harmonisé */}
        <div className={styles.header}>
          <button
            className={styles.actionBtn}
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
          <div className={styles.headerCenter}>
            <h1 className={styles.title}>Dispensaires</h1>
            <div className={styles.subtitle}>Gérer les dispensaires et centres de santé</div>
          </div>
          <button
            className={styles.actionBtn}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            type="button"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un dispensaire
          </button>
        </div>

        {/* Statistiques */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className={styles.statLabel}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recherche + Tableau */}
        <div className={styles.tableWrapper}>
          <div className={styles.tableTopBar}>
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
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Nom</th>
                <th className={styles.th}>Organisation</th>
                <th className={styles.th}>Type Organisation</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispensaires.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.td} style={{ textAlign: 'center', color: '#64748b', background: '#f9fafb', padding: '2.5rem 0' }}>
                    Aucun dispensaire trouvé
                  </td>
                </tr>
              ) : (
                filteredDispensaires.map((dispensaire) => (
                  <tr key={dispensaire.id} className={styles.tr}>
                    <td className={styles.td}>{dispensaire.name}</td>
                    <td className={styles.td}>{dispensaire.organisation?.name || 'Non assigné'}</td>
                    <td className={styles.td}>
                      {dispensaire.organisation?.type && (
                        <span className={styles.orgTypeBadge}>
                          {dispensaire.organisation.type}
                        </span>
                      )}
                    </td>
                    <td className={styles.td} style={{ textAlign: 'right' }}>
                      <button
                        className={styles.iconBtnEdit}
                        aria-label="Modifier"
                        onClick={() => handleEdit(dispensaire)}
                        type="button"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0L4.293 14.879A1 1 0 0 0 4 15.586V20z"/>
                        </svg>
                      </button>
                      <button
                        className={styles.iconBtnDelete}
                        aria-label="Supprimer"
                        onClick={() => handleDelete(dispensaire)}
                        type="button"
                        disabled={deleteMutation.isLoading}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m5 0H4"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dispensaires;