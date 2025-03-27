// styled.d.ts
import 'react';

// スタイルタグ内のJSXプロパティに対応するための型拡張
declare module 'react' {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}