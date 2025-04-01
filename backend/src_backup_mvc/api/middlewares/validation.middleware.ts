import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../utils/error.util';

/**
 * リクエスト検証ミドルウェア
 * 各エンドポイントのリクエストデータを検証する
 */
export const validateRequest = {
  /**
   * ユーザー登録リクエストの検証
   */
  register: (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, birthDate, role } = req.body;
    
    // 必須フィールドの検証
    if (!email || !password || !name || !birthDate) {
      return next(new CustomError('すべての必須フィールドを入力してください', 400));
    }
    
    // メールアドレス形式の検証
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      return next(new CustomError('有効なメールアドレスを入力してください', 400));
    }
    
    // パスワード強度の検証
    if (password.length < 6) {
      return next(new CustomError('パスワードは6文字以上である必要があります', 400));
    }
    
    // 日付形式の検証
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return next(new CustomError('生年月日はYYYY-MM-DD形式で入力してください', 400));
    }
    
    // ロールの検証（指定されている場合）
    if (role && !['employee', 'manager', 'admin'].includes(role)) {
      return next(new CustomError('無効なロールです', 400));
    }
    
    next();
  },
  
  /**
   * ログインリクエストの検証
   */
  login: (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new CustomError('メールアドレスとパスワードを入力してください', 400));
    }
    
    next();
  },
  
  /**
   * メールアドレス検証
   */
  email: (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    
    if (!email) {
      return next(new CustomError('メールアドレスを入力してください', 400));
    }
    
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      return next(new CustomError('有効なメールアドレスを入力してください', 400));
    }
    
    next();
  },
  
  /**
   * パスワードリセットリクエストの検証
   */
  resetPassword: (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return next(new CustomError('トークンとパスワードを入力してください', 400));
    }
    
    if (password.length < 6) {
      return next(new CustomError('パスワードは6文字以上である必要があります', 400));
    }
    
    next();
  },
  
  /**
   * パスワード変更リクエストの検証
   */
  changePassword: (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return next(new CustomError('現在のパスワードと新しいパスワードを入力してください', 400));
    }
    
    if (newPassword.length < 6) {
      return next(new CustomError('新しいパスワードは6文字以上である必要があります', 400));
    }
    
    if (currentPassword === newPassword) {
      return next(new CustomError('新しいパスワードは現在のパスワードと異なる必要があります', 400));
    }
    
    next();
  },

  /**
   * メッセージ送信リクエストの検証
   */
  sendMessage: (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return next(new CustomError('メッセージ内容を入力してください', 400));
    }
    
    // 長すぎるメッセージは拒否
    if (content.length > 5000) {
      return next(new CustomError('メッセージは5000文字以内にしてください', 400));
    }
    
    next();
  },
  
  /**
   * 呼び水質問生成リクエストの検証
   */
  generatePrompt: (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body;
    
    // カテゴリが指定されている場合は有効かチェック
    if (category && !['growth', 'team', 'career', 'organization'].includes(category)) {
      return next(new CustomError('無効な質問カテゴリです', 400));
    }
    
    next();
  },
  
  /**
   * お気に入りメッセージ登録リクエストの検証
   */
  favoriteMessage: (req: Request, res: Response, next: NextFunction) => {
    const { messageId } = req.body;
    
    if (!messageId) {
      return next(new CustomError('メッセージIDを指定してください', 400));
    }
    
    next();
  }
};