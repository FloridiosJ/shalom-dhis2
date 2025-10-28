import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for managing sorting and pagination of data
 * @param {Array} data - The data array to sort and paginate
 * @param {Object} options - Configuration options
 * @param {number} options.itemsPerPage - Number of items per page
 * @param {string} options.initialSortColumn - Initial column to sort by
 * @param {string} options.initialSortDirection - Initial sort direction ('asc' or 'desc')
 * @param {Function} options.getSortValue - Function to extract sort value from an item given column name
 * @returns {Object} - Sorting and pagination state and handlers
 */
const useSortedPaginatedData = (
  data,
  {
    itemsPerPage = 10,
    initialSortColumn = '',
    initialSortDirection = 'asc',
    getSortValue,
  }
) => {
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !getSortValue) {
      return [...data];
    }

    return [...data].sort((a, b) => {
      const aVal = getSortValue(a, sortColumn);
      const bVal = getSortValue(b, sortColumn);

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, getSortValue]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle sort column change
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when data length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    // Sorted and paginated data
    currentItems,
    sortedData,
    
    // Sorting state
    sortColumn,
    sortDirection,
    handleSort,
    
    // Pagination state
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
  };
};

export default useSortedPaginatedData;
