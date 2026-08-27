import React from "react";

const InputWithIcon = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  icon,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`px-3 flex items-center gap-2 w-full h-12 rounded-xl bg-primary border border-secondary/30 text-secondary placeholder:text-secondary/30 outline-none focus-within:border-accent/50 transition-colors ${className}`}
    >
      {icon}
      <input
        type="email"
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="flex-1 h-full w-full outline-none border-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputWithIcon;
