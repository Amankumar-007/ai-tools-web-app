export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <main className="mx-auto max-w-7xl animate-pulse px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-5 h-14 max-w-2xl rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-xl rounded bg-slate-100" />
        <div className="mt-12 h-14 max-w-2xl rounded-xl bg-white" />
        <div className="mt-7 flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-9 w-24 rounded-full bg-white" />)}</div>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-64 rounded-xl border border-slate-200 bg-white" />)}
        </div>
      </main>
    </div>
  );
}
