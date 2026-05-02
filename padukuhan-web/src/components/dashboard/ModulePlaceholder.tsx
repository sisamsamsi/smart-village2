interface ModulePlaceholderProps {
  title: string
  description?: string
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-muted-foreground">{description}</p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          Modul ini akan diisi sesuai urutan prioritas di blueprint (Fase 2).
        </p>
      )}
    </div>
  )
}
