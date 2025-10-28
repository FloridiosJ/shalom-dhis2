import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  console.log('🔄 Creating prescription_items table...');
  
  await queryInterface.createTable('prescription_items', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    dataEntryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'data_entries',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    medicament: {
      type: DataTypes.STRING(500),
      allowNull: false
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
    timestamps: true
  });

  // Create indexes
  await queryInterface.addIndex('prescription_items', ['dataEntryId'], {
    name: 'prescription_items_dataEntryId'
  });

  await queryInterface.addIndex('prescription_items', ['medicament'], {
    name: 'prescription_items_medicament'
  });

  await queryInterface.addIndex('prescription_items', ['dataEntryId', 'ordre'], {
    name: 'idx_prescription_item_order'
  });

  console.log('✅ prescription_items table created successfully');
}

export async function down(queryInterface) {
  console.log('🔄 Dropping prescription_items table...');
  await queryInterface.dropTable('prescription_items');
  console.log('✅ prescription_items table dropped successfully');
}
