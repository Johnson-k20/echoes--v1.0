interface SacredDividerProps {
  className?: string;
  horizontal?: boolean;
}

export function SacredDivider({ className = "", horizontal = true }: SacredDividerProps) {
  if (horizontal) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="divider-sacred" />
      </div>
    );
  }
  return (
    <div className={`mx-6 ${className}`}>
      <div className="divider-sacred-vertical h-full" />
    </div>
  );
}
