"use client";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className="mb-6">You do not have permission to access this page.</p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
}
