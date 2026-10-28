import { useId, type ReactElement, cloneElement } from 'react';
import { cn } from '@/core/utils/cn';

interface FormFieldProps {
  label: string;
  error?: string | null;
  className?: string;
  /** 单个表单控件，会自动注入 id / aria-invalid / aria-describedby。 */
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}

/** 表单字段：label + 控件 + 错误提示，统一无障碍属性。 */
function FormField({ label, error, className, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
