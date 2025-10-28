import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dataEntryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'data_entries',
      key: 'id'
    }
  },
  medicament: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le médicament est obligatoire' },
      notEmpty: { msg: 'Le médicament ne peut pas être vide' }
    }
  },
  dose: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Dosage du médicament (ex: 500mg, 2 comprimés)'
  },
  frequence: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Fréquence d\'administration (ex: 3x/jour, matin et soir)'
  },
  duree: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Durée du traitement (ex: 7 jours, 2 semaines)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes complémentaires sur ce médicament'
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Ordre d\'affichage dans la liste'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'prescription_items',
  timestamps: true,
  indexes: [
    { fields: ['dataEntryId'] },
    { fields: ['medicament'] },
    { 
      fields: ['dataEntryId', 'ordre'],
      name: 'idx_prescription_item_order'
    }
  ]
});

// Méthodes d'instance
PrescriptionItem.prototype.getFormattedPrescription = function() {
  let result = this.medicament;
  if (this.dose) result += ` - ${this.dose}`;
  if (this.frequence) result += ` - ${this.frequence}`;
  if (this.duree) result += ` pendant ${this.duree}`;
  if (this.notes) result += ` (${this.notes})`;
  return result;
};

// Méthodes statiques
PrescriptionItem.getByDataEntry = async function(dataEntryId) {
  return await this.findAll({
    where: { 
      dataEntryId,
      isActive: true 
    },
    order: [['ordre', 'ASC'], ['createdAt', 'ASC']]
  });
};

// Définition des associations
PrescriptionItem.associate = (models) => {
  PrescriptionItem.belongsTo(models.DataEntry, {
    foreignKey: 'dataEntryId',
    as: 'dataEntry',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default PrescriptionItem;
