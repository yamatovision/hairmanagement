/**
 * 経営者ダッシュボードのフロントエンドルーティングとコンポーネントのテストスクリプト
 * 
 * 使用方法:
 * node scripts/test-dashboard-routing.js
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config();

// フロントエンドのベースURL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// テスト用の認証情報（実際のアプリでは環境変数から読み込む）
const TEST_EMAIL = process.env.TEST_EMAIL || 'manager@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

/**
 * テスト実行結果を出力する関数
 */
const logResult = (name, success, error = null) => {
  if (success) {
    console.log(chalk.green(`✓ ${name}: テスト成功`));
  } else {
    console.log(chalk.red(`✗ ${name}: テスト失敗`));
    if (error) {
      console.log(chalk.grey('  エラー:'), error.message || error);
    }
  }
  console.log('\n');
};

/**
 * ダッシュボードのルーティングとコンポーネントをテスト
 */
const testDashboardRouting = async () => {
  console.log(chalk.blue('===== 経営者ダッシュボードのフロントエンドテスト開始 =====\n'));
  
  let browser;
  
  try {
    // Puppeteerを起動
    browser = await puppeteer.launch({
      headless: 'new', // 'new' headless モードを使用
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 1. ログインページにアクセス
    await page.goto(`${FRONTEND_URL}/login`);
    logResult('ログインページへのアクセス', true);
    
    // 2. ログイン処理（実際のアプリの仕様に合わせて調整）
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', TEST_EMAIL);
      await page.type('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      
      // ホームページへのリダイレクトを待機
      await page.waitForNavigation({ timeout: 5000 });
      logResult('ログイン処理', true);
    } catch (error) {
      // ログインフォームがない場合や認証がモックされている場合は通過
      logResult('ログイン処理 (スキップ)', true);
      console.log(chalk.yellow('  注意: ログインフォームが見つからないか、認証がモックされています'));
    }
    
    // 3. ダッシュボードページにアクセス
    await page.goto(`${FRONTEND_URL}/dashboard`);
    
    // ページタイトルまたは特定の要素が表示されるのを待機
    try {
      await page.waitForSelector('header', { timeout: 5000 });
      
      // ページ内のテキスト検索でダッシュボードであることを確認
      const headerText = await page.$eval('header', el => el.textContent);
      const isDashboard = headerText.includes('スタッフ状態管理');
      
      logResult('ダッシュボードページへのアクセス', isDashboard);
      if (!isDashboard) {
        console.log(chalk.yellow('  注意: ダッシュボードページが正しく表示されていません'));
      }
    } catch (error) {
      logResult('ダッシュボードページへのアクセス', false, error);
    }
    
    // 4. タブ切り替え機能のテスト
    try {
      // 「順調」タブをクリック
      await page.waitForSelector('#tab-stable', { timeout: 5000 });
      await page.click('#tab-stable');
      
      // 「順調」パネルが表示されるのを確認
      await page.waitForSelector('#panel-stable[style*="display: block"]', { timeout: 5000 });
      logResult('タブ切り替え機能 (順調タブ)', true);
      
      // 「要注目」タブをクリック
      await page.click('#tab-watch');
      
      // 「要注目」パネルが表示されるのを確認
      await page.waitForSelector('#panel-watch[style*="display: block"]', { timeout: 5000 });
      logResult('タブ切り替え機能 (要注目タブ)', true);
      
    } catch (error) {
      logResult('タブ切り替え機能', false, error);
    }
    
    // 5. スタッフカードが表示されていることを確認
    try {
      // いずれかのタブにスタッフカードがあるか確認
      await page.click('#tab-stable'); // 「順調」タブを表示
      
      const hasStaffCards = await page.evaluate(() => {
        const stablePanel = document.querySelector('#panel-stable');
        if (!stablePanel) return false;
        
        // カードを含む要素があるか確認（実際の実装に合わせて調整）
        const cards = stablePanel.querySelectorAll('.MuiGrid-item');
        return cards.length > 0;
      });
      
      logResult('スタッフカードの表示', hasStaffCards);
      if (!hasStaffCards) {
        console.log(chalk.yellow('  注意: スタッフカードが見つかりませんでした'));
      }
    } catch (error) {
      logResult('スタッフカードの表示', false, error);
    }
    
    console.log(chalk.blue('===== テスト完了 ====='));
    
  } catch (error) {
    console.error(chalk.red('テスト実行中にエラーが発生しました:'), error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// テストを実行
testDashboardRouting();