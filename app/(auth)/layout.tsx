export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--auth-bg)] transition-colors duration-300">
      {/* Layer 0: Backdrop Ambient Light */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% -10%, var(--auth-card-border), transparent 60%)`,
          opacity: 0.6
        }}
      />

      {/* Layer 1: Scrim (Focus Layer) - optional overlay if tokens dictate */}
      <div className="absolute inset-0 bg-[var(--auth-scrim)] pointer-events-none backdrop-blur-[0px]" />

      {/* Content Container - Visual Center with slight offset */}
      <div className="relative z-10 w-full max-w-[420px] px-6 sm:px-0 -mt-[5vh]">
        {children}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-xs font-medium text-[var(--auth-muted)] opacity-60">
          © {new Date().getFullYear()} CoolCRM. Secure Login.
        </p>
      </div>
    </div>
  )
}
