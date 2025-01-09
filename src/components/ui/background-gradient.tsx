export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
      <div className="absolute -top-[40rem] left-1/2 -translate-x-1/2 flex">
        <div className="h-[80rem] w-[80rem] rounded-full bg-gradient-to-b from-blue-600/20 to-transparent blur-3xl" />
        <div className="h-[80rem] w-[80rem] -translate-x-1/3 rounded-full bg-gradient-to-b from-cyan-400/20 to-transparent blur-3xl" />
      </div>
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white"
        style={{
          maskImage: 'linear-gradient(to bottom, white, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
        }}
      />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:32px] [mask-image:linear-gradient(to_bottom,white,transparent,transparent,white)]" />
      </div>
    </div>
  );
}
