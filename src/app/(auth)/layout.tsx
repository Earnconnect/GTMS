export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 py-10"
      style={{ background: "linear-gradient(145deg, #EEF2F8 0%, #E0F9FC 60%, #EEF2F8 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-[-120px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #0284C7 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <div className="flex flex-col items-center mb-6 z-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
          style={{ background: "linear-gradient(135deg, #06B6D4, #0284C7)" }}
        >
          <span className="text-white font-extrabold text-2xl tracking-tight">G</span>
        </div>
        <h2 className="text-[20px] font-bold text-slate-800 tracking-tight">GTMS Network</h2>
        <p className="text-[12.5px] text-slate-400 mt-0.5">Global Merchant Trade &amp; Settlement</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/80 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[11.5px] text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} GTMS Network. All rights reserved.
        </p>
      </div>
    </div>
  );
}
