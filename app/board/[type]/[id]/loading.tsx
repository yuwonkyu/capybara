const PostLoading = (): JSX.Element => {
  return (
    <div className="space-y-4">
      <section className="cute-card">
        <div className="h-5 w-16 animate-pulse rounded-full bg-mint/50" />
        <div className="mt-3 h-7 w-2/3 animate-pulse rounded-lg bg-sand/60" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded-lg bg-sand/40" />
        <div className="mt-5 space-y-2">
          <div className="h-4 w-full animate-pulse rounded-lg bg-sand/30" />
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-sand/30" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-sand/30" />
        </div>
      </section>
      <section className="cute-card">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-sand/60" />
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-sand/20" />
      </section>
    </div>
  );
};

export default PostLoading;
