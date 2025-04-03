/**
 * 不完全なaiGeneratedAdviceを持つFortuneレコードを修正するスクリプト
 */
require('dotenv').config({path: '../backend/.env'});
const mongoose = require('mongoose');

// 簡易的なFortuneスキーマ定義
const FortuneSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  date: { type: String },
  aiGeneratedAdvice: { type: Object },
  createdAt: { type: Date },
  updatedAt: { type: Date }
});

// ドキュメントを修正するために自動更新日時を無効にする
FortuneSchema.set('timestamps', false);

const Fortune = mongoose.model('Fortune', FortuneSchema);

async function updateFortuneRecords() {
  try {
    // MongoDBに接続
    await mongoose.connect('mongodb://localhost:27017/patrolmanagement');
    console.log('MongoDB接続成功');

    // 不完全なaiGeneratedAdviceを持つレコードを検索
    const fortunes = await Fortune.find({
      'aiGeneratedAdvice.luckyPoints': { $exists: true },
      'aiGeneratedAdvice.summary': { $exists: false }
    });

    console.log(`不完全なaiGeneratedAdviceを持つFortuneレコードが${fortunes.length}件見つかりました`);

    // 各レコードを更新
    for (const fortune of fortunes) {
      console.log(`FortuneID: ${fortune._id}, 日付: ${fortune.date} を更新`);

      // 現在のaiGeneratedAdviceを取得
      const currentAdvice = fortune.aiGeneratedAdvice || {};
      
      // AIGeneratedAdviceを完全な形に更新
      fortune.aiGeneratedAdvice = {
        summary: "本日は五行のエネルギーを活かして行動しましょう。",
        personalAdvice: "個人目標に向けて集中して取り組みましょう。",
        teamAdvice: "チームとの連携を大切にしてください。",
        luckyPoints: {
          color: "赤",
          items: ["鈴", "明るい色の文房具"],
          number: 8,
          action: "朝日を浴びる"
        }
      };

      // 既存のluckyPointsがあれば保持
      if (currentAdvice.luckyPoints) {
        fortune.aiGeneratedAdvice.luckyPoints = {
          ...fortune.aiGeneratedAdvice.luckyPoints,
          ...currentAdvice.luckyPoints
        };
        
        // luckyPoints.itemsが配列でない、または空の場合は修正
        if (!Array.isArray(fortune.aiGeneratedAdvice.luckyPoints.items) || 
            fortune.aiGeneratedAdvice.luckyPoints.items.length === 0) {
          fortune.aiGeneratedAdvice.luckyPoints.items = ["鈴", "明るい色の文房具"];
        }
      }
      
      // 更新を保存
      await fortune.save();
      console.log(`FortuneID: ${fortune._id} の更新完了`);
    }

    console.log('全てのFortuneレコードの更新が完了しました');
    
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('MongoDB接続を閉じました');
  } catch (error) {
    console.error('Fortuneレコード更新エラー:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('エラー発生のためMongoDB接続を閉じました');
    }
  }
}

// スクリプト実行
updateFortuneRecords();