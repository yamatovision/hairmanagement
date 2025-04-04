/**
 * AIレスポンスログを表示するシンプルなスクリプト
 */
const fs = require('fs');
const path = require('path');

// ログファイルパスの設定
const logDir = path.join(__dirname, 'test-logs');
const responseFilePath = path.join(logDir, 'ai-response.txt');
const fullResponseFilePath = path.join(logDir, 'full-response-data.json');

// 結果を表示する関数
function displayResults() {
  console.log('===== AI応答分析 =====');
  
  // AIレスポンステキストの読み込み
  try {
    const responseText = fs.readFileSync(responseFilePath, 'utf8');
    console.log('【AI応答テキスト】');
    console.log(responseText);
    console.log('\n');
    
    // キーワード分析
    analyzeKeywords(responseText);
  } catch (error) {
    console.error(`AIレスポンステキストの読み込みエラー: ${error.message}`);
  }
  
  // 完全なレスポンスデータの読み込み
  try {
    const fullResponseData = JSON.parse(fs.readFileSync(fullResponseFilePath, 'utf8'));
    console.log('【完全なレスポンスデータ構造】');
    
    // メッセージの表示
    if (fullResponseData.data && fullResponseData.data.messages) {
      console.log(`メッセージ総数: ${fullResponseData.data.messages.length}`);
      fullResponseData.data.messages.forEach((msg, index) => {
        console.log(`\nメッセージ[${index}]:`);
        console.log(`送信者: ${msg.sender}`);
        console.log(`タイムスタンプ: ${msg.timestamp}`);
        console.log(`内容: ${msg.content.substring(0, 100)}...`);
      });
    }
    
    // 使用トークン情報
    if (fullResponseData.data && fullResponseData.data.usage) {
      console.log('\n【トークン使用量】');
      console.log(`入力トークン: ${fullResponseData.data.usage.input_tokens}`);
      console.log(`出力トークン: ${fullResponseData.data.usage.output_tokens}`);
      console.log(`合計トークン: ${fullResponseData.data.usage.input_tokens + fullResponseData.data.usage.output_tokens}`);
    }
  } catch (error) {
    console.error(`完全なレスポンスデータの読み込みエラー: ${error.message}`);
  }
}

// キーワード分析関数
function analyzeKeywords(text) {
  // 地支十神関連キーワード
  const branchTenGodKeywords = [
    '地支十神', '比肩', '劫財', '食神', '傷官', '財星', '偏財', '官星', '偏官', '印綬', '偏印',
    '年柱地支', '月柱地支', '日柱地支', '時柱地支'
  ];
  
  // 四柱推命一般キーワード
  const generalKeywords = [
    '四柱推命', '四柱', '年柱', '月柱', '日柱', '時柱', '天干', '地支',
    '陰陽', '五行', '木', '火', '土', '金', '水'
  ];
  
  // 検出されたキーワードを探す
  console.log('【キーワード分析】');
  
  // 地支十神キーワード
  const foundBranchKeywords = branchTenGodKeywords.filter(keyword => text.includes(keyword));
  console.log(`地支十神キーワード: ${foundBranchKeywords.length}/${branchTenGodKeywords.length} (${(foundBranchKeywords.length / branchTenGodKeywords.length * 100).toFixed(1)}%)`);
  console.log(`検出: ${foundBranchKeywords.join(', ')}`);
  
  // 一般キーワード
  const foundGeneralKeywords = generalKeywords.filter(keyword => text.includes(keyword));
  console.log(`一般キーワード: ${foundGeneralKeywords.length}/${generalKeywords.length} (${(foundGeneralKeywords.length / generalKeywords.length * 100).toFixed(1)}%)`);
  console.log(`検出: ${foundGeneralKeywords.join(', ')}`);
  
  // 総合率
  const totalFound = foundBranchKeywords.length + foundGeneralKeywords.length;
  const totalKeywords = branchTenGodKeywords.length + generalKeywords.length;
  console.log(`総合検出率: ${totalFound}/${totalKeywords} (${(totalFound / totalKeywords * 100).toFixed(1)}%)`);
}

// メイン実行
displayResults();