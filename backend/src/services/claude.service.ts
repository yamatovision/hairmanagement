import { IMessage, ElementalType } from '@shared';
import { documentToInterface, documentsToInterfaces } from '../utils/model-converters';
import User from '../models/user.model';
import { CustomError } from '../utils/error.util';
import { logger } from '../utils/logger.util';
import { promptTemplates } from '../utils/prompt-templates';
// 本番環境では実際のAI応答のみ使用

// Anthropic Claude APIのインポート
import Anthropic from '@anthropic-ai/sdk';

// 環境変数からAPIキーとモデル名を取得
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';
const CLAUDE_TEMPERATURE = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7');
const CLAUDE_MAX_TOKENS = parseInt(process.env.CLAUDE_MAX_TOKENS || '1024', 10);

logger.debug(`Claude API設定: MODEL=${CLAUDE_MODEL}, APIキー${CLAUDE_API_KEY ? 'あり' : 'なし'}`);

// Anthropic APIクライアントのインスタンス化
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

/**
 * Claude APIサービス
 */
export const claudeService = {
  /**
   * AIレスポンスを生成
   */
  generateResponse: async (
    userId: string,
    content: string,
    conversationHistory: IMessage[],
    context?: any
  ) => {
    try {
      // ユーザー情報の取得
      const user = await User.findById(userId);
      if (!user) {
        throw new CustomError('ユーザーが見つかりません', 404);
      }

      logger.debug(`ユーザー[${userId}]からのメッセージ: ${content}`);

      // APIキーの存在チェック
      if (!CLAUDE_API_KEY) {
        logger.error('Claude APIキーが設定されていません。');
        throw new CustomError('AIサービスが利用できません', 503);
      }

      // 陰陽五行コンテキストを取得（ユーザー属性など）
      const userElementalType = user.elementalType || 'unknown';
      
      // 会話履歴をAnthropicのメッセージ形式に変換
      const messages = convertConversationHistoryToAnthropicFormat(conversationHistory);
      
      // ユーザーの最新メッセージを追加
      messages.push({
        role: 'user',
        content: content
      });

      // コンテキストに基づいたシステムプロンプトを構築
      let systemPrompt = `あなたは陰陽五行の原理に基づいたキャリアアドバイザーです。
ユーザーの五行属性は「${userElementalType}」です。
日本の美容師向けキャリア支援システムの一部として、プロフェッショナルで洞察に満ちた応答を提供してください。
応答は常に日本語で、親しみやすく、専門的な内容を含めてください。
陰陽五行の知恵を取り入れながら、実用的なアドバイスを提供してください。`;

      // コンテキスト情報があれば追加
      if (context) {
        const contextualPrompt = promptTemplates.getContextualPrompt(context);
        if (contextualPrompt) {
          systemPrompt += `\n\n${contextualPrompt}`;
        }
      }

      // Claude APIにリクエスト
      logger.debug('Claude APIリクエスト開始');
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        system: systemPrompt,
        messages: messages as Array<{role: "user" | "assistant", content: string}>,
        temperature: CLAUDE_TEMPERATURE,
        max_tokens: CLAUDE_MAX_TOKENS,
      });

      logger.debug('Claude APIレスポンス取得完了');

      // レスポンスからコンテンツを抽出
      const responseContent = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // シンプルな感情分析（実際の実装では、より高度な分析を行う可能性がある）
      const sentimentScore = analyzeSimpleSentiment(responseContent);
      
      return {
        content: responseContent,
        sentimentScore
      };
    } catch (error: any) {
      logger.error('Claude APIレスポンス生成エラー:', error);
      
      // エラーの種類によって異なる対応
      if (error.status === 401) {
        logger.error('API認証エラー: APIキーが無効です');
        throw new CustomError('AIサービスの認証エラー', 503);
      } else if (error.status === 429) {
        logger.error('APIレート制限エラー: リクエスト数が多すぎます');
        throw new CustomError('AIサービスのレート制限エラー', 429);
      }
      
      // その他のエラー
      throw new CustomError('AIサービスの内部エラー', 500);
    }
  },

  /**
   * 呼び水質問を生成
   */
  generatePromptQuestion: async (
    userId: string, 
    template: string, 
    context: {
      userElement?: ElementalType;
      dailyElement?: string;
      dailyYinYang?: string;
      overallLuck?: number;
    }
  ) => {
    try {
      // APIキーの確認
      if (!CLAUDE_API_KEY) {
        logger.error('Claude APIキーが設定されていません。');
        throw new CustomError('AIサービスが利用できません', 503);
      }

      // テンプレート内のプレースホルダーを置換
      let processedTemplate = template
        .replace('{userElement}', context.userElement ? String(context.userElement) : '不明')
        .replace('{dailyElement}', context.dailyElement || '木')
        .replace('{dailyYinYang}', context.dailyYinYang || '陽')
        .replace('{overallLuck}', String(context.overallLuck || 50));

      // Claude APIリクエスト
      logger.debug('Claude API 呼び水質問生成リクエスト開始');
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        system: "あなたは陰陽五行の原理に基づいたキャリアアドバイザーです。美容師向けの質問を作成してください。",
        messages: [
          {
            role: "user" as const,
            content: processedTemplate
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const question = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      logger.debug(`呼び水質問生成完了: ${question}`);
      
      return documentToInterface<any>(question);
    } catch (error: any) {
      logger.error('呼び水質問生成エラー:', error);
      
      // エラーの種類によって異なる対応
      if (error.status === 401) {
        throw new CustomError('AIサービスの認証エラー', 503);
      } else if (error.status === 429) {
        throw new CustomError('AIサービスのレート制限エラー', 429);
      }
      
      throw new CustomError('AIサービスの内部エラー', 500);
    }
  },

  /**
   * ユーザーの五行属性を取得
   */
  getUserElementalType: async (userId: string): Promise<ElementalType | null> => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return documentToInterface<any>(null);
      }
      return user.elementalType;
    } catch (error) {
      logger.error('ユーザー属性取得エラー:', error);
      return null;
    }
  },

  /**
   * 運勢データを取得
   */
  getFortuneById: async (fortuneId: string) => {
    try {
      // モック運勢データを返す
      // 実際の実装では、データベースから運勢データを取得する
      return {
        dailyElement: '木',
        yinYang: '陽',
        overallLuck: 85,
        careerLuck: 80,
        relationshipLuck: 70
      };
    } catch (error) {
      logger.error('運勢データ取得エラー:', error);
      return null;
    }
  }
};

/**
 * 会話履歴をAnthropicのメッセージ形式に変換する関数
 */
function convertConversationHistoryToAnthropicFormat(conversationHistory: IMessage[]) {
  return conversationHistory.map(message => {
    return {
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.content
    };
  });
}

// モック関数は本番環境では使用しないため削除

/**
 * シンプルな感情分析（本番環境では実際のNLPサービスを使用）
 */
function analyzeSimpleSentiment(text: string): number {
  // ポジティブワードとネガティブワードのリスト
  const positiveWords = ['うれしい', '良い', '素晴らしい', '成長', '向上', '喜び', '楽しい', '満足', '興味', 'ありがとう'];
  const negativeWords = ['悲しい', '困難', '不満', '心配', '疲れ', '不安', '失敗', '難しい', 'できない', '嫌'];
  
  // 単語の出現回数をカウント
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(word, 'g');
    const matches = text.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // -1.0〜1.0のスコアを計算
  const total = positiveCount + negativeCount;
  if (total === 0) return documentToInterface<any>(0);
  
  return (positiveCount - negativeCount) / total;
}