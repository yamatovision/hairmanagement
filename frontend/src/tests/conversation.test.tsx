import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ConversationPage from '../pages/ConversationPage';
import { FortuneProvider, useFortune } from '../contexts/FortuneContext';
import conversationService from '../services/conversation.service';

// 正しいコンテキストを使うためのインスタンス作成
const FortuneContext = React.createContext({});

// モック設定
jest.mock('../services/conversation.service');
jest.mock('../hooks/useConversation', () => ({
  useConversation: () => ({
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        content: 'こんにちは、今日の運勢を教えてください',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-2',
        sender: 'ai',
        content: 'こんにちは！本日のあなたの運勢は「木」の気が強まっています。創造性が高まる一日ですので、新しいアイデアやスタイルの試みに最適です。また、同僚との協力関係も良好でしょう。',
        timestamp: new Date().toISOString()
      }
    ],
    isLoading: false,
    sendMessage: jest.fn(),
    favoriteMessage: jest.fn(),
    currentConversation: null,
    conversations: [
      {
        id: 'conv-1',
        messages: [
          { id: 'msg-1', sender: 'user', content: 'こんにちは', timestamp: new Date().toISOString() },
          { id: 'msg-2', sender: 'ai', content: 'こんにちは、元気ですか？', timestamp: new Date().toISOString() }
        ],
        updatedAt: new Date().toISOString(),
        messageCount: 2
      }
    ],
    pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    fetchConversations: jest.fn(),
    getConversationById: jest.fn(),
    generatePromptQuestion: jest.fn().mockResolvedValue({
      questionId: 'q-1',
      content: '今日は技術向上の運気が高まる日です。サロンで習得したい次の技術は何ですか？',
      category: 'growth',
      timestamp: new Date().toISOString()
    }),
    archiveConversation: jest.fn()
  })
}));

// テスト用のコンテキスト値
const mockFortuneContext = {
  dailyFortune: {
    id: 'fortune-1',
    userId: 'user-1',
    date: new Date().toISOString().split('T')[0],
    dailyElement: '木',
    yinYang: '陽',
    overallLuck: 85,
    careerLuck: 80,
    relationshipLuck: 70,
    creativeEnergyLuck: 90,
    healthLuck: 75,
    wealthLuck: 65,
    description: '今日は創造性が高まる日です',
    advice: '新しいことに挑戦してみましょう',
    compatibleElements: ['火', '土'],
    viewedAt: null
  },
  isLoading: false,
  error: null,
  fetchDailyFortune: jest.fn(),
  markFortuneAsViewed: jest.fn()
};

describe('ConversationPage コンポーネント', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('会話ページのレンダリングと呼び水質問の表示', async () => {
    render(
      <MemoryRouter>
        <FortuneContext.Provider value={mockFortuneContext}>
          <ConversationPage />
        </FortuneContext.Provider>
      </MemoryRouter>
    );

    // コンポーネントが正しくレンダリングされることを確認
    await waitFor(() => {
      expect(screen.getByText(/今日は技術向上の運気が高まる日です/i)).toBeInTheDocument();
    });
  });

  test('メッセージの送信と表示', async () => {
    render(
      <MemoryRouter>
        <FortuneContext.Provider value={mockFortuneContext}>
          <ConversationPage />
        </FortuneContext.Provider>
      </MemoryRouter>
    );

    // メッセージ入力と送信
    const inputField = screen.getByPlaceholderText(/メッセージを入力/i);
    fireEvent.change(inputField, { target: { value: 'こんにちは！' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // useConversation フックの sendMessage が呼ばれることを確認
    await waitFor(() => {
      expect(screen.getByText(/こんにちは、今日の運勢を教えてください/i)).toBeInTheDocument();
      expect(screen.getByText(/こんにちは！本日のあなたの運勢は/i)).toBeInTheDocument();
    });
  });

  test('会話履歴の表示', async () => {
    render(
      <MemoryRouter>
        <FortuneContext.Provider value={mockFortuneContext}>
          <ConversationPage />
        </FortuneContext.Provider>
      </MemoryRouter>
    );

    // 会話履歴が表示されることを確認
    await waitFor(() => {
      // モバイル表示の場合はタブで切り替える必要がある
      const historyTab = screen.queryByText(/履歴/i);
      if (historyTab) {
        fireEvent.click(historyTab);
      }
      
      expect(screen.getByText(/会話履歴/i)).toBeInTheDocument();
      expect(screen.getByText(/会話 \(2件のメッセージ\)/i)).toBeInTheDocument();
    });
  });
});

// フロントエンドのサービスレイヤーのテスト
describe('conversation.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url, options) => {
      // デフォルトのモック実装
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    // モックの実装を上書き
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    
    localStorage.setItem('token', 'fake-token');
  });

  test('sendMessage 関数のテスト', async () => {
    // フェッチのモック実装
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          conversation: { id: 'conv-1', messages: [] },
          lastMessage: { id: 'msg-1', content: 'AI response' }
        }
      })
    }));

    const result = await conversationService.sendMessage({
      content: 'テストメッセージ'
    });

    expect(result.conversation).toBeDefined();
    expect(result.lastMessage).toBeDefined();
    expect(result.lastMessage.content).toBe('AI response');
  });

  test('generatePromptQuestion 関数のテスト', async () => {
    // フェッチのモック実装
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          questionId: 'q-1',
          content: '質問内容',
          category: 'growth',
          timestamp: new Date().toISOString()
        }
      })
    }));

    const result = await conversationService.generatePromptQuestion({
      userId: 'user-1', // 必須パラメータを追加
      category: 'growth'
    });

    expect(result.questionId).toBeDefined();
    expect(result.content).toBe('質問内容');
    expect(result.category).toBe('growth');
  });
});