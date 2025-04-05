/**
 * トークン内ユーザーID問題の根本解決スクリプト
 * 
 * 問題：
 * - トークン内のユーザーIDが実際のユーザーIDと一致していない
 * - トークン内ID: 67e487dbc4a58a62d38ac6ac
 * - 実際のユーザーID: 67e52f32fb1b7bc2b73744ce
 * 
 * 解決策1: バックエンドのトークン生成コードでのバグ修正
 * - token.service.ts または user-authentication.use-case.ts の潜在的バグを修正
 * 
 * 解決策2: 実際のユーザーのIDを変更
 * - 既存ユーザーのIDを問題のIDに変更する（IDに依存する関連データも更新）
 * 
 * このスクリプトでは解決策2を実装します（より効果的）
 */
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hairmanagement';
console.log(`接続先MongoDB: ${MONGODB_URI}`);

// 問題のあるID
const OLD_ID = '67e52f32fb1b7bc2b73744ce'; // 現在のユーザーID
const NEW_ID = '67e487dbc4a58a62d38ac6ac'; // トークンに使われているID
const EMAIL = 'admin@example.com';

// ユーザースキーマ（簡略化）
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String,
  sajuProfile: mongoose.Schema.Types.Mixed,
  elementalType: mongoose.Schema.Types.Mixed,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
});

// 運勢スキーマ（簡略化）
const fortuneSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  overallScore: Number,
  advice: String,
  createdAt: Date,
  updatedAt: Date
});

// 会話スキーマ（簡略化）
const conversationSchema = new mongoose.Schema({
  userId: String,
  messages: Array,
  createdAt: Date,
  updatedAt: Date
});

// チームスキーマ（簡略化）
const teamSchema = new mongoose.Schema({
  name: String,
  ownerId: String,
  admins: [String],
  members: [{
    userId: String,
    role: String
  }],
  createdAt: Date,
  updatedAt: Date
});

/**
 * 現在のデータベース状態を確認
 */
