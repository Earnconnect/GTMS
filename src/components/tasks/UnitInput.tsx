/* Renders the per-unit input content shown to a worker. */
export function UnitInput({ data }: { data: unknown }) {
  if (!data || typeof data !== "object") {
    return <p className="text-sm text-slate-400">No input for this unit.</p>;
  }
  const obj = data as Record<string, unknown>;

  return (
    <div className="space-y-3">
      {typeof obj.imageUrl === "string" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={obj.imageUrl}
          alt="unit input"
          className="max-h-80 rounded-lg border border-slate-200"
        />
      )}
      {typeof obj.text === "string" && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {obj.text}
        </p>
      )}
      {typeof obj.content === "string" && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {obj.content}
        </p>
      )}
      {typeof obj.url === "string" && (
        <a
          href={obj.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-600 hover:underline"
        >
          {obj.url}
        </a>
      )}
    </div>
  );
}
