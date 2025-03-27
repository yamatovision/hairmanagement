import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';

// スタイル定義
const styles = {
  container: {
    position: 'fixed' as 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s ease'
  },
  online: {
    backgroundColor: '#4CAF50',
    color: 'white'
  },
  offline: {
    backgroundColor: '#F44336',
    color: 'white'
  },
  icon: {
    marginRight: '8px',
    fontSize: '18px'
  },
  badge: {
    marginLeft: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '2px 8px',
    fontSize: '12px'
  }
};

interface OfflineIndicatorProps {
  showWhenOnline?: boolean; // オンライン時も表示するかどうか
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * オフラインモードの状態を表示するインジケーターコンポーネント
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showWhenOnline = false,
  position = 'top-right'
}) => {
  const { isOffline, pendingOperations } = useOffline();

  // オンライン時に表示しない設定で、かつオンラインの場合は何も表示しない
  if (!isOffline && !showWhenOnline && pendingOperations === 0) {
    return null;
  }
  
  // ポジションに応じたスタイル調整
  let positionStyle = {};
  switch (position) {
    case 'top-left':
      positionStyle = { top: '16px', left: '16px', right: 'auto' };
      break;
    case 'bottom-right':
      positionStyle = { bottom: '16px', right: '16px', top: 'auto' };
      break;
    case 'bottom-left':
      positionStyle = { bottom: '16px', left: '16px', top: 'auto', right: 'auto' };
      break;
    case 'top-right':
    default:
      positionStyle = { top: '16px', right: '16px' };
      break;
  }

  return (
    <div 
      style={{
        ...styles.container,
        ...positionStyle,
        ...(isOffline ? styles.offline : styles.online)
      }}
    >
      <span style={styles.icon} className="material-icons">
        {isOffline ? 'cloud_off' : 'cloud_done'}
      </span>
      
      <span>
        {isOffline ? 'オフラインモード' : 'オンライン'}
      </span>
      
      {pendingOperations > 0 && (
        <span style={styles.badge}>
          {pendingOperations}件の保留中
        </span>
      )}
    </div>
  );
};

export default OfflineIndicator;