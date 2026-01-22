'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

type InputGroupPosition = 'first' | 'middle' | 'last' | 'single';

interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  groupPosition?: InputGroupPosition;
  label?: string;
  error?: string;
}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ groupPosition = 'single', label, error, ...props }, ref) => {
    const baseClasses = 'appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm';

    const getClasses = () => {
      switch (groupPosition) {
        case 'first':
          return `${baseClasses} rounded-t-md rounded-b-none`;
        case 'middle':
          return `${baseClasses} rounded-none`;
        case 'last':
          return `${baseClasses} rounded-b-md rounded-t-none`;
        case 'single':
        default:
          return `${baseClasses} rounded-md`;
      }
    };

    return (
      <div>
        {label && (
          <label htmlFor={props.id} className="sr-only">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={getClasses()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;
