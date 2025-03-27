const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// JWT秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'aikaresumei2025';

/**
 * @route   POST api/v1/auth/register
 * @desc    ユーザー登録
 * @access  Public
 */
router.post('/register', [
  check('name', '名前は必須です').not().isEmpty(),
  check('email', '有効なメールアドレスを入力してください').isEmail(),
  check('password', 'パスワードは6文字以上必要です').isLength({ min: 6 }),
  check('birthDate', '生年月日は必須です').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '入力データが無効です', 
      errors: errors.array() 
    });
  }

  const { name, email, password, birthDate, role = 'employee' } = req.body;

  try {
    // メールアドレスが既に登録されているか確認
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'このメールアドレスは既に登録されています' 
      });
    }

    // 新規ユーザーを作成
    user = new User({
      name,
      email,
      password,
      birthDate,
      role,
      isActive: true
    });

    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // ユーザーを保存
    await user.save();

    // JWTの作成
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // パスワードを除外したユーザー情報
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'ユーザーが正常に登録されました',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   POST api/v1/auth/login
 * @desc    ユーザーログイン・認証
 * @access  Public
 */
router.post('/login', [
  check('email', '有効なメールアドレスを入力してください').isEmail(),
  check('password', 'パスワードは必須です').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '入力データが無効です', 
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // メールアドレスでユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが無効です' 
      });
    }

    // アカウントが有効かどうか確認
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'このアカウントは無効化されています' 
      });
    }

    // パスワードの照合
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが無効です' 
      });
    }

    // JWTの作成
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // 最終ログイン日時を更新
    user.lastLoginAt = new Date();
    await user.save();

    // パスワードを除外したユーザー情報
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'ログインに成功しました',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   POST api/v1/auth/admin/register
 * @desc    管理者によるユーザー登録
 * @access  Private (Admin only)
 */
router.post('/admin/register', auth, async (req, res) => {
  // 管理者権限のチェック
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '権限がありません' 
    });
  }

  const { name, email, password, birthDate, role = 'employee' } = req.body;

  // バリデーション
  if (!name || !email || !password || !birthDate) {
    return res.status(400).json({ 
      success: false, 
      message: '必須フィールドが不足しています' 
    });
  }

  try {
    // メールアドレスが既に登録されているか確認
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'このメールアドレスは既に登録されています' 
      });
    }

    // 新規ユーザーを作成
    user = new User({
      name,
      email,
      password,
      birthDate,
      role,
      isActive: true
    });

    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // ユーザーを保存
    await user.save();

    // パスワードを除外したユーザー情報
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'ユーザーが正常に登録されました',
      data: userResponse
    });
  } catch (err) {
    console.error('Admin register error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   POST api/v1/auth/refresh-token
 * @desc    リフレッシュトークンを使用して新しいトークンを発行
 * @access  Public
 */
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'リフレッシュトークンが必要です' 
    });
  }

  try {
    // リフレッシュトークンの検証
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }

    // アカウントが有効かどうか確認
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'このアカウントは無効化されています' 
      });
    }

    // 新しいJWTの作成
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // パスワードを除外したユーザー情報
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
      elementalType: user.elementalType,
      notificationSettings: user.notificationSettings,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'トークンが更新されました',
      data: {
        user: userResponse,
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    // トークンの検証に失敗した場合
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: '無効なリフレッシュトークンです' 
      });
    }

    console.error('Refresh token error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   GET api/v1/auth/me
 * @desc    現在の認証されたユーザーの情報を取得
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   POST api/v1/auth/logout
 * @desc    ユーザーのログアウト処理
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  // クライアントサイドでトークンを削除するだけなので、ここでは特に処理なし
  res.json({
    success: true,
    message: 'ログアウトしました'
  });
});

/**
 * @route   POST api/v1/auth/forgot-password
 * @desc    パスワードリセットメールの送信
 * @access  Public
 */
router.post('/forgot-password', [
  check('email', '有効なメールアドレスを入力してください').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '入力データが無効です', 
      errors: errors.array() 
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティ上の理由から、ユーザーが見つからなくても成功メッセージを返す
      return res.json({
        success: true,
        message: 'パスワードリセットメールを送信しました'
      });
    }

    // パスワードリセットトークンの作成
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // TODO: 実際のメール送信処理を実装
    // メール送信をシミュレート
    console.log('パスワードリセットメール:', {
      to: user.email,
      subject: 'パスワードリセットのリクエスト',
      resetToken
    });

    res.json({
      success: true,
      message: 'パスワードリセットメールを送信しました'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   POST api/v1/auth/reset-password
 * @desc    パスワードのリセット
 * @access  Public
 */
router.post('/reset-password', [
  check('token', 'トークンは必須です').not().isEmpty(),
  check('password', 'パスワードは6文字以上必要です').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '入力データが無効です', 
      errors: errors.array() 
    });
  }

  const { token, password } = req.body;

  try {
    // トークンの検証
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }

    // パスワードのハッシュ化と更新
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({
      success: true,
      message: 'パスワードが正常にリセットされました'
    });
  } catch (err) {
    // トークンの検証に失敗した場合
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ 
        success: false, 
        message: '無効または期限切れのトークンです' 
      });
    }

    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

/**
 * @route   PUT api/v1/auth/me/password
 * @desc    パスワードの変更
 * @access  Private
 */
router.put('/me/password', [
  auth,
  check('currentPassword', '現在のパスワードは必須です').exists(),
  check('newPassword', '新しいパスワードは6文字以上必要です').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: '入力データが無効です', 
      errors: errors.array() 
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }

    // 現在のパスワードの照合
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: '現在のパスワードが正しくありません' 
      });
    }

    // パスワードのハッシュ化と更新
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'パスワードが正常に変更されました'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

module.exports = router;