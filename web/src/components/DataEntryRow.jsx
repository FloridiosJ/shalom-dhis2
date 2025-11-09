import React from 'react';
import styles from '../pages/DataEntries.module.css';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';

/**
 * DataEntryRow component - Renders a single data entry row in the table
 * @param {Object} props
 * @param {Object} props.entry - The data entry object
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 */
const DataEntryRow = ({ entry, onEdit, onDelete }) => {
  // Extraire date et heure pour affichage
  const dateObj = entry.dateConsultation ? new Date(entry.dateConsultation) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString("fr-FR") : "-";
  const timeStr = dateObj ? dateObj.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "";
  const fullDateTime = dateObj ? `${dateStr} à ${timeStr}` : "-";

  // Extract diagnostic code if present (pattern: CODE - Description)
  const diagnosticText = entry.diagnostic || "-";
  const diagnosticMatch = diagnosticText.match(/^([A-Z0-9_]+)\s*-\s*(.+)$/);
  const diagnosticCode = diagnosticMatch ? diagnosticMatch[1] : null;
  const diagnosticLabel = diagnosticMatch ? diagnosticMatch[2] : diagnosticText;

  // Patient name
  const patientName = entry.patient ? `${entry.patient.nom} ${entry.patient.prenom}` : "-";

  return (
    <tr>
      <td className={`${styles.td} ${styles.tdDate}`} title={fullDateTime}>
        {dateStr}
      </td>
      <td className={`${styles.td} ${styles.tdPatient}`} title={patientName}>
        {patientName}
      </td>
      <td className={`${styles.td} ${styles.tdDispensaire}`} title={entry.dispensaire?.name || "-"}>
        {entry.dispensaire?.name || "-"}
      </td>
      <td className={`${styles.td} ${styles.tdDiagnostic}`}>
        <div className={styles.diagnosticContainer} title={diagnosticText}>
          <span className={styles.diagnosticText}>{diagnosticLabel}</span>
          {diagnosticCode && (
            <span className={styles.diagnosticCode}>{diagnosticCode}</span>
          )}
        </div>
      </td>
      <td className={`${styles.td} ${styles.tdPrescription}`}>
        {entry.prescriptionItems && entry.prescriptionItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {entry.prescriptionItems.map((item, idx) => (
              <div key={item.id || idx} style={{ fontSize: '0.875rem' }}>
                <strong>{item.medicament}</strong>
                {item.dose && ` - ${item.dose}`}
                {item.frequence && ` - ${item.frequence}`}
                {item.duree && ` (${item.duree})`}
              </div>
            ))}
            {entry.prescription && (
              <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: '#64748b', fontSize: '0.8rem' }}>
                Note: {entry.prescription}
              </div>
            )}
          </div>
        ) : (
          <span title={entry.prescription || "-"}>{entry.prescription || "-"}</span>
        )}
      </td>
      <td className={`${styles.td} ${styles.tdActions}`}>
        <EditButton
          onClick={() => onEdit(entry)}
          ariaLabel={`Modifier la consultation du ${dateStr}`}
        />
        <DeleteButton
          onClick={() => onDelete(entry)}
          ariaLabel={`Supprimer la consultation du ${dateStr}`}
        />
      </td>
    </tr>
  );
};

export default DataEntryRow;
