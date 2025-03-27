import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      error: string;
      success: string;
      warning: string;
      background: string;
      text: string;
      elementWood: string;
      elementFire: string;
      elementEarth: string;
      elementMetal: string;
      elementWater: string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}

// HTMLのstyle要素でJSXプロパティを使用できるようにする拡張
declare namespace React {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}