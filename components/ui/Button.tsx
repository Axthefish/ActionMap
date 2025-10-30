import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95';
    
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg',
      outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10',
      ghost: 'bg-transparent hover:bg-primary/10 text-foreground',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2',
    };
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };

