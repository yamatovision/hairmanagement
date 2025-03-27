import React, { useEffect, useRef } from 'react';
import Button from './Button';

// モーダルのサイズ
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

// モーダルコンポーネントのプロップス型
export interface ModalProps {
  /** モーダルが開いているかどうか */
  isOpen: boolean;
  /** モーダルを閉じる関数 */
  onClose: () => void;
  /** モーダルのタイトル */
  title?: React.ReactNode;
  /** モーダルの本文 */
  children: React.ReactNode;
  /** モーダルのフッター */
  footer?: React.ReactNode;
  /** 閉じるボタンを表示するかどうか */
  showCloseButton?: boolean;
  /** モーダルのサイズ */
  size?: ModalSize;
  /** 閉じるときにリセットする関数 */
  onReset?: () => void;
  /** モーダルの外側をクリックして閉じるかどうか */
  closeOnBackdropClick?: boolean;
  /** ESCキーを押して閉じるかどうか */
  closeOnEsc?: boolean;
  /** スクロール可能にするかどうか */
  scrollable?: boolean;
  /** 中央揃えにするかどうか */
  centered?: boolean;
  /** アニメーション効果を有効にするかどうか */
  animation?: boolean;
  /** 確認アクションの名前（デフォルト: "確認"） */
  confirmLabel?: string;
  /** 取り消しアクションの名前（デフォルト: "キャンセル"） */
  cancelLabel?: string;
  /** 確認アクションの処理 */
  onConfirm?: () => void;
  /** 確認アクションの状態 */
  isConfirmLoading?: boolean;
  /** 確認アクションの無効化 */
  isConfirmDisabled?: boolean;
  /** カスタムクラス名 */
  className?: string;
  /** カスタムヘッダークラス名 */
  headerClassName?: string;
  /** カスタムボディクラス名 */
  bodyClassName?: string;
  /** カスタムフッタークラス名 */
  footerClassName?: string;
}

/**
 * Modal コンポーネント
 * 
 * ダイアログ、アラート、またはインタラクティブなコンテンツを表示するためのモーダルコンポーネント。
 * 様々なサイズ、アニメーション、カスタマイズオプションをサポートします。
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  size = 'md',
  onReset,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  scrollable = false,
  centered = true,
  animation = true,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  onConfirm,
  isConfirmLoading = false,
  isConfirmDisabled = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  // モーダル要素への参照
  const modalRef = useRef<HTMLDivElement>(null);
  
  // モーダルが開いたときにフォーカスを設定し、スクロールを無効化
  useEffect(() => {
    if (isOpen) {
      // タイマーを使用してDOMがレンダリングされるのを待つ
      const timer = setTimeout(() => {
        // フォーカスを設定
        if (modalRef.current) {
          modalRef.current.focus();
        }
        
        // スクロールを無効化
        document.body.style.overflow = 'hidden';
      }, 50);
      
      return () => {
        clearTimeout(timer);
      };
    }
    
    return () => {
      // スクロールを再有効化
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // ESCキーイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, closeOnEsc, isOpen]);
  
  // バックドロップクリックハンドラー
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // モーダルが閉じているときはnullを返す
  if (!isOpen) return null;
  
  // モーダルサイズクラスの取得
  const getModalSizeClass = () => {
    switch (size) {
      case 'sm': return 'modal-sm';
      case 'lg': return 'modal-lg';
      case 'xl': return 'modal-xl';
      case 'fullscreen': return 'modal-fullscreen';
      default: return ''; // md サイズがデフォルト
    }
  };
  
  // デフォルトフッターの生成
  const renderDefaultFooter = () => (
    <div className={`modal-footer ${footerClassName}`}>
      <Button
        variant="outline-primary"
        onClick={() => {
          if (onReset) onReset();
          onClose();
        }}
      >
        {cancelLabel}
      </Button>
      
      <Button
        variant="primary"
        onClick={onConfirm}
        loading={isConfirmLoading}
        disabled={isConfirmDisabled}
      >
        {confirmLabel}
      </Button>
    </div>
  );
  
  return (
    <div
      className={`modal-backdrop ${animation ? 'fade-in' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`modal-dialog ${getModalSizeClass()} ${centered ? 'modal-centered' : ''} ${scrollable ? 'modal-scrollable' : ''} ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-content">
          {/* モーダルヘッダー */}
          {(title || showCloseButton) && (
            <div className={`modal-header ${headerClassName}`}>
              {title && (
                <h5 className="modal-title" id="modal-title">
                  {title}
                </h5>
              )}
              
              {showCloseButton && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onClose}
                >
                  &times;
                </button>
              )}
            </div>
          )}
          
          {/* モーダル本文 */}
          <div className={`modal-body ${bodyClassName}`}>
            {children}
          </div>
          
          {/* モーダルフッター */}
          {(footer !== undefined ? footer : onConfirm) && 
            (footer || renderDefaultFooter())
          }
        </div>
      </div>
      
      {/* スタイル */}
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: ${centered ? 'center' : 'flex-start'};
          justify-content: center;
          z-index: 1050;
          padding: ${centered ? '0' : '2rem 0'};
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        .modal-dialog {
          position: relative;
          width: 100%;
          max-width: 500px; /* デフォルトサイズ (md) */
          margin: 1.75rem auto;
          pointer-events: none;
        }
        
        .modal-sm {
          max-width: 300px;
        }
        
        .modal-lg {
          max-width: 800px;
        }
        
        .modal-xl {
          max-width: 1140px;
        }
        
        .modal-fullscreen {
          max-width: 100%;
          margin: 0;
          height: 100%;
        }
        
        .modal-centered {
          margin: 0 auto;
        }
        
        .modal-scrollable .modal-body {
          overflow-y: auto;
          max-height: calc(100vh - 210px);
        }
        
        .modal-content {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          pointer-events: auto;
          background-color: white;
          background-clip: padding-box;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-lg);
          outline: 0;
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) var(--spacing-lg);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          border-top-left-radius: var(--border-radius);
          border-top-right-radius: var(--border-radius);
        }
        
        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
          line-height: 1.5;
        }
        
        .btn-close {
          padding: 0;
          background-color: transparent;
          border: 0;
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1;
          color: var(--text-secondary);
          cursor: pointer;
        }
        
        .modal-body {
          position: relative;
          flex: 1 1 auto;
          padding: var(--spacing-lg);
        }
        
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          border-bottom-left-radius: var(--border-radius);
          border-bottom-right-radius: var(--border-radius);
        }
        
        .modal-footer > * {
          margin-left: var(--spacing-sm);
        }
        
        .fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* スマートフォン向けの調整 */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: var(--spacing-sm);
            max-width: calc(100% - var(--spacing-md));
          }
          
          .modal-body {
            padding: var(--spacing-md);
          }
          
          .modal-footer {
            padding: var(--spacing-sm) var(--spacing-md);
            flex-wrap: wrap;
          }
          
          .modal-footer > * {
            margin: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;