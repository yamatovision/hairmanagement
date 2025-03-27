import React, { ButtonHTMLAttributes } from 'react';

// ボタンの種類を定義
export type ButtonVariant = 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary' | 'text';

// ボタンのサイズを定義
export type ButtonSize = 'sm' | 'md' | 'lg';

// ボタンコンポーネントのプロップス型
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンの種類（外観）*/
  variant?: ButtonVariant;
  /** ボタンのサイズ */
  size?: ButtonSize;
  /** コンテンツを中央に配置するかどうか */
  fullWidth?: boolean;
  /** ボタンの開始時アイコン */
  startIcon?: React.ReactNode;
  /** ボタンの終了時アイコン */
  endIcon?: React.ReactNode;
  /** ボタンの無効状態 */
  disabled?: boolean;
  /** ローディング状態 */
  loading?: boolean;
  /** onClick イベントハンドラー */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** ボタンの子要素 */
  children: React.ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * Button コンポーネント
 * 
 * アプリケーション全体で一貫したボタンスタイルを提供します。
 * さまざまな外観、サイズ、状態をサポートします。
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  // ボタンクラス名の生成
  const getButtonClasses = () => {
    const classes = ['btn'];
    
    // バリアントの追加
    if (variant) {
      classes.push(`btn-${variant}`);
    }
    
    // サイズの追加
    if (size && size !== 'md') {
      classes.push(`btn-${size}`);
    }
    
    // 幅の設定
    if (fullWidth) {
      classes.push('w-100');
    }
    
    // 無効状態
    if (disabled || loading) {
      classes.push('disabled');
    }
    
    // 外部から指定されたクラス名
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  // クリックハンドラー
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(event);
    }
  };
  
  return (
    <button
      className={getButtonClasses()}
      disabled={disabled || loading}
      onClick={handleClick}
      type={props.type || 'button'}
      {...props}
    >
      {/* ローディングインジケーター */}
      {loading && (
        <span className="spinner-container">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span className="sr-only">Loading...</span>
        </span>
      )}
      
      {/* 開始アイコン */}
      {startIcon && !loading && <span className="btn-icon-start">{startIcon}</span>}
      
      {/* ボタンテキスト */}
      <span className="btn-text">{children}</span>
      
      {/* 終了アイコン */}
      {endIcon && !loading && <span className="btn-icon-end">{endIcon}</span>}
    </button>
  );
};

export default Button;