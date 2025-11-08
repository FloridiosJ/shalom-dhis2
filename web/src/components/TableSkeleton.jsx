import React from 'react';
import styles from './TableSkeleton.module.css';

const TableSkeleton = ({ rows = 5, columns = 8 }) => {
  return (
    <div className={styles.skeletonWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className={styles.th}>
                <div className={styles.skeletonHeader} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className={styles.td}>
                  <div className={styles.skeletonCell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
