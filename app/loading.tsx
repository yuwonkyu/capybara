const RootLoading = (): JSX.Element => {
  return (
    <div className="space-y-4">
      <div className="cute-card">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-sand/60" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-lg bg-sand/40" />
        <div className="mt-2 h-4 w-3/4 max-w-lg animate-pulse rounded-lg bg-sand/40" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="cute-card h-24 animate-pulse bg-sand/20" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="cute-card h-48 animate-pulse bg-sand/20" />
        <div className="cute-card h-48 animate-pulse bg-sand/20" />
      </div>
    </div>
  );
};

export default RootLoading;
