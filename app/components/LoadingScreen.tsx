"use client";

export function LoadingScreen({ message = "Loading…", className = "" }: { message?: string; className?: string }) {
  return (
    <div className={`flex min-h-screen items-center justify-center bg-white ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-earth-blue/20 border-t-earth-blue" />
        </div>
        <p className="text-sm font-medium text-tranquil-black/60">
          {message}
        </p>
      </div>
    </div>
  );
}
