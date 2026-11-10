export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px]" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-9 w-56" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[104px]" />)}</div>
      <div className="skeleton mt-8 h-64" />
    </div>
  );
}
