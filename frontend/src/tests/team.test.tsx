import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TeamPage from '../pages/TeamPage';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123', name: 'Test User', role: 'staff' },
    isAuthenticated: true
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the components used in TeamPage
jest.mock('../components/dashboard/StaffCard', () => {
  return {
    __esModule: true,
    default: ({ staff }: { staff: any }) => (
      <div data-testid="staff-card">
        <div data-testid="staff-name">{staff.name}</div>
      </div>
    )
  };
});

jest.mock('../components/dashboard/StaffStatusPanel', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="staff-status-panel">Staff Status Panel</div>
  };
});

describe('TeamPage Component', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <TeamPage />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders staff cards after loading', async () => {
    render(
      <BrowserRouter>
        <TeamPage />
      </BrowserRouter>
    );

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that staff cards are rendered
    expect(screen.getAllByTestId('staff-card').length).toBeGreaterThan(0);
    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤 花子')).toBeInTheDocument();
    expect(screen.getByText('鈴木 一郎')).toBeInTheDocument();
  });
  
  it('renders team compatibility section', async () => {
    render(
      <BrowserRouter>
        <TeamPage />
      </BrowserRouter>
    );

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Check that the status panel is rendered
    expect(screen.getByTestId('staff-status-panel')).toBeInTheDocument();
    expect(screen.getByText('今日のチーム相性')).toBeInTheDocument();
  });
});