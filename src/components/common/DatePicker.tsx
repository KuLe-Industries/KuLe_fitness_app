import { InputHTMLAttributes } from 'react';
import Input from './Input';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export default function DatePicker({ label, error, ...props }: DatePickerProps) {
  return <Input type="date" label={label} error={error} {...props} />;
}

