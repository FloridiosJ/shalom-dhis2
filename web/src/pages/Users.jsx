import React, { useEffect, useState } from 'react';
import usersService from '../services/usersService';

const UserIcon = ({ size = 32, color = "#2563eb" }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="5" fill={color} opacity="0.15"/>
    <circle cx="12" cy="7" r="4" fill={color}/>
    <rect x="4" y="15" width="16" height="6" rx="3" fill={color} opacity="0.15"/>
    <rect x="6" y="16" width="12" height="4" rx="2" fill={color}/>
  </svg>
);

const badgeStyle = (isActive) => ({
  display: 'inline-block',
  padding: '0.25em 0.75em',
  borderRadius: '999px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: isActive ? '#fff' : '#64748b',
  background: isActive ? '#22c55e' : '#e5e7eb',
  boxShadow: isActive
    ? '0 2px 8px rgba(34,197,94,0.08)'
    : '0 2px 8px rgba(100,116,139,0.08)',
  letterSpacing: '0.01em',
});

const buttonStyle = {
  base: {
    border: 'none',
    borderRadius: '8px',
    padding: '0.5em 1.2em',
    fontWeight: 600,
    fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(59,130,246,0.07)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: '0.5em',
    outline: 'none',
  },
  edit: {
    background: '#3b82f6',
    color: '#fff',
  },
  editHover: {
    background: '#2563eb',
  },
  delete: {
    background: '#ef4444',
    color: '#fff',
  },
  deleteHover: {
    background: '#dc2626',
  },
  create: {
    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '1rem',
    padding: '0.7em 1.7em',
    boxShadow: '0 4px 16px rgba(59,130,246,0.13)',
    borderRadius: '10px',
    fontWeight: 700,
  },
  createHover: {
    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
  },
};

const tableStyle = {
  width: '100%',
  minWidth: '800px',
  tableLayout: 'auto',
  borderCollapse: 'separate',
  borderSpacing: 0,
  marginTop: '1.5rem',
  fontSize: '1rem',
};

const thStyle = {
  background: '#f1f5f9',
  color: '#334155',
  fontWeight: 700,
  padding: '1rem 0.75rem',
  textAlign: 'left',
  borderBottom: '2px solid #e5e7eb',
  fontSize: '1rem',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '0.85rem 0.75rem',
  borderBottom: '1px solid #e5e7eb',
  background: '#fff',
  fontSize: '0.98rem',
  whiteSpace: 'nowrap',
  color: '#1e293b', // ✅ Ajoute cette ligne pour un texte bien visible
};

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(59,130,246,0.07)',
  padding: '2.5rem 2rem 2rem 2rem',
  maxWidth: '1200px',
  width: '100%',
  margin: '4rem auto 2rem auto',
  position: 'relative',
  overflow: 'visible',
  boxSizing: 'border-box',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [editHover, setEditHover] = useState(null);
  const [deleteHover, setDeleteHover] = useState(null);
  const [createHover, setCreateHover] = useState(false);

  useEffect(() => {
    usersService.getAll()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #e8eaf6 50%, #f3e5f5 100%)',
        padding: '0',
        boxSizing: 'border-box',
      }}
    >
      <div style={cardStyle}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <UserIcon size={36} />
            <div>
              <h1 style={{
                margin: 0,
                color: '#2563eb',
                fontWeight: 600,
                fontSize: '2rem',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}>
                Gestion des utilisateurs
              </h1>
              <div style={{
                color: '#64748b',
                fontSize: '1.08rem',
                marginTop: '0.2rem',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}>
                Gérez les comptes de votre système DHIS2 Shalom
              </div>
            </div>
          </div>
          <button
            style={{
              ...buttonStyle.create,
              ...(createHover ? buttonStyle.createHover : {}),
              marginLeft: 'auto',
              marginTop: '0.5rem',
            }}
            onMouseEnter={() => setCreateHover(true)}
            onMouseLeave={() => setCreateHover(false)}
          >
            + Créer un utilisateur
          </button>
        </div>

        {/* Table */}
        <div style={{
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Prénom</th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', background: '#f9fafb' }}>
                    Chargement...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#ef4444', background: '#f9fafb' }}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b', background: '#f9fafb' }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
              {!loading && !error && users.map((u, idx) => (
                <tr
                  key={u.id}
                  style={{
                    background: hoveredRow === idx ? '#f0f9ff' : '#fff',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.nom}</td>
                  <td style={tdStyle}>{u.prenom}</td>
                  <td style={tdStyle}>{u.role}</td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(u.isActive)}>
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...buttonStyle.base,
                        ...(editHover === idx ? buttonStyle.editHover : buttonStyle.edit),
                        marginRight: '0.5em',
                      }}
                      onMouseEnter={() => setEditHover(idx)}
                      onMouseLeave={() => setEditHover(null)}
                    >
                      Modifier
                    </button>
                    <button
                      style={{
                        ...buttonStyle.base,
                        ...(deleteHover === idx ? buttonStyle.deleteHover : buttonStyle.delete),
                      }}
                      onMouseEnter={() => setDeleteHover(idx)}
                      onMouseLeave={() => setDeleteHover(null)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Responsive padding */}
      <style>{`
        @media (max-width: 1300px) {
          div[style*="max-width: 1200px"] {
            max-width: 98vw !important;
            padding-left: 1vw !important;
            padding-right: 1vw !important;
          }
        }
        @media (max-width: 700px) {
          div[style*="max-width: 1200px"] {
            padding: 1.2rem 0.2rem 1.2rem 0.2rem !important;
          }
          h1 {
            font-size: 1.3rem !important;
          }
        }
        @media (max-width: 500px) {
          div[style*="max-width: 1200px"] {
            padding: 0.7rem 0.1rem 0.7rem 0.1rem !important;
          }
          table {
            font-size: 0.92rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Users;