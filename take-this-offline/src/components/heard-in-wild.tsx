interface HeardInTheWildProps {
  citation: string | null
  sourceUrl: string | null
}

export function HeardInTheWild({ citation, sourceUrl }: HeardInTheWildProps) {
  if (!citation && !sourceUrl) return null

  let domain: string | null = null
  if (sourceUrl) {
    try {
      domain = new URL(sourceUrl).hostname.replace(/^www\./, '')
    } catch {
      domain = 'Read more'
    }
  }

  return (
    <section className="space-y-2 border-l-4 border-muted pl-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Heard in the Wild
      </h3>
      {citation && (
        <blockquote className="italic text-foreground/80">{citation}</blockquote>
      )}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          {domain ?? 'Read more'}
        </a>
      )}
    </section>
  )
}
