const BoardLoading = (): JSX.Element => {
  return (
    <section className="cute-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-sand/60" />
          <div className="h-4 w-56 animate-pulse rounded-lg bg-sand/40" />
        </div>
        <div className="h-10 w-20 animate-pulse rounded-full bg-mint/60" />
      </div>
      <div className="space-y-2 overflow-hidden rounded-2xl border border-sand/70 p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-9 animate-pulse rounded-lg bg-sand/30" />
        ))}
      </div>
    </section>
  );
};

export default BoardLoading;
