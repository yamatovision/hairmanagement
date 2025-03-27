import React from 'react';

// カードコンポーネントのプロップス型
export interface CardProps {
  /** カードのタイトル */
  title?: React.ReactNode;
  /** タイトルの下に表示される小さなテキスト */
  subtitle?: React.ReactNode;
  /** カードのメイン内容 */
  children: React.ReactNode;
  /** カード下部のアクション領域 */
  actions?: React.ReactNode;
  /** カードの幅を指定（px、%、vw単位またはautoを使用可能） */
  width?: string;
  /** 影のサイズ (sm, md, lg, none) */
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  /** ボーダーを表示するかどうか */
  bordered?: boolean;
  /** 角丸の大きさ (sm, md, lg, none) */
  borderRadius?: 'sm' | 'md' | 'lg' | 'none';
  /** 背景色 (デフォルトはホワイト) */
  backgroundColor?: string;
  /** クリック可能なカードにする */
  clickable?: boolean;
  /** クリックイベントハンドラ */
  onClick?: () => void;
  /** 追加のクラス名 */
  className?: string;
  /** 内部パディングの調整 (sm, md, lg, none) */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  /** ホバー時に浮き上がるエフェクトを追加 */
  hoverEffect?: boolean;
}

/**
 * Card コンポーネント
 * 
 * コンテンツを整理し、視覚的にグループ化するためのコンテナコンポーネント。
 * タイトル、サブタイトル、メインコンテンツ、アクションエリアを含むことができます。
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  width = 'auto',
  elevation = 'sm',
  bordered = false,
  borderRadius = 'md',
  backgroundColor = 'white',
  clickable = false,
  onClick,
  className = '',
  padding = 'md',
  hoverEffect = false,
}) => {
  // カードのクラス名を生成
  const getCardClasses = () => {
    const classes = ['card'];
    
    // 影の追加
    if (elevation !== 'none') {
      classes.push(`shadow-${elevation}`);
    }
    
    // ボーダーの追加
    if (bordered) {
      classes.push('border');
    }
    
    // 角丸の追加
    if (borderRadius !== 'none') {
      classes.push(`rounded-${borderRadius === 'md' ? '' : borderRadius}`);
    }
    
    // クリック可能スタイル
    if (clickable) {
      classes.push('cursor-pointer');
    }
    
    // ホバーエフェクト
    if (hoverEffect) {
      classes.push('hover-effect');
    }
    
    // 追加のクラス名
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  // パディングクラスを取得
  const getPaddingClass = () => {
    if (padding === 'none') return '';
    return `p-${padding === 'md' ? '3' : padding === 'sm' ? '2' : '4'}`;
  };
  
  return (
    <div
      className={getCardClasses()}
      style={{ 
        width, 
        backgroundColor,
        cursor: clickable ? 'pointer' : 'default'
      }}
      onClick={clickable && onClick ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* カードヘッダー（タイトルがある場合） */}
      {(title || subtitle) && (
        <div className={`card-header ${getPaddingClass()}`}>
          {title && (
            typeof title === 'string' ? (
              <h5 className="card-title mb-1">{title}</h5>
            ) : (
              title
            )
          )}
          {subtitle && (
            typeof subtitle === 'string' ? (
              <h6 className="card-subtitle text-secondary mb-0">{subtitle}</h6>
            ) : (
              subtitle
            )
          )}
        </div>
      )}
      
      {/* カードボディ（メインコンテンツ） */}
      <div className={`card-body ${getPaddingClass()}`}>
        {children}
      </div>
      
      {/* カードアクション（設定されている場合） */}
      {actions && (
        <div className={`card-actions ${getPaddingClass()}`}>
          {actions}
        </div>
      )}
      
      {/* カード内でhoverEffectを有効にするためのスタイル */}
      <style jsx>{`
        .hover-effect {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .hover-effect:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .card-header {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .card-actions {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Card;