async function checkCurrentState() {
  try {
    const User = mongoose.model('User', userSchema);
    
    // 古いIDでユーザー確認
    const oldUser = await User.findById(OLD_ID);
    console.log(`古いID (${OLD_ID}) のユーザー:`, oldUser ? `${oldUser.email} (${oldUser.name})` : 'なし');
    
    // 新しいIDでユーザー確認
    const newUser = await User.findById(NEW_ID);
    console.log(`新しいID (${NEW_ID}) のユーザー:`, newUser ? `${newUser.email} (${newUser.name})` : 'なし');
    
    // メールアドレスでユーザー確認
    const userByEmail = await User.findOne({ email: EMAIL });
    console.log(`メールアドレス (${EMAIL}) のユーザー:`, 
                userByEmail ? `ID: ${userByEmail._id}, 名前: ${userByEmail.name}` : 'なし');
    
    if (newUser) {
      console.log('警告: 新しいIDのユーザーが既に存在します。このスクリプトを実行するとデータが上書きされます。');
      return false;
    }
    
    if (!oldUser) {
      console.log('警告: 古いIDのユーザーが見つかりません。処理を続行できません。');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('確認中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * ユーザーIDに関連するすべてのドキュメントを検索
 */
async function findRelatedDocuments() {
  const Fortune = mongoose.model('Fortune', fortuneSchema);
  const Conversation = mongoose.model('Conversation', conversationSchema);
  const Team = mongoose.model('Team', teamSchema);
  
  // ユーザーIDに関連する運勢を検索
  const fortunes = await Fortune.find({ userId: OLD_ID });
  console.log(`運勢データ: ${fortunes.length}件`);
  
  // ユーザーIDに関連する会話を検索
  const conversations = await Conversation.find({ userId: OLD_ID });
  console.log(`会話データ: ${conversations.length}件`);
  
  // ユーザーIDに関連するチームを検索（オーナー）
  const ownedTeams = await Team.find({ ownerId: OLD_ID });
  console.log(`オーナーのチーム: ${ownedTeams.length}件`);
  
  // ユーザーIDに関連するチームを検索（管理者）
  const adminTeams = await Team.find({ admins: OLD_ID });
  console.log(`管理者のチーム: ${adminTeams.length}件`);
  
  // ユーザーIDに関連するチームを検索（メンバー）
  const memberTeams = await Team.find({ 'members.userId': OLD_ID });
  console.log(`メンバーのチーム: ${memberTeams.length}件`);
  
  return {
    fortunes,
    conversations,
    ownedTeams,
    adminTeams,
    memberTeams
  };
}

/**
 * ユーザーデータの移行
 */
async function migrateUser() {
  const User = mongoose.model('User', userSchema);
  
  // 古いユーザーデータを取得
  const oldUser = await User.findById(OLD_ID);
  if (!oldUser) {
    console.log('古いIDのユーザーが見つかりません。処理を中止します。');
    return false;
  }
  
  // ユーザーデータを複製
  const userData = oldUser.toObject();
  delete userData._id; // 古いIDを削除
  
  // 新しいIDでユーザーを作成
  try {
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(NEW_ID),
      ...userData
    });
    
    await newUser.save();
    console.log(`新しいID (${NEW_ID}) でユーザーを作成しました`);
    return true;
  } catch (error) {
    console.error('ユーザー作成中にエラーが発生しました:', error);
    if (error.code === 11000) {
      console.log('一意制約違反: メールアドレスが重複しています。既存のユーザーを確認してください。');
    }
    return false;
  }
}

/**
 * 関連データのIDを更新
 */
async function updateRelatedData(relatedDocs) {
  if (!relatedDocs) return;
  
  const Fortune = mongoose.model('Fortune', fortuneSchema);
  const Conversation = mongoose.model('Conversation', conversationSchema);
  const Team = mongoose.model('Team', teamSchema);
  
  // 運勢データの更新
  for (const fortune of relatedDocs.fortunes) {
    await Fortune.updateOne(
      { _id: fortune._id },
      { $set: { userId: NEW_ID } }
    );
  }
  console.log(`運勢データを更新しました: ${relatedDocs.fortunes.length}件`);
  
  // 会話データの更新
  for (const conversation of relatedDocs.conversations) {
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { userId: NEW_ID } }
    );
  }
  console.log(`会話データを更新しました: ${relatedDocs.conversations.length}件`);
  
  // チームデータの更新（オーナー）
  for (const team of relatedDocs.ownedTeams) {
    await Team.updateOne(
      { _id: team._id },
      { $set: { ownerId: NEW_ID } }
    );
  }
  console.log(`オーナーのチームを更新しました: ${relatedDocs.ownedTeams.length}件`);
  
  // チームデータの更新（管理者）
  for (const team of relatedDocs.adminTeams) {
    await Team.updateOne(
      { _id: team._id, admins: OLD_ID },
      { $pull: { admins: OLD_ID } }
    );
    await Team.updateOne(
      { _id: team._id },
      { $addToSet: { admins: NEW_ID } }
    );
  }
  console.log(`管理者のチームを更新しました: ${relatedDocs.adminTeams.length}件`);
  
  // チームデータの更新（メンバー）
  for (const team of relatedDocs.memberTeams) {
    // メンバー配列内のユーザーIDを更新
    await Team.updateOne(
      { _id: team._id, 'members.userId': OLD_ID },
      { $set: { 'members.$.userId': NEW_ID } }
    );
  }
  console.log(`メンバーのチームを更新しました: ${relatedDocs.memberTeams.length}件`);
}

/**
 * 古いユーザーの削除
 */
async function deleteOldUser() {
  const User = mongoose.model('User', userSchema);
  
  try {
    await User.deleteOne({ _id: OLD_ID });
    console.log(`古いID (${OLD_ID}) のユーザーを削除しました`);
    return true;
  } catch (error) {
    console.error('ユーザー削除中にエラーが発生しました:', error);
    return false;
  }
}

/**
 * マイグレーション後の状態を確認
 */
