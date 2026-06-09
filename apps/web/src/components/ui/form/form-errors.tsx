interface FormErrorsProps {
  errors: string[];
}

export function FormErrors({ errors }: FormErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-error-bg border border-error rounded-lg px-3 py-2.5 text-sm text-error">
      <ul className="flex flex-col gap-1 list-disc pl-4">
        {errors.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
