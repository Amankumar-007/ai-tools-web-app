export default function WorkflowLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <main className="mx-auto max-w-5xl animate-pulse px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-10 h-12 w-12 rounded-xl bg-slate-200" />
        <div className="mt-6 h-12 max-w-xl rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="h-48 rounded-xl border border-slate-200 bg-white" />
          <div className="h-48 rounded-xl border border-slate-200 bg-white" />
        </div>
        <div className="mt-16 space-y-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-52 rounded-xl border border-slate-200 bg-white" />)}
        </div>
      </main>
    </div>
  );
}
