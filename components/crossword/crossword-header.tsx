"use client";

interface CrosswordHeaderProps {
  title: string;
  author?: string;
}

export function CrosswordHeader({
  title,
  author,
}: CrosswordHeaderProps) {
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
      {author && (
        <p className="text-sm text-muted-foreground">By {author}</p>
      )}
    </div>
  );
}
