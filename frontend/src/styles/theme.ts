/**
 * アプリケーションのテーマ設定
 * Material-UIのテーマをベースにプロジェクト固有のスタイル設定を追加
 */

// 要件定義書に基づく配色とスタイル設定
const theme = {
  // カラースキーム
  colors: {
    // プライマリーおよびセカンダリーカラー
    primary: {
      main: '#9c27b0', // プライマリーカラー: 紫
      light: '#bb4dd3',
      dark: '#7b1fa2',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f50057', // セカンダリーカラー: マゼンタ
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#ffffff'
    },
    
    // 陰陽五行の色
    elements: {
      wood: {
        main: '#a5d6a7', // 木: 緑
        light: '#d7ffd9',
        dark: '#75a478',
        contrastText: '#1b5e20'
      },
      fire: {
        main: '#ffab91', // 火: 赤/オレンジ
        light: '#ffddc1',
        dark: '#c97b63',
        contrastText: '#bf360c'
      },
      earth: {
        main: '#d7ccc8', // 土: 薄茶色/黄土色
        light: '#fffffb',
        dark: '#a69b97',
        contrastText: '#4e342e'
      },
      metal: {
        main: '#e0e0e0', // 金: 銀/灰色
        light: '#ffffff',
        dark: '#aeaeae',
        contrastText: '#424242'
      },
      water: {
        main: '#81d4fa', // 水: 青
        light: '#b6ffff',
        dark: '#4ba3c7',
        contrastText: '#01579b'
      }
    },
    
    // 陰陽シンボルの色
    yin: '#2c3e50', // 陰: 濃紺
    yang: '#f1c40f', // 陽: 黄金
    
    // 背景色
    background: {
      default: '#f5f5f5', // ライトグレー
      paper: '#ffffff',
      surface: '#ffffff'
    },
    
    // 状態色
    state: {
      success: '#4caf50',
      info: '#2196f3',
      warning: '#ff9800',
      error: '#f44336'
    },
    
    // テキスト色
    text: {
      primary: '#333333',
      secondary: '#757575',
      disabled: '#9e9e9e',
      hint: '#9e9e9e'
    },

    // 区切り線など
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  
  // タイポグラフィ
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    // 各要素のフォントサイズ
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      textTransform: 'uppercase'
    }
  },
  
  // スペーシング
  spacing: {
    unit: 8,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // ブレークポイント（レスポンシブデザイン用）
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },
  
  // 形状
  shape: {
    borderRadius: 4,
    borderRadiusLarge: 8,
    borderRadiusSmall: 2
  },
  
  // アニメーション
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  },
  
  // 影
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  
  // z-index
  zIndex: {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  }
};

export default theme;