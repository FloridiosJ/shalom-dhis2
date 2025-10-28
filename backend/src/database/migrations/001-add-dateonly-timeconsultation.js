/**
 * Migration: Add dateOnly and timeConsultation fields to DataEntry
 * 
 * This migration adds two new fields to support better analytics:
 * - dateOnly: YYYY-MM-DD format for easy aggregation by day/week/month
 * - timeConsultation: HH:MM:SS format for optional time tracking
 * 
 * These fields are automatically populated from dateConsultation in the resolvers
 * when creating or updating entries.
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    // Add dateOnly field (YYYY-MM-DD format)
    await queryInterface.addColumn(
      'data_entries',
      'dateOnly',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Date de consultation (YYYY-MM-DD) pour agrégations analytics'
      },
      { transaction }
    );

    // Add timeConsultation field (HH:MM:SS format)
    await queryInterface.addColumn(
      'data_entries',
      'timeConsultation',
      {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'Heure de consultation (HH:MM:SS) optionnelle'
      },
      { transaction }
    );

    // Add index on dateOnly for faster analytics queries
    await queryInterface.addIndex(
      'data_entries',
      ['dateOnly'],
      {
        name: 'idx_data_entries_date_only',
        transaction
      }
    );

    // Add composite index for common analytics queries
    await queryInterface.addIndex(
      'data_entries',
      ['dateOnly', 'dispensaireId'],
      {
        name: 'idx_date_only_dispensaire',
        transaction
      }
    );

    // Backfill dateOnly and timeConsultation from existing dateConsultation
    await queryInterface.sequelize.query(
      `UPDATE data_entries 
       SET 
         "dateOnly" = DATE("dateConsultation"),
         "timeConsultation" = "dateConsultation"::time
       WHERE "dateOnly" IS NULL`,
      { transaction }
    );

    await transaction.commit();
    console.log('✅ Migration completed: dateOnly and timeConsultation fields added');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    // Remove indexes
    await queryInterface.removeIndex(
      'data_entries',
      'idx_date_only_dispensaire',
      { transaction }
    );
    
    await queryInterface.removeIndex(
      'data_entries',
      'idx_data_entries_date_only',
      { transaction }
    );

    // Remove columns
    await queryInterface.removeColumn('data_entries', 'timeConsultation', { transaction });
    await queryInterface.removeColumn('data_entries', 'dateOnly', { transaction });

    await transaction.commit();
    console.log('✅ Migration rollback completed');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};
