interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

export function FormField({ id, label, hint, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-form-label">
        {label}
      </label>
      {hint && <span className="type-hint -mt-0.5">{hint}</span>}
      <input
        id={id}
        className="bg-elevated border border-stroke rounded-lg px-3 py-2.5 text-sm text-ink outline-none w-full transition-colors duration-150 focus:border-accent"
        {...inputProps}
      />
    </div>
  );
}
