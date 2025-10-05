import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// DataEntry service methods
export const dataEntryService = {
  // Get all data entries
  async getAll() {
    const query = `
      query GetDataEntries {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.dataEntries;
  },

  // Get data entry by ID
  async getById(id) {
    const query = `
      query GetDataEntry($id: ID!) {
        dataEntry(id: $id) {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query,
      variables: { id }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.dataEntry;
  },

  // Create new data entry
  async create(dataEntryData) {
    const mutation = `
      mutation CreateDataEntry($input: DataEntryInput!) {
        createDataEntry(input: $input) {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { input: dataEntryData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.createDataEntry;
  },

  // Update data entry
  async update(id, dataEntryData) {
    const mutation = `
      mutation UpdateDataEntry($id: ID!, $input: DataEntryInput!) {
        updateDataEntry(id: $id, input: $input) {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id, input: dataEntryData }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.updateDataEntry;
  },

  // Delete data entry
  async remove(id) {
    const mutation = `
      mutation DeleteDataEntry($id: ID!) {
        deleteDataEntry(id: $id)
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { id }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.deleteDataEntry;
  },

  // Get data entries by dispensaire
  async getByDispensaire(dispensaireId) {
    const query = `
      query GetDataEntriesByDispensaire($dispensaireId: ID!) {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query,
      variables: { dispensaireId }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Filter by dispensaire on client side
    return data.data.dataEntries.filter(
      entry => entry.dispensaireId === dispensaireId
    );
  },

  // Get data entries by indicator
  async getByIndicator(indicator) {
    const query = `
      query GetDataEntriesByIndicator {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Filter by indicator on client side
    return data.data.dataEntries.filter(
      entry => entry.indicator === indicator
    );
  },

  // Get data entries by date range
  async getByDateRange(startDate, endDate) {
    const query = `
      query GetDataEntriesByDateRange {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Filter by date range on client side
    return data.data.dataEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });
  },

  // Get data entries with filters
  async getWithFilters(filters = {}) {
    const query = `
      query GetDataEntriesWithFilters {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    let filteredEntries = data.data.dataEntries;

    // Apply filters on client side
    if (filters.dispensaireId) {
      filteredEntries = filteredEntries.filter(
        entry => entry.dispensaireId === filters.dispensaireId
      );
    }

    if (filters.indicator) {
      filteredEntries = filteredEntries.filter(
        entry => entry.indicator === filters.indicator
      );
    }

    if (filters.startDate) {
      filteredEntries = filteredEntries.filter(
        entry => new Date(entry.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredEntries = filteredEntries.filter(
        entry => new Date(entry.date) <= new Date(filters.endDate)
      );
    }

    if (filters.minValue !== undefined) {
      filteredEntries = filteredEntries.filter(
        entry => entry.value >= filters.minValue
      );
    }

    if (filters.maxValue !== undefined) {
      filteredEntries = filteredEntries.filter(
        entry => entry.value <= filters.maxValue
      );
    }

    return filteredEntries;
  },

  // Get statistics for data entries
  async getStatistics(dispensaireId = null, indicator = null) {
    const query = `
      query GetDataEntryStatistics {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    let entries = data.data.dataEntries;

    // Apply filters
    if (dispensaireId) {
      entries = entries.filter(entry => entry.dispensaireId === dispensaireId);
    }

    if (indicator) {
      entries = entries.filter(entry => entry.indicator === indicator);
    }

    // Calculate statistics
    const totalEntries = entries.length;
    const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
    const averageValue = totalEntries > 0 ? totalValue / totalEntries : 0;
    const maxValue = totalEntries > 0 ? Math.max(...entries.map(e => e.value)) : 0;
    const minValue = totalEntries > 0 ? Math.min(...entries.map(e => e.value)) : 0;

    // Get unique indicators and dispensaires
    const uniqueIndicators = [...new Set(entries.map(e => e.indicator))];
    const uniqueDispensaires = [...new Set(entries.map(e => e.dispensaireId))];

    // Get entries by month
    const entriesByMonth = entries.reduce((acc, entry) => {
      const month = entry.date.substring(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { count: 0, totalValue: 0 };
      }
      acc[month].count++;
      acc[month].totalValue += entry.value;
      return acc;
    }, {});

    return {
      totalEntries,
      totalValue,
      averageValue: Math.round(averageValue * 100) / 100,
      maxValue,
      minValue,
      uniqueIndicators,
      uniqueDispensaires,
      entriesByMonth
    };
  },

  // Search data entries
  async search(searchTerm) {
    const query = `
      query SearchDataEntries {
        dataEntries {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
            organisation {
              id
              name
              type
            }
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Search on client side
    const searchTermLower = searchTerm.toLowerCase();
    return data.data.dataEntries.filter(entry =>
      entry.indicator.toLowerCase().includes(searchTermLower) ||
      entry.dispensaire.name.toLowerCase().includes(searchTermLower) ||
      entry.dispensaire.organisation.name.toLowerCase().includes(searchTermLower) ||
      entry.value.toString().includes(searchTermLower)
    );
  },

  // Bulk create data entries
  async bulkCreate(dataEntriesArray) {
    const mutation = `
      mutation BulkCreateDataEntries($input: [DataEntryInput!]!) {
        bulkCreateDataEntries(input: $input) {
          id
          dispensaireId
          indicator
          value
          date
          dispensaire {
            id
            name
          }
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query: mutation,
      variables: { input: dataEntriesArray }
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.bulkCreateDataEntries;
  },

  // Get available indicators
  async getIndicators() {
    const query = `
      query GetDataEntryIndicators {
        dataEntries {
          indicator
        }
      }
    `;

    const { data } = await api.post('/graphql', {
      query
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    // Get unique indicators
    const indicators = [...new Set(data.data.dataEntries.map(entry => entry.indicator))];
    return indicators.sort();
  }
};