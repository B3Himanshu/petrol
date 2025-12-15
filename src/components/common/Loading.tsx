interface LoadingProps {
  label?: string;
}

export const Loading = ({ label = "Loading..." }: LoadingProps) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
};


