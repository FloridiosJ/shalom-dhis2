/**
 * Migration: Add dateNaissance field to Patient table
 * 
 * This migration:
 * - Adds dateNaissance (DATEONLY) field to patients table
 * - Makes age field nullable for gradual migration
 * - Attempts to estimate dateNaissance from existing age values
 * - Adds index on dateNaissance for performance
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Starting migration: Add dateNaissance to patients');

    // Step 1: Add dateNaissance field
    await queryInterface.addColumn(
      'patients',
      'dateNaissance',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Date de naissance du patient (YYYY-MM-DD)'
      },
      { transaction }
    );
    console.log('✅ Column dateNaissance added');

    // Step 2: Make age field nullable (for gradual migration)
    await queryInterface.changeColumn(
      'patients',
      'age',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: { args: [0], msg: 'L\'âge ne peut pas être négatif' },
          max: { args: [150], msg: 'L\'âge ne peut pas dépasser 150 ans' }
        }
      },
      { transaction }
    );
    console.log('✅ Age field made nullable');

    // Step 3: Add index on dateNaissance for performance
    await queryInterface.addIndex(
      'patients',
      ['dateNaissance'],
      {
        name: 'idx_patients_date_naissance',
        transaction
      }
    );
    console.log('✅ Index on dateNaissance created');

    // Step 4: Estimate dateNaissance from existing age values
    // Calculate birth year assuming patient's birthday hasn't occurred this year yet
    await queryInterface.sequelize.query(
      `UPDATE patients 
       SET "dateNaissance" = DATE(EXTRACT(YEAR FROM CURRENT_DATE) - age || '-01-01')
       WHERE age IS NOT NULL AND "dateNaissance" IS NULL`,
      { transaction }
    );
    console.log('✅ Estimated dateNaissance from existing age values');

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
    console.log('🔄 Rolling back migration: Remove dateNaissance from patients');

    // Remove index
    await queryInterface.removeIndex(
      'patients',
      'idx_patients_date_naissance',
      { transaction }
    );
    console.log('✅ Index removed');

    // Restore age from dateNaissance before removing the column
    await queryInterface.sequelize.query(
      `UPDATE patients 
       SET age = EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateNaissance"))
       WHERE "dateNaissance" IS NOT NULL AND age IS NULL`,
      { transaction }
    );

    // Remove dateNaissance column
    await queryInterface.removeColumn('patients', 'dateNaissance', { transaction });
    console.log('✅ Column dateNaissance removed');

    // Make age field required again
    await queryInterface.changeColumn(
      'patients',
      'age',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: 'L\'âge est obligatoire' },
          min: { args: [0], msg: 'L\'âge ne peut pas être négatif' },
          max: { args: [150], msg: 'L\'âge ne peut pas dépasser 150 ans' }
        }
      },
      { transaction }
    );
    console.log('✅ Age field made required again');

    await transaction.commit();
    console.log('✅ Migration rollback completed');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};
