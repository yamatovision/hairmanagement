import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowupList from './FollowupList';

// テスト用のモックデータ
const mockRecommendations = [
  {
    userId: '1',
    userName: 'テスト 太郎',
    userInitials: 'TT',
    elementColor: '#64b5f6', // 水の色
    urgency: 'high',
    reason: 'テスト理由1',
    suggestedApproach: 'テスト提案1',
  },
  {
    userId: '2',
    userName: 'テスト 次郎',
    userInitials: 'TJ',
    elementColor: '#ef5350', // 火の色
    urgency: 'medium',
    reason: 'テスト理由2',
    suggestedApproach: 'テスト提案2',
  },
  {
    userId: '3',
    userName: 'テスト 三郎',
    userInitials: 'TS',
    elementColor: '#ffd54f', // 土の色
    urgency: 'low',
    reason: 'テスト理由3',
    suggestedApproach: 'テスト提案3',
  },
];

describe('FollowupList Component', () => {
  test('ヘッダーが正しく表示されること', () => {
    render(<FollowupList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('重点フォロー対象者')).toBeInTheDocument();
  });
  
  test('全ての推奨項目が表示されること', () => {
    render(<FollowupList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('テスト 太郎')).toBeInTheDocument();
    expect(screen.getByText('テスト 次郎')).toBeInTheDocument();
    expect(screen.getByText('テスト 三郎')).toBeInTheDocument();
  });
  
  test('優先度タグが正しく表示されること', () => {
    render(<FollowupList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('優先度：高')).toBeInTheDocument();
    expect(screen.getByText('優先度：中')).toBeInTheDocument();
    expect(screen.getByText('優先度：低')).toBeInTheDocument();
  });
  
  test('理由と提案が正しく表示されること', () => {
    render(<FollowupList recommendations={mockRecommendations} />);
    
    expect(screen.getByText('テスト理由1')).toBeInTheDocument();
    expect(screen.getByText('提案：テスト提案1')).toBeInTheDocument();
    
    expect(screen.getByText('テスト理由2')).toBeInTheDocument();
    expect(screen.getByText('提案：テスト提案2')).toBeInTheDocument();
    
    expect(screen.getByText('テスト理由3')).toBeInTheDocument();
    expect(screen.getByText('提案：テスト提案3')).toBeInTheDocument();
  });
  
  test('空の推奨リストが渡された場合にエラーが発生しないこと', () => {
    const { container } = render(<FollowupList recommendations={[]} />);
    
    // コンポーネントがレンダリングされるが、リストアイテムはない
    expect(container).toBeInTheDocument();
    expect(screen.queryByText('テスト 太郎')).not.toBeInTheDocument();
  });
});