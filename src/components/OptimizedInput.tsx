import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface OptimizedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

interface OptimizedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

// Memoized Input component to prevent unnecessary re-renders
export const OptimizedInput = memo(({ value, onChange, ...props }: OptimizedInputProps) => {
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

OptimizedInput.displayName = "OptimizedInput";

// Memoized Textarea component to prevent unnecessary re-renders
export const OptimizedTextarea = memo(({ value, onChange, ...props }: OptimizedTextareaProps) => {
  return (
    <Textarea
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

OptimizedTextarea.displayName = "OptimizedTextarea";
