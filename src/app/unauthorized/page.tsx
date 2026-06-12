import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl font-bold text-red-500">403</div>
        <h1 className="text-2xl font-semibold text-gray-900">Access Denied</h1>
        <p className="text-gray-500">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
