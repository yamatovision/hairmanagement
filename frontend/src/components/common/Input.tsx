import React, { InputHTMLAttributes, useState, useRef, useEffect } from 'react';

// 入力タイプ
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date';

// 入力サイズ
export type InputSize = 'sm' | 'md' | 'lg';

// 入力コンポーネントのプロップス
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 入力フィールドのラベル */
  label?: string;
  /** 入力タイプ */
  type?: InputType;
  /** 入力フィールドのサイズ */
  size?: InputSize;
  /** 入力フィールドの値 */
  value?: string;
  /** 初期値（制御されていない場合） */
  defaultValue?: string;
  /** 入力が変更されたときのコールバック関数 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 入力フィールドが必須かどうか */
  required?: boolean;
  /** 入力が無効かどうか */
  disabled?: boolean;
  /** エラーメッセージ（設定するとエラー状態になります） */
  error?: string;
  /** 成功状態かどうか */
  success?: boolean;
  /** ヘルプテキスト (入力フィールドの下に表示) */
  helperText?: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 入力の前に表示するアイコンまたはコンテンツ */
  startAdornment?: React.ReactNode;
  /** 入力の後に表示するアイコンまたはコンテンツ */
  endAdornment?: React.ReactNode;
  /** フルワイドスタイルを適用するかどうか */
  fullWidth?: boolean;
  /** 入力がフォーカスされたときの処理 */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 入力からフォーカスが外れたときの処理 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 最大長 */
  maxLength?: number;
  /** 最小長 */
  minLength?: number;
  /** パターン（正規表現） */
  pattern?: string;
  /** 追加のクラス名 */
  className?: string;
  /** フォームID */
  formId?: string;
  /** 自動フォーカス */
  autoFocus?: boolean;
  /** 自動補完 */
  autoComplete?: string;
  /** カウンターを表示するかどうか（最大長が設定されている場合） */
  showCounter?: boolean;
}

/**
 * Input コンポーネント
 * 
 * テキスト入力、パスワード、メールなどの各種入力フィールドを表示します。
 * ラベル、ヘルプテキスト、バリデーション、アイコン装飾などをサポートします。
 */
const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  size = 'md',
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  error,
  success = false,
  helperText,
  placeholder,
  startAdornment,
  endAdornment,
  fullWidth = false,
  onFocus,
  onBlur,
  maxLength,
  minLength,
  pattern,
  className = '',
  formId,
  autoFocus = false,
  autoComplete,
  showCounter = false,
  ...props
}) => {
  // 入力フィールドの状態
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState<number>(
    value?.length || defaultValue?.length || 0
  );
  
  // 参照
  const inputRef = useRef<HTMLInputElement>(null);
  
  // フォーカス処理
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // 値が変更されたときの処理
  useEffect(() => {
    if (value !== undefined) {
      setCharCount(value.length);
    }
  }, [value]);
  
  // 入力クラスの作成
  const getInputClasses = () => {
    const classes = ['form-control'];
    
    // サイズの追加
    if (size && size !== 'md') {
      classes.push(`form-control-${size}`);
    }
    
    // エラー状態の追加
    if (error) {
      classes.push('is-invalid');
    }
    
    // 成功状態の追加
    if (success && !error) {
      classes.push('is-valid');
    }
    
    // フォーカス状態の追加
    if (focused) {
      classes.push('focused');
    }
    
    // 無効状態の追加
    if (disabled) {
      classes.push('disabled');
    }
    
    // 装飾の追加
    if (startAdornment) {
      classes.push('has-start-adornment');
    }
    
    if (endAdornment) {
      classes.push('has-end-adornment');
    }
    
    // 幅の設定
    if (fullWidth) {
      classes.push('w-100');
    }
    
    // 追加のクラス名
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  // フォーカスイベントハンドラ
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // ブラーイベントハンドラ
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // 変更イベントハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length);
    if (onChange) {
      onChange(e);
    }
  };
  
  // 必須ラベルの表示
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <label 
        htmlFor={props.id || formId} 
        className={`form-label ${required ? 'required' : ''}`}
      >
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
    );
  };
  
  // ヘルパーテキストとエラーの表示
  const renderHelperText = () => {
    if (!helperText && !error && !(showCounter && maxLength)) return null;
    
    return (
      <div className="input-helper-text">
        {error ? (
          <div className="text-danger small">{error}</div>
        ) : helperText ? (
          <div className="text-secondary small">{helperText}</div>
        ) : null}
        
        {showCounter && maxLength && (
          <div className={`text-end small ${charCount > maxLength ? 'text-danger' : 'text-secondary'}`}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`form-group ${fullWidth ? 'w-100' : ''}`}>
      {renderLabel()}
      
      <div className="input-container">
        {startAdornment && (
          <div className="input-adornment start-adornment">
            {startAdornment}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          className={getInputClasses()}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          id={props.id || formId}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            (helperText || error) && (props.id || formId)
              ? `${props.id || formId}-helper-text`
              : undefined
          }
          {...props}
        />
        
        {endAdornment && (
          <div className="input-adornment end-adornment">
            {endAdornment}
          </div>
        )}
      </div>
      
      {renderHelperText()}
      
      {/* スタイル */}
      <style jsx>{`
        .form-group {
          margin-bottom: var(--spacing-md);
        }
        
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-adornment {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          z-index: 1;
        }
        
        .start-adornment {
          left: var(--spacing-sm);
        }
        
        .end-adornment {
          right: var(--spacing-sm);
        }
        
        input.has-start-adornment {
          padding-left: calc(24px + var(--spacing-sm));
        }
        
        input.has-end-adornment {
          padding-right: calc(24px + var(--spacing-sm));
        }
        
        .form-control-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--font-size-sm);
        }
        
        .form-control-lg {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-lg);
        }
        
        .form-control.focused {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 0.2rem rgba(156, 39, 176, 0.25);
        }
        
        .required::after {
          content: "*";
          margin-left: 4px;
          color: var(--error-color);
        }
        
        .input-helper-text {
          display: flex;
          justify-content: space-between;
          margin-top: var(--spacing-xs);
        }
      `}</style>
    </div>
  );
};

export default Input;