/**
 * Migration: Add location fields to Patient and DataEntry tables
 * 
 * This migration:
 * - Adds location fields (locationLat, locationLon, locationAccuracy, locationTimestamp) to patients table
 * - Adds location fields (locationLat, locationLon, locationAccuracy, locationTimestamp) to data_entries table
 * - All fields are nullable to support optional geolocation capture
 * - Adds composite index on (locationLat, locationLon) for spatial queries
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Starting migration: Add location fields to patients and data_entries');

    // Step 1: Add location fields to patients table
    await queryInterface.addColumn(
      'patients',
      'locationLat',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Latitude de la géolocalisation lors de la création/modification'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'patients',
      'locationLon',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Longitude de la géolocalisation lors de la création/modification'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'patients',
      'locationAccuracy',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Précision de la géolocalisation en mètres'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'patients',
      'locationTimestamp',
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Horodatage de la capture de géolocalisation (ISO 8601)'
      },
      { transaction }
    );

    console.log('✅ Location columns added to patients table');

    // Step 2: Add location fields to data_entries table
    await queryInterface.addColumn(
      'data_entries',
      'locationLat',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Latitude de la géolocalisation lors de la création/modification'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'data_entries',
      'locationLon',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Longitude de la géolocalisation lors de la création/modification'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'data_entries',
      'locationAccuracy',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Précision de la géolocalisation en mètres'
      },
      { transaction }
    );

    await queryInterface.addColumn(
      'data_entries',
      'locationTimestamp',
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Horodatage de la capture de géolocalisation (ISO 8601)'
      },
      { transaction }
    );

    console.log('✅ Location columns added to data_entries table');

    // Step 3: Add composite index on location fields for spatial queries (patients)
    await queryInterface.addIndex(
      'patients',
      ['locationLat', 'locationLon'],
      {
        name: 'idx_patients_location',
        where: {
          locationLat: { [Sequelize.Op.ne]: null },
          locationLon: { [Sequelize.Op.ne]: null }
        },
        transaction
      }
    );

    console.log('✅ Location index created on patients table');

    // Step 4: Add composite index on location fields for spatial queries (data_entries)
    await queryInterface.addIndex(
      'data_entries',
      ['locationLat', 'locationLon'],
      {
        name: 'idx_data_entries_location',
        where: {
          locationLat: { [Sequelize.Op.ne]: null },
          locationLon: { [Sequelize.Op.ne]: null }
        },
        transaction
      }
    );

    console.log('✅ Location index created on data_entries table');

    await transaction.commit();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Rolling back migration: Remove location fields from patients and data_entries');

    // Remove indexes
    await queryInterface.removeIndex(
      'patients',
      'idx_patients_location',
      { transaction }
    );

    await queryInterface.removeIndex(
      'data_entries',
      'idx_data_entries_location',
      { transaction }
    );

    console.log('✅ Location indexes removed');

    // Remove location columns from patients
    await queryInterface.removeColumn('patients', 'locationLat', { transaction });
    await queryInterface.removeColumn('patients', 'locationLon', { transaction });
    await queryInterface.removeColumn('patients', 'locationAccuracy', { transaction });
    await queryInterface.removeColumn('patients', 'locationTimestamp', { transaction });

    console.log('✅ Location columns removed from patients table');

    // Remove location columns from data_entries
    await queryInterface.removeColumn('data_entries', 'locationLat', { transaction });
    await queryInterface.removeColumn('data_entries', 'locationLon', { transaction });
    await queryInterface.removeColumn('data_entries', 'locationAccuracy', { transaction });
    await queryInterface.removeColumn('data_entries', 'locationTimestamp', { transaction });

    console.log('✅ Location columns removed from data_entries table');

    await transaction.commit();
    console.log('✅ Migration rollback completed');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};
