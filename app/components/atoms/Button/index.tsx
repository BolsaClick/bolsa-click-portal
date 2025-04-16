import React from 'react'

type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  className,
  type = 'button',
  disabled,
  ...rest
}) => {
  const baseStyles = 'px-5 py-3 font-medium rounded-lg transition duration-200'

  const variantStyles =
    variant === 'primary'
      ? 'bg-bolsa-black hover:bg-opacity-90 text-bolsa-white'
      : variant === 'secondary'
        ? 'bg-bolsa-secondary text-bolsa-primary hover:bg-opacity-90'
        : variant === 'tertiary'
          ? 'bg-bolsa-gray-light hover:bg-opacity-90 text-bolsa-black'
          : ''

  return (
    <button
      disabled={disabled}
      type={type}
      className={`${baseStyles} ${variantStyles} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