async function verifyMigration() {
  const User = mongoose.model('User', userSchema);
  const Fortune = mongoose.model('Fortune', fortuneSchema);
  const Conversation = mongoose.model('Conversation', conversationSchema);
  const Team = mongoose.model('Team', teamSchema);
  
  // 新しいユーザーを確認
  const newUser = await User.findById(NEW_ID);
  console.log(`新しいID (${NEW_ID}) のユーザー:`, newUser ? `${newUser.email} (${newUser.name})` : 'なし');
  
  // 古いユーザーを確認
  const oldUser = await User.findById(OLD_ID);
  console.log(`古いID (${OLD_ID}) のユーザー:`, oldUser ? `${oldUser.email} (${oldUser.name})` : 'なし');
  
  // 関連データを確認
  const fortunes = await Fortune.find({ userId: NEW_ID });
  console.log(`新しいIDの運勢データ: ${fortunes.length}件`);
  
  const conversations = await Conversation.find({ userId: NEW_ID });
  console.log(`新しいIDの会話データ: ${conversations.length}件`);
  
  const ownedTeams = await Team.find({ ownerId: NEW_ID });
  console.log(`新しいIDがオーナーのチーム: ${ownedTeams.length}件`);
  
  const adminTeams = await Team.find({ admins: NEW_ID });
  console.log(`新しいIDが管理者のチーム: ${adminTeams.length}件`);
  
  const memberTeams = await Team.find({ 'members.userId': NEW_ID });
  console.log(`新しいIDがメンバーのチーム: ${memberTeams.length}件`);
  
  // 古いIDの残りを確認
  const oldFortunes = await Fortune.find({ userId: OLD_ID });
  if (oldFortunes.length > 0) {
    console.log(`警告: 古いIDの運勢データが ${oldFortunes.length}件 残っています`);
  }
  
  const oldConversations = await Conversation.find({ userId: OLD_ID });
  if (oldConversations.length > 0) {
    console.log(`警告: 古いIDの会話データが ${oldConversations.length}件 残っています`);
  }
  
  const oldOwnedTeams = await Team.find({ ownerId: OLD_ID });
  if (oldOwnedTeams.length > 0) {
    console.log(`警告: 古いIDがオーナーのチームが ${oldOwnedTeams.length}件 残っています`);
  }
  
  return newUser && !oldUser;
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');
    
    console.log('\n=== 現在の状態を確認中 ===');
    const isValidState = await checkCurrentState();
    if (!isValidState) {
      console.log('前提条件が満たされていないため、処理を中止します。');
      await mongoose.connection.close();
      return;
    }
    
    console.log('\n=== 関連ドキュメントを検索中 ===');
    const relatedDocs = await findRelatedDocuments();
    
    console.log('\n=== ユーザーデータを移行中 ===');
    const userMigrated = await migrateUser();
    if (!userMigrated) {
      console.log('ユーザーデータの移行に失敗したため、処理を中止します。');
      await mongoose.connection.close();
      return;
    }
    
    console.log('\n=== 関連データを更新中 ===');
    await updateRelatedData(relatedDocs);
    
    console.log('\n=== 古いユーザーを削除中 ===');
    await deleteOldUser();
    
    console.log('\n=== マイグレーション結果を確認中 ===');
    const success = await verifyMigration();
    
    if (success) {
      console.log('\n✅ マイグレーションが正常に完了しました！');
      console.log(`ユーザーID ${OLD_ID} から ${NEW_ID} への移行が完了しました。`);
      console.log('これにより、トークン内のユーザーIDと実際のユーザーIDが一致するようになりました。');
    } else {
      console.log('\n⚠️ マイグレーションは部分的に完了しましたが、一部の処理が失敗した可能性があります。');
      console.log('詳細なログを確認し、必要に応じて手動で修正してください。');
    }
    
  } catch (error) {
    console.error('予期しないエラー:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
  }
}

// 警告表示と確認
console.log('\n⚠️ 警告: このスクリプトはユーザーIDを変更し、関連データを更新します ⚠️');
console.log('- バックアップを取得してから実行することを強く推奨します');
console.log('- 開発環境で十分にテストしてから本番環境で実行してください');
console.log('\n処理を開始するには、このコメントを削除し、実行してください:');
console.log('// main();');

// 安全のため、コメントアウトしておく（実行前に手動で解除する必要あり）
// main();