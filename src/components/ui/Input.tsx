"use client";

import { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const active = isFocused || hasValue;

  return (
    <div className="relative w-full mb-8 pt-4">
      <input
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-black/20 outline-none pb-2 text-brand-black transition-all duration-300 focus:border-black font-body text-sm"
      />
      <label
        className={`absolute left-0 pointer-events-none transition-all duration-300 font-body uppercase tracking-widest ${
          active ? "-top-2 text-[10px] text-brand-grey font-bold" : "top-4 text-xs text-brand-black/50"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

export function TextArea({ label, ...props }: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const active = isFocused || hasValue;

  return (
    <div className="relative w-full mb-8 pt-4">
      <textarea
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className="w-full bg-transparent border-b border-black/20 outline-none pb-2 text-brand-black transition-all duration-300 focus:border-black font-body text-sm resize-none min-h-[100px]"
      />
      <label
        className={`absolute left-0 pointer-events-none transition-all duration-300 font-body uppercase tracking-widest ${
          active ? "-top-2 text-[10px] text-brand-grey font-bold" : "top-4 text-xs text-brand-black/50"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
