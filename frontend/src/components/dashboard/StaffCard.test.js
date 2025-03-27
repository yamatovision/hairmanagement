import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffCard from './StaffCard';

// テスト用のモックデータ
const mockUser = {
  id: '1',
  name: 'テスト ユーザー',
  email: 'test@example.com',
  role: 'employee',
  birthDate: '1990-01-01',
  isActive: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

const mockStatus = {
  engagement: 85,
  satisfaction: 82,
  summary: 'テスト用のステータスサマリー',
  trend: 'improving',
};

describe('StaffCard Component', () => {
  test('ユーザー名と役職が正しく表示されること', () => {
    render(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="stable" 
      />
    );
    
    expect(screen.getByText('テスト ユーザー')).toBeInTheDocument();
    expect(screen.getByText('スタッフ')).toBeInTheDocument();
  });
  
  test('ステータスサマリーが正しく表示されること', () => {
    render(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="stable" 
      />
    );
    
    expect(screen.getByText('テスト用のステータスサマリー')).toBeInTheDocument();
  });
  
  test('エンゲージメントと満足度が正しく表示されること', () => {
    render(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="stable" 
      />
    );
    
    expect(screen.getByText(/エンゲージメント: 85/)).toBeInTheDocument();
    expect(screen.getByText('満足度: 82')).toBeInTheDocument();
  });
  
  test('カテゴリーに基づいて適切なスタイルが適用されること', () => {
    const { container, rerender } = render(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="stable" 
      />
    );
    
    // stableカテゴリーのスタイルをチェック（緑系）
    const card = container.firstChild;
    expect(card).toHaveStyle('backgroundColor: #f1f8f1');
    expect(card).toHaveStyle('borderLeft: 4px solid #a5d6a7');
    
    // followupカテゴリーで再レンダリング
    rerender(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="followup" 
      />
    );
    
    // followupカテゴリーのスタイルをチェック（赤系）
    expect(card).toHaveStyle('backgroundColor: #fff3f0');
    expect(card).toHaveStyle('borderLeft: 4px solid #ffab91');
  });
  
  test('クリックイベントが正しく動作すること', () => {
    const handleClick = jest.fn();
    
    render(
      <StaffCard 
        user={mockUser} 
        status={mockStatus} 
        category="stable" 
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('テスト ユーザー'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});