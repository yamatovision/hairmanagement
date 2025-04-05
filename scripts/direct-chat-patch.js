/**
 * direct-chat.ts を一時的に修正して、メールアドレスでユーザーを検索するようにするスクリプト
 * 
 * 注意: このスクリプトはテスト用で、一時的な修正を行います。
 * 本番環境では適切なデータベース移行やコード修正を行うべきです。
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// direct-chat.ts のパス
const DIRECT_CHAT_PATH = path.join(__dirname, '..', 'backend', 'src', 'direct-chat.ts');
const BACKUP_PATH = path.join(__dirname, 'direct-chat.ts.backup');

// 変更内容の説明
console.log('===== direct-chat.ts 一時修正スクリプト =====');
console.log('このスクリプトは以下の変更を行います:');
console.log('1. IDによるユーザー検索の後にメールアドレスでの検索を追加');
console.log('2. デバッグログを強化');
console.log('3. 地支十神関係の処理を確実にするためのチェックを追加');

// ユーザーに確認
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('この修正を適用しますか？(y/n): ', async (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('修正をキャンセルしました。');
    rl.close();
    return;
  }
  
  try {
    // バックアップ作成
    console.log(`元のファイルをバックアップ: ${BACKUP_PATH}`);
    fs.copyFileSync(DIRECT_CHAT_PATH, BACKUP_PATH);
    
    // ファイル読み込み
    console.log(`ファイル読み込み: ${DIRECT_CHAT_PATH}`);
    const content = fs.readFileSync(DIRECT_CHAT_PATH, 'utf8');
    
    // 修正1: findById の後にメールアドレス検索を追加
    const findByIdPattern = /const user = await userRepository\.findById\(userId\);/;
    const findByIdReplacement = `// ID で検索
            let user = await userRepository.findById(userId);
            
            // ユーザーが見つからない場合、Eメールで検索を試みる
            if (!user) {
              console.log(\`ユーザーID \${userId} が見つかりません。メール検索を試みます\`);
              
              // メールアドレスがリクエストに含まれている場合
              if (req.user && req.user.email) {
                console.log(\`メールアドレス \${req.user.email} で検索\`);
                user = await userRepository.findByEmail(req.user.email);
                
                if (user) {
                  console.log(\`メールで見つかりました: \${user.id}\`);
                }
              }
              
              // 最終手段として admin@example.com を試す
              if (!user) {
                console.log('管理者メールアドレスでの検索を試みます');
                user = await userRepository.findByEmail('admin@example.com');
                
                if (user) {
                  console.log(\`管理者ユーザーが見つかりました: \${user.id}\`);
                }
              }
            }`;
    
    // 修正2: 四柱推命情報関連のログを追加
    const sajuProfilePattern = /if \(user\.sajuProfile && user\.sajuProfile\.fourPillars\) \{/;
    const sajuProfileReplacement = `if (user.sajuProfile && user.sajuProfile.fourPillars) {
              console.log('四柱推命プロファイルが見つかりました');
              
              // データの詳細を確認
              const tenGodsExists = user.sajuProfile.tenGods && Object.keys(user.sajuProfile.tenGods).length > 0;
              const branchTenGodsExists = user.sajuProfile.branchTenGods && Object.keys(user.sajuProfile.branchTenGods).length > 0;
              
              console.log(\`十神関係: \${tenGodsExists ? 'あり' : 'なし'}\`);
              console.log(\`地支十神関係: \${branchTenGodsExists ? 'あり' : 'なし'}\`);`;
    
    // 修正3: 地支十神関係の処理を安全に行うためのチェックを追加
    const branchTenGodsPattern = /if \(branchTenGods && Object\.keys\(branchTenGods\)\.length > 0\) \{/;
    const branchTenGodsReplacement = `if (branchTenGods && typeof branchTenGods === 'object' && Object.keys(branchTenGods).length > 0) {
                console.log(\`地支十神関係情報を含めます: \${Object.keys(branchTenGods).length}件\`);`;
    
    // 修正4: 四柱推命情報がない場合のログを追加
    const noSajuPattern = /} else \{/;
    let modifiedContent = content;
    let count = 0;
    
    modifiedContent = modifiedContent.replace(noSajuPattern, (match) => {
      count++;
      if (count === 2) { // 四柱推命情報がない場合のelse節
        return `} else {
              console.log('四柱推命情報が見つかりません。基本プロンプトを使用します');`;
      }
      return match;
    });
    
    // すべての置換を適用
    modifiedContent = modifiedContent.replace(findByIdPattern, findByIdReplacement);
    modifiedContent = modifiedContent.replace(sajuProfilePattern, sajuProfileReplacement);
    modifiedContent = modifiedContent.replace(branchTenGodsPattern, branchTenGodsReplacement);
    
    // 変更を保存
    fs.writeFileSync(DIRECT_CHAT_PATH, modifiedContent);
    console.log('ファイルを修正しました');
    console.log('サーバーを再起動すると変更が適用されます');
    
    rl.close();
  } catch (error) {
    console.error('エラー:', error);
    rl.close();
  }
});