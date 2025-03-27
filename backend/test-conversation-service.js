/**
 * 会話サービスとClaude API連携テストスクリプト
 * 
 * 実際の会話サービスとClaude APIの連携をテストし、
 * 適切なレスポンスが返されるかを確認します。
 */

// 必要なモジュールをインポート
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// 環境変数の読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// MongoDB接続情報
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';

// インポート必要なモジュール用のパス設定（ts-nodeが必要）
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017',
  }
});

// サービスとモデルのインポート
const { claudeService } = require('./src/services/claude.service');
const User = require('./src/models/user.model').default;

/**
 * テスト用の会話履歴
 */
const sampleConversationHistory = [
  {
    id: uuidv4(),
    sender: 'user',
    content: 'こんにちは、今日は髪型について相談したいです。',
    timestamp: new Date().toISOString()
  },
  {
    id: uuidv4(),
    sender: 'ai',
    content: 'こんにちは！髪型についてのご相談、承りました。どのような髪型に興味がありますか？',
    timestamp: new Date().toISOString()
  }
];

/**
 * 会話サービスとClaude API連携をテストする関数
 */
async function testConversationWithClaudeAPI() {
  try {
    console.log('会話サービスとClaude API連携テストを開始します...');
    
    // MongoDB接続
    console.log('データベースに接続中...');
    await mongoose.connect(DB_URI);
    console.log('データベース接続成功');
    
    // テストユーザーの取得（またはテスト用に新規作成）
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('テストユーザーが見つからないため、新規作成します');
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'テストユーザー',
        role: 'user',
        elementalType: '木',
      });
      await testUser.save();
      console.log('テストユーザー作成完了');
    }
    
    const userId = testUser._id.toString();
    console.log(`テストユーザーID: ${userId}`);
    
    // Claude APIで応答を生成
    console.log('Claude APIへリクエスト送信中...');
    const testMessage = 'ショートカットの新しいスタイルを考えています。おすすめはありますか？';
    
    const response = await claudeService.generateResponse(
      userId,
      testMessage,
      sampleConversationHistory
    );
    
    // 結果を表示
    console.log('\n--- Claude APIレスポンス ---');
    console.log(`質問: ${testMessage}`);
    console.log(`回答: ${response.content}`);
    console.log(`感情分析スコア: ${response.sentimentScore}`);
    console.log('--- レスポンス終了 ---\n');
    
    // 呼び水質問のテスト
    console.log('呼び水質問生成テスト開始...');
    
    const promptTemplate = promptTemplates.getPromptQuestionTemplate('growth');
    const promptQuestion = await claudeService.generatePromptQuestion(
      userId,
      promptTemplate,
      {
        userElement: testUser.elementalType,
        dailyElement: '火',
        dailyYinYang: '陽',
        overallLuck: 78
      }
    );
    
    console.log('\n--- 呼び水質問レスポンス ---');
    console.log(`生成された質問: ${promptQuestion}`);
    console.log('--- レスポンス終了 ---\n');
    
    console.log('会話サービスとClaude API連携テストは正常に完了しました');
    return true;
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
    return false;
  } finally {
    // MongoDB切断
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('データベース接続を終了しました');
    }
  }
}

// テストの実行
testConversationWithClaudeAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('予期せぬエラーが発生しました:', error);
    process.exit(1);
  });

// promptTemplatesのダミー実装（本来はimportするが、テスト用に簡略化）
const promptTemplates = {
  getPromptQuestionTemplate: (category) => {
    return `
以下の情報を基に、美容師の技術的成長に関する呼び水質問を生成してください。
質問は陰陽五行の{dailyElement}の特性を活かし、ユーザーの主属性である{userElement}との相性も考慮してください。
本日の運勢スコアは{overallLuck}であり、{dailyYinYang}の気が強い日です。

質問例：
「今日は技術向上の運気が高まる日です。このサロンで習得したい次の技術は何ですか？」
「創造力が冴える日です。お客様に提案したい新しいスタイルのアイデアはありますか？」

一つの魅力的な質問を生成してください。質問は単一の段落で、100文字以内に収めてください。
`;
  },
  getContextualPrompt: () => ''
};