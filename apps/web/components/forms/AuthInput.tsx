import { InputHTMLAttributes, forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, register, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={props.id || props.name}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        <div className="relative">
          <input
            {...props}
            {...register}
            ref={ref}
            className={cn(
              'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400',
              error &&
                'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500',
              className
            )}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
