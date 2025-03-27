import React from 'react';

// 陰陽五行の要素タイプ
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 要素タグのサイズ
export type ElementTagSize = 'sm' | 'md' | 'lg';

// 要素タグのプロップス型
export interface ElementTagProps {
  /** 五行要素のタイプ */
  element: ElementType;
  /** タグのサイズ */
  size?: ElementTagSize;
  /** タグの追加ラベル（オプション） */
  label?: string;
  /** 陰陽属性を表示するかどうか */
  showYinYang?: boolean;
  /** 陰陽属性（true: 陰, false: 陽） */
  yin?: boolean;
  /** クリック可能にする */
  clickable?: boolean;
  /** クリックイベントハンドラー */
  onClick?: () => void;
  /** 選択中かどうか */
  selected?: boolean;
  /** 追加のクラス名 */
  className?: string;
  /** ホバーアニメーションを追加するかどうか */
  animated?: boolean;
}

/**
 * ElementTag コンポーネント
 * 
 * 陰陽五行に基づく要素タグを表示します。
 * 木、火、土、金、水の各要素に対応した色とアイコンを用いて視覚的に区別します。
 */
const ElementTag: React.FC<ElementTagProps> = ({
  element,
  size = 'md',
  label,
  showYinYang = false,
  yin = false,
  clickable = false,
  onClick,
  selected = false,
  className = '',
  animated = false
}) => {
  // 要素タイプに基づくクラス名
  const getElementClass = () => {
    switch (element) {
      case '木': return 'element-wood';
      case '火': return 'element-fire';
      case '土': return 'element-earth';
      case '金': return 'element-metal';
      case '水': return 'element-water';
      default: return 'element-wood';
    }
  };
  
  // 要素アイコンの取得（Emoji/SVGアイコンを使用）
  const getElementIcon = () => {
    switch (element) {
      case '木':
        return '🌱'; // 木の芽
      case '火':
        return '🔥'; // 炎
      case '土':
        return '🌍'; // 地球
      case '金':
        return '🪙'; // コイン
      case '水':
        return '💧'; // 水滴
      default:
        return '🌱';
    }
  };
  
  // サイズクラスの取得
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'element-tag-sm';
      case 'lg': return 'element-tag-lg';
      default: return ''; // mdはデフォルト
    }
  };
  
  // 陰陽シンボルの取得
  const getYinYangSymbol = () => {
    return yin ? '☯︎' : '☯︎'; // 同じ文字を使用し、CSSで色分け
  };
  
  // クリックハンドラー
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  return (
    <span
      className={`
        element-tag 
        ${getElementClass()} 
        ${getSizeClass()} 
        ${clickable ? 'clickable' : ''}
        ${selected ? 'selected' : ''}
        ${animated ? 'animated' : ''}
        ${className}
      `}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {/* 要素アイコン */}
      <span className="element-icon">{getElementIcon()}</span>
      
      {/* 要素名 */}
      <span className="element-name">{element}</span>
      
      {/* ラベル（指定されている場合） */}
      {label && <span className="element-label">{label}</span>}
      
      {/* 陰陽シンボル（表示設定されている場合） */}
      {showYinYang && (
        <span className={`yin-yang-symbol ${yin ? 'yin' : 'yang'}`}>
          {getYinYangSymbol()}
        </span>
      )}
      
      {/* スタイル */}
      <style jsx>{`
        .element-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          margin: 0 4px 4px 0;
          transition: all 0.2s ease;
        }
        
        .element-tag-sm {
          padding: 2px 6px;
          font-size: 0.7rem;
          border-radius: 12px;
        }
        
        .element-tag-lg {
          padding: 6px 12px;
          font-size: 0.9rem;
          border-radius: 20px;
        }
        
        .element-wood {
          background-color: var(--element-wood);
          color: var(--element-wood-text);
        }
        
        .element-fire {
          background-color: var(--element-fire);
          color: var(--element-fire-text);
        }
        
        .element-earth {
          background-color: var(--element-earth);
          color: var(--element-earth-text);
        }
        
        .element-metal {
          background-color: var(--element-metal);
          color: var(--element-metal-text);
        }
        
        .element-water {
          background-color: var(--element-water);
          color: var(--element-water-text);
        }
        
        .element-icon {
          margin-right: 4px;
          font-size: 1.1em;
        }
        
        .element-name {
          font-weight: bold;
        }
        
        .element-label {
          margin-left: 4px;
          opacity: 0.8;
        }
        
        .yin-yang-symbol {
          margin-left: 6px;
          font-size: 1em;
        }
        
        .yin {
          color: var(--yin-color);
        }
        
        .yang {
          color: var(--yang-color);
        }
        
        .clickable {
          cursor: pointer;
          user-select: none;
          position: relative;
          overflow: hidden;
        }
        
        .clickable:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        
        .clickable:active {
          filter: brightness(0.95);
          transform: translateY(0);
        }
        
        .selected {
          box-shadow: 0 0 0 2px var(--primary-color);
        }
        
        .animated {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animated:hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: inherit;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(1.8);
          }
        }
      `}</style>
    </span>
  );
};

export default ElementTag;