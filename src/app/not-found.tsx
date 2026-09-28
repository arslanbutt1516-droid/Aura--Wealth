import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060714] flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-8xl font-black gradient-text mb-4">404</h2>
        <h3 className="text-2xl font-bold text-white mb-3">Page Not Found</h3>
        <p className="text-slate-400 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
