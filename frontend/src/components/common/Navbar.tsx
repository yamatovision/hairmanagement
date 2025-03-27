import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// ナビゲーションアイテムの型定義
export interface NavItem {
  /** アイテムのラベル */
  label: string;
  /** アイテムのリンク先 */
  href: string;
  /** アイテムのアイコン（オプション） */
  icon?: React.ReactNode;
  /** サブナビゲーションアイテム（オプション） */
  subItems?: NavItem[];
  /** 特定のロールにのみ表示する場合 */
  requiredRole?: 'employee' | 'manager' | 'admin';
  /** アクティブかどうか */
  active?: boolean;
  /** カスタムクリックハンドラー（クリック時にhrefにナビゲートする代わりに実行） */
  onClick?: () => void;
}

// ナビゲーションコンポーネントのプロップス型
export interface NavbarProps {
  /** アプリケーションのブランド（ロゴ、名前など） */
  brand: React.ReactNode;
  /** ナビゲーションアイテム */
  navItems: NavItem[];
  /** 現在のパス（アクティブなアイテムを特定するため） */
  currentPath: string;
  /** ナビゲーションボタンのクリックハンドラー */
  onNavClick?: (href: string) => void;
  /** ダークテーマを使用するかどうか */
  darkTheme?: boolean;
  /** 固定位置のヘッダーとするかどうか */
  fixed?: boolean;
  /** スクロール時に表示/非表示を切り替えるかどうか */
  hideOnScroll?: boolean;
  /** ユーザーメニューを表示するかどうか */
  showUserMenu?: boolean;
  /** ロゴをクリックしたときのハンドラー */
  onBrandClick?: () => void;
  /** ユーザーログアウト処理 */
  onLogout?: () => void;
  /** ユーザープロフィールページリンク */
  profileLink?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * Navbar コンポーネント
 * 
 * ナビゲーションバーコンポーネント。
 * ロゴ、ナビゲーションアイテム、ユーザーメニューを含みます。
 */
const Navbar: React.FC<NavbarProps> = ({
  brand,
  navItems,
  currentPath,
  onNavClick,
  darkTheme = false,
  fixed = true,
  hideOnScroll = false,
  showUserMenu = true,
  onBrandClick,
  onLogout,
  profileLink = '/profile',
  className = '',
}) => {
  // 認証コンテキスト
  const { user, logout } = useAuth();
  
  // モバイルメニューの状態
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ユーザーメニューの状態
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // スクロール状態の管理（hideOnScrollが有効な場合）
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // スクロールイベントハンドラー
  React.useEffect(() => {
    if (!hideOnScroll) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // 上にスクロール
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // 下にスクロール
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, hideOnScroll]);
  
  // ナビゲーションクリックハンドラー
  const handleNavItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else if (onNavClick) {
      e.preventDefault();
      onNavClick(item.href);
    }
    
    // モバイルメニューを閉じる
    setMobileMenuOpen(false);
  };
  
