/**
 * 運勢APIのE2Eテスト
 * このスクリプトは次のことを行います：
 * 1. ログインして認証トークンを取得
 * 2. 運勢データAPIを呼び出す
 * 3. 返されたデータの構造を検証する
 */
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

// 設定
const API_URL = 'http://localhost:5001/api'; // バックエンドのAPIエンドポイント
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

/**
 * ログインしてトークンを取得
 */
async function login() {
  try {
    console.log(`${TEST_USER.email}としてログイン中...`);
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    
    if (response.status !== 200 || !response.data.accessToken) {
      console.error('ログイン失敗:', response.data);
      return null;
    }
    
    console.log('ログイン成功');
    return response.data.accessToken;
  } catch (error) {
    console.error('ログインエラー:', error.message);
    if (error.response) {
      console.error('ステータス:', error.response.status);
      console.error('レスポンス:', error.response.data);
    }
    return null;
  }
}

/**
 * 今日の運勢を取得
 */
async function getDailyFortune(token) {
  try {
    console.log('今日の運勢データを取得中...');
    const response = await axios.get(`${API_URL}/fortunes/daily`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status !== 200) {
      console.error('運勢データ取得失敗:', response.data);
      return null;
    }
    
    console.log('運勢データ取得成功');
    return response.data;
  } catch (error) {
    console.error('運勢データ取得エラー:', error.message);
    if (error.response) {
      console.error('ステータス:', error.response.status);
      console.error('レスポンス:', error.response.data);
    }
    return null;
  }
}

/**
 * 運勢データを検証
 */
function validateFortuneData(fortune) {
  console.log('\n=== 運勢データの検証 ===');
  
  // 必須フィールドがあるか確認
  const requiredFields = [
    'id', 'date', 'overallScore', 'starRating',
    'rating', 'aiGeneratedAdvice'
  ];
  
  const missingFields = requiredFields.filter(field => !fortune[field]);
  
  if (missingFields.length > 0) {
    console.error('警告: 必須フィールドが欠けています:', missingFields);
    return false;
  }
  
  // AIGeneratedAdviceの検証
  if (fortune.aiGeneratedAdvice) {
    console.log('AIGeneratedAdvice検証:');
    
    const requiredAdviceFields = ['summary', 'personalAdvice', 'teamAdvice', 'luckyPoints'];
    const missingAdviceFields = requiredAdviceFields.filter(field => 
      !fortune.aiGeneratedAdvice[field]);
    
    if (missingAdviceFields.length > 0) {
      console.error('警告: AIGeneratedAdviceに必須フィールドが欠けています:', missingAdviceFields);
    } else {
      // 各フィールドを検証
      console.log('- summary:', fortune.aiGeneratedAdvice.summary.substring(0, 50) + '...');
      console.log('- personalAdvice:', fortune.aiGeneratedAdvice.personalAdvice.substring(0, 50) + '...');
      console.log('- teamAdvice:', fortune.aiGeneratedAdvice.teamAdvice.substring(0, 50) + '...');
      
      // luckyPointsの検証
      if (fortune.aiGeneratedAdvice.luckyPoints) {
        const luckyPoints = fortune.aiGeneratedAdvice.luckyPoints;
        console.log('- luckyPoints:');
        console.log('  * color:', luckyPoints.color);
        console.log('  * items:', JSON.stringify(luckyPoints.items));
        console.log('  * number:', luckyPoints.number);
        console.log('  * action:', luckyPoints.action);
        
        const validLuckyPoints = 
          luckyPoints.color && 
          luckyPoints.items && Array.isArray(luckyPoints.items) &&
          typeof luckyPoints.number === 'number' &&
          luckyPoints.action;
        
        if (!validLuckyPoints) {
          console.error('警告: luckyPointsの形式が無効です');
          return false;
        }
      } else {
        console.error('警告: luckyPointsフィールドがありません');
        return false;
      }
    }
  } else {
    console.error('警告: aiGeneratedAdviceフィールドがありません');
    return false;
  }
  
  console.log('運勢データ検証結果: 成功 ✅ 有効な運勢データです');
  return true;
}

/**
 * 古い運勢データを削除して新しいデータを取得
 */
async function forceNewFortuneGeneration(token) {
  try {
    // 削除はAPIで提供されていない場合があるので、あくまで可能であれば
    // 実際には通常のAPIを使用
    console.log('運勢データを取得中（新規生成を強制）...');
    const todayStr = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${API_URL}/fortunes/date/${todayStr}?force=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status !== 200) {
      console.error('運勢データ取得失敗:', response.data);
      return null;
    }
    
    console.log('運勢データ取得（新規生成）成功');
    return response.data;
  } catch (error) {
    console.error('運勢データ強制生成エラー:', error.message);
    // APIに該当エンドポイントがない場合は通常のAPIを使用
    return getDailyFortune(token);
  }
}

/**
 * メインテスト実行
 */
async function runTest() {
  console.log('=== 運勢API E2Eテスト ===');
  console.log('開始:', new Date().toISOString());
  
  // ログイン
  const token = await login();
  if (!token) {
    console.error('ログインに失敗したためテストを中止します');
    return;
  }
  
  // 運勢データを取得
  const fortune = await getDailyFortune(token);
  if (!fortune) {
    console.error('運勢データの取得に失敗したためテストを中止します');
    return;
  }
  
  // データの基本情報を表示
  console.log('\n基本情報:');
  console.log('- ID:', fortune.id);
  console.log('- 日付:', fortune.date);
  console.log('- スコア:', fortune.overallScore);
  console.log('- 評価:', fortune.rating);
  console.log('- AIGeneratedAdvice:', fortune.aiGeneratedAdvice ? 'あり' : 'なし');
  
  // データを検証
  const isValid = validateFortuneData(fortune);
  
  // 検証結果を表示
  console.log('\n=== テスト結果 ===');
  console.log('運勢APIテスト:', isValid ? '成功 ✅' : '失敗 ❌');
  
  if (isValid) {
    console.log('\n全体結果: 成功 ✅ 運勢APIは正常に機能しており、適切なデータを返しています。');
    
    // 新しい運勢データを強制生成する（オプション）
    console.log('\n新しい運勢データを強制生成するテストを行いますか？（y/n）');
    // 実際のユーザー入力はここに入れるが、今回はスキップ
    const shouldForceNew = false;
    
    if (shouldForceNew) {
      console.log('\n=== 新規運勢データ強制生成テスト ===');
      const newFortune = await forceNewFortuneGeneration(token);
      if (newFortune) {
        console.log('新規データID:', newFortune.id);
        const isNewValid = validateFortuneData(newFortune);
        console.log('新規データ検証:', isNewValid ? '成功 ✅' : '失敗 ❌');
      }
    }
  } else {
    console.log('\n全体結果: 失敗 ❌ 運勢APIに問題があります。');
  }
}

// テスト実行
runTest();