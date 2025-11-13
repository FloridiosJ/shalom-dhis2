import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Define mock hooks before importing the component
const mockUseFitorianaStats = vi.fn(() => ({
  data: null,
  isLoading: false,
  error: null
}));

const mockUseConsultantsByZone = vi.fn(() => ({
  data: null,
  isLoading: false,
  error: null
}));

// Mock the useReports hooks
vi.mock('../hooks/useReports', () => ({
  useFitorianaStats: (dateFrom, dateTo, dispensaireIds, religions) => mockUseFitorianaStats(dateFrom, dateTo, dispensaireIds, religions),
  useConsultantsByZone: (dateFrom, dateTo, dispensaireIds) => mockUseConsultantsByZone(dateFrom, dateTo, dispensaireIds)
}));

// Mock the Layout component
vi.mock('../components/Layout', () => ({
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  )
}));

// Now import the component
const TatitraPreview = (await import('./TatitraPreview')).default;

describe('TatitraPreview', () => {
  let queryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    vi.clearAllMocks();
    
    // Reset to default mock implementation
    mockUseFitorianaStats.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
    
    mockUseConsultantsByZone.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TatitraPreview />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders the main title', () => {
    renderComponent();
    expect(screen.getByText('TATITRA FANARAKETANA NY ASA')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderComponent();
    expect(screen.getByText('CSB LOTERANA')).toBeInTheDocument();
  });

  it('renders Section 1 title', () => {
    renderComponent();
    expect(screen.getByText('I. MAHAKASIKA NY ASA FITORIANA')).toBeInTheDocument();
  });

  it('renders date filter inputs', () => {
    renderComponent();
    const dateInputs = screen.getAllByLabelText(/date/i);
    expect(dateInputs.length).toBeGreaterThan(0);
  });

  it('displays empty table structure when fitorianaStats is empty', () => {
    mockUseFitorianaStats.mockReturnValue({
      data: { rows: [], totalConsultations: 0 },
      isLoading: false,
      error: null
    });

    renderComponent();
    // When data is empty, the component shows the table structure with mock zones
    expect(screen.getByText(/Toerana :/i)).toBeInTheDocument();
    expect(screen.getByText(/Ampitsopitsoka/i)).toBeInTheDocument();
  });

  it('displays loading message when data is loading', () => {
    mockUseFitorianaStats.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    renderComponent();
    expect(screen.getByText(/chargement des données/i)).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    mockUseFitorianaStats.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Test error' }
    });

    renderComponent();
    expect(screen.getByText(/Erreur: Test error/i)).toBeInTheDocument();
  });

  it('renders the print button', () => {
    renderComponent();
    expect(screen.getByText(/imprimer/i)).toBeInTheDocument();
  });

  it('renders Section 2', () => {
    renderComponent();
    expect(screen.getByText('II. MAHAKASIKA NY ASA FITSABOANA')).toBeInTheDocument();
  });

  it('renders Section 3', () => {
    renderComponent();
    expect(screen.getByText('III. FANDRIANDRAM-PITERAHANA')).toBeInTheDocument();
  });

  it('renders Section 4', () => {
    renderComponent();
    expect(screen.getByText('IV. MOMBA IREO RENY BEVOAKA')).toBeInTheDocument();
  });

  it('renders Section 5', () => {
    renderComponent();
    expect(screen.getByText('V. FANENTANANA NATAO')).toBeInTheDocument();
  });

  it('renders Section 6', () => {
    renderComponent();
    expect(screen.getByText('VI. VAOVAO AMPITAINA')).toBeInTheDocument();
  });

  it('renders data table when fitorianaStats has data', () => {
    mockUseFitorianaStats.mockReturnValue({
      data: {
        rows: [
          {
            label: 'Zaza (12 taona noho midina)',
            ageGroup: 'ZAZA',
            valuesByDispensaire: [
              {
                dispensaireName: 'Dispensaire 1',
                values: { lahy: 10, vavy: 15 }
              }
            ],
            fitambarany: { lahy: 10, vavy: 15 }
          }
        ],
        totalConsultations: 25,
        dateFrom: '2025-01-01',
        dateTo: '2025-03-31'
      },
      isLoading: false,
      error: null
    });

    renderComponent();
    expect(screen.getByText('Zaza (12 taona noho midina)')).toBeInTheDocument();
    // Use getAllByText since "Fitambarany" appears multiple times in different sections
    const fitambaranyHeaders = screen.getAllByText('Fitambarany');
    expect(fitambaranyHeaders.length).toBeGreaterThan(0);
  });
});