  // モバイルメニュートグル
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    
    // ユーザーメニューが開いていたら閉じる
    if (userMenuOpen) {
      setUserMenuOpen(false);
    }
  };
  
  // ユーザーメニュートグル
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
    
    setUserMenuOpen(false);
  };
  
  // ナビアイテムをフィルタリング（ユーザーロールに基づく）
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    
    const roleHierarchy = { 'employee': 0, 'manager': 1, 'admin': 2 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[item.requiredRole];
    
    return userRoleLevel >= requiredRoleLevel;
  });
  
  // ナビアイテムが現在のパスとマッチするかチェック
  const isActiveNav = (item: NavItem) => {
    if (item.active !== undefined) return item.active;
    
    // 厳密一致
    if (item.href === currentPath) return true;
    
    // 親パスの場合
    if (item.href !== '/' && currentPath.startsWith(item.href)) return true;
    
    // サブアイテムのチェック
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.href === currentPath);
    }
    
    return false;
  };
  
  // ナビゲーションクラスの生成
  const getNavbarClasses = () => {
    const classes = ['navbar'];
    
    if (darkTheme) {
      classes.push('navbar-dark');
    } else {
      classes.push('navbar-light');
    }
    
    if (fixed) {
      classes.push('fixed-top');
    }
    
    if (hideOnScroll) {
      classes.push(isVisible ? 'navbar-visible' : 'navbar-hidden');
    }
    
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  return (
    <nav className={getNavbarClasses()}>
      <div className="container">
        {/* ブランド/ロゴ */}
        <div 
          className="navbar-brand" 
          onClick={onBrandClick}
          style={{ cursor: onBrandClick ? 'pointer' : 'default' }}
        >
          {brand}
        </div>
        
        {/* モバイルトグルボタン */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* ナビゲーションアイテム */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            {filteredNavItems.map((item, index) => (
              <li 
                key={`nav-item-${index}`} 
                className={`nav-item ${isActiveNav(item) ? 'active' : ''} ${item.subItems ? 'dropdown' : ''}`}
              >
                {item.subItems ? (
                  // ドロップダウンのある項目
                  <>
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      aria-expanded="false"
                      onClick={(e) => {
                        e.preventDefault();
                        // ドロップダウン処理
                      }}
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      {item.label}
                    </a>
                    <ul className="dropdown-menu">
                      {item.subItems.map((subItem, subIndex) => (
                        <li key={`sub-item-${index}-${subIndex}`}>
                          <a
                            className={`dropdown-item ${subItem.href === currentPath ? 'active' : ''}`}
                            href={subItem.href}
                            onClick={(e) => handleNavItemClick(e, subItem)}
                          >
                            {subItem.icon && <span className="nav-icon">{subItem.icon}</span>}
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  // 通常の項目
                  <a
                    className={`nav-link ${isActiveNav(item) ? 'active' : ''}`}
                    href={item.href}
                    onClick={(e) => handleNavItemClick(e, item)}
                  >
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          {/* ユーザーメニュー */}
          {showUserMenu && user && (
            <div className="user-menu">
              <div className="user-menu-toggle" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="user-avatar-img"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="user-name d-none d-md-inline">
                  {user.name}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <h6 className="mb-0">{user.name}</h6>
                    <p className="text-secondary small mb-0">{user.email}</p>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <a 
                    href={profileLink} 
                    className="user-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setUserMenuOpen(false);
                      
                      if (onNavClick) {
                        onNavClick(profileLink);
                      }
                    }}
                  >
                    <span className="user-dropdown-icon">👤</span>
                    プロフィール
                  </a>
                  <button 
                    className="user-dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <span className="user-dropdown-icon">🚪</span>
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* スタイル */}
      <style jsx>{`
        .navbar {
          background-color: ${darkTheme ? 'var(--primary-dark)' : 'white'};
          color: ${darkTheme ? 'white' : 'var(--text-primary)'};
          padding: var(--spacing-sm) var(--spacing-md);
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s ease;
        }
        
        .navbar-visible {
          transform: translateY(0);
        }
        
        .navbar-hidden {
          transform: translateY(-100%);
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: ${darkTheme ? 'white' : 'var(--primary-color)'};
        }
        
        .navbar-toggler {
          border: none;
          background: transparent;
          padding: var(--spacing-xs);
        }
        
        .navbar-toggler-icon {
          display: inline-block;
          width: 1.5em;
          height: 1.5em;
          vertical-align: middle;
          background-image: ${darkTheme 
            ? `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cpath stroke='rgba(0, 0, 0, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E")`
          };
          background-position: center;
          background-repeat: no-repeat;
          background-size: 100%;
        }
        
        .navbar-nav {
          display: flex;
          flex-direction: row;
          padding: 0;
          margin: 0;
          list-style: none;
        }
        
        @media (max-width: 768px) {
          .navbar-nav {
            flex-direction: column;
            width: 100%;
          }
          
          .collapse {
            display: none;
          }
          
          .collapse.show {
            display: block;
          }
        }
        
        .nav-item {
          margin: 0 var(--spacing-sm);
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          color: ${darkTheme ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-primary)'};
          padding: var(--spacing-sm);
          text-decoration: none;
          font-weight: 500;
          border-radius: var(--border-radius);
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        
        .nav-link:hover {
          color: ${darkTheme ? 'white' : 'var(--primary-color)'};
          background-color: ${darkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(156, 39, 176, 0.05)'};
        }
        
        .nav-link.active {
          color: ${darkTheme ? 'white' : 'var(--primary-color)'};
          background-color: ${darkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(156, 39, 176, 0.1)'};
        }
        
        .nav-icon {
          margin-right: var(--spacing-xs);
          display: flex;
          align-items: center;
        }
        
        .user-menu {
          position: relative;
        }
        
        .user-menu-toggle {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          transition: background-color 0.2s ease;
        }
        
        .user-menu-toggle:hover {
          background-color: ${darkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: var(--spacing-sm);
          background-color: ${darkTheme ? 'rgba(255, 255, 255, 0.2)' : 'var(--primary-light)'};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .user-avatar-placeholder {
          font-weight: 500;
          font-size: 1.2rem;
          color: white;
        }
        
        .user-name {
          margin-right: var(--spacing-xs);
          white-space: nowrap;
        }
        
        .dropdown-arrow {
          font-size: 0.7rem;
          margin-left: var(--spacing-xs);
          color: ${darkTheme ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)'};
        }
        
        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 240px;
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
          margin-top: var(--spacing-xs);
          z-index: 1000;
          overflow: hidden;
        }
        
        .user-dropdown-header {
          padding: var(--spacing-md);
          background-color: var(--bg-color);
        }
        
        .user-dropdown-divider {
          height: 1px;
          background-color: rgba(0, 0, 0, 0.1);
          margin: 0;
        }
        
        .user-dropdown-item {
          display: flex;
          align-items: center;
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--text-primary);
          text-decoration: none;
          transition: background-color 0.2s ease;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        
        .user-dropdown-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .user-dropdown-icon {
          margin-right: var(--spacing-sm);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;