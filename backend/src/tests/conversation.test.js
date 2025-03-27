const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config();

// テスト用の設定
const API_URL = process.env.API_URL || 'http://localhost:5000';
const API_BASE_PATH = '/api/v1';
let authToken;
let userId;
let conversationId;
let messageId;

// ログインしてトークンを取得する関数
async function login() {
  try {
    const response = await axios.post(`${API_URL}${API_BASE_PATH}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123'
    });
    
    authToken = response.data.data.token;
    userId = response.data.data.user.id;
    
    console.log('✅ ログイン成功');
    return true;
  } catch (error) {
    console.error('❌ ログイン失敗:', error.response?.data || error.message);
    return false;
  }
}

// 会話エンドポイントをテストする関数
async function testConversationEndpoints() {
  console.log('\n======= AI対話システム エンドポイントテスト =======\n');
  
  // ログイン
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.error('ログインに失敗したためテストを中止します');
    return;
  }
  
  // テスト1: 呼び水質問の生成
  try {
    console.log('\n------ テスト1: 呼び水質問の生成 ------');
    const response = await axios.post(
      `${API_URL}${API_BASE_PATH}/conversation/generate-prompt`,
      {
        category: 'growth'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('レスポンス:', response.data);
    console.log('✅ 呼び水質問の生成に成功しました');
  } catch (error) {
    console.error('❌ 呼び水質問の生成に失敗:', error.response?.data || error.message);
  }
  
  // テスト2: メッセージ送信（新規会話）
  try {
    console.log('\n------ テスト2: メッセージ送信（新規会話） ------');
    const response = await axios.post(
      `${API_URL}${API_BASE_PATH}/conversation/message`,
      {
        content: 'こんにちは、今日の運勢を教えてください'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    conversationId = response.data.data.conversation.id;
    messageId = response.data.data.lastMessage.id;
    
    console.log('会話ID:', conversationId);
    console.log('最新メッセージ:', response.data.data.lastMessage.content);
    console.log('✅ メッセージ送信に成功しました');
  } catch (error) {
    console.error('❌ メッセージ送信に失敗:', error.response?.data || error.message);
  }
  
  // テスト3: 会話履歴の取得
  try {
    console.log('\n------ テスト3: 会話履歴の取得 ------');
    const response = await axios.get(
      `${API_URL}${API_BASE_PATH}/conversation`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('会話数:', response.data.data.conversations.length);
    console.log('ページネーション情報:', response.data.data.pagination);
    console.log('✅ 会話履歴の取得に成功しました');
  } catch (error) {
    console.error('❌ 会話履歴の取得に失敗:', error.response?.data || error.message);
  }
  
  // テスト4: 特定の会話を取得
  if (conversationId) {
    try {
      console.log('\n------ テスト4: 特定の会話を取得 ------');
      const response = await axios.get(
        `${API_URL}${API_BASE_PATH}/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('会話ID:', response.data.data.id);
      console.log('メッセージ数:', response.data.data.messages.length);
      console.log('✅ 特定の会話の取得に成功しました');
    } catch (error) {
      console.error('❌ 特定の会話の取得に失敗:', error.response?.data || error.message);
    }
  }
  
  // テスト5: メッセージをお気に入り登録
  if (conversationId && messageId) {
    try {
      console.log('\n------ テスト5: メッセージをお気に入り登録 ------');
      const response = await axios.put(
        `${API_URL}${API_BASE_PATH}/conversation/${conversationId}/favorite`,
        {
          messageId
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('お気に入り状態:', response.data.data.isFavorite);
      console.log('✅ メッセージのお気に入り登録に成功しました');
    } catch (error) {
      console.error('❌ メッセージのお気に入り登録に失敗:', error.response?.data || error.message);
    }
  }
  
  // テスト6: メッセージ送信（既存の会話）
  if (conversationId) {
    try {
      console.log('\n------ テスト6: メッセージ送信（既存の会話） ------');
      const response = await axios.post(
        `${API_URL}${API_BASE_PATH}/conversation/message`,
        {
          conversationId,
          content: '今日のラッキーカラーは何色ですか？'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('最新メッセージ:', response.data.data.lastMessage.content);
      console.log('✅ 既存の会話へのメッセージ送信に成功しました');
    } catch (error) {
      console.error('❌ 既存の会話へのメッセージ送信に失敗:', error.response?.data || error.message);
    }
  }
  
  // テスト7: 会話をアーカイブ
  if (conversationId) {
    try {
      console.log('\n------ テスト7: 会話をアーカイブ ------');
      const response = await axios.put(
        `${API_URL}${API_BASE_PATH}/conversation/${conversationId}/archive`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('アーカイブ状態:', response.data.data.isArchived);
      console.log('✅ 会話のアーカイブに成功しました');
    } catch (error) {
      console.error('❌ 会話のアーカイブに失敗:', error.response?.data || error.message);
    }
  }
  
  console.log('\n======= テスト完了 =======\n');
}

// メイン関数の実行
testConversationEndpoints();