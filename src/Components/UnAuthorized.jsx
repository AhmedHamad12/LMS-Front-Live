import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/10 p-6">
            <ShieldX className="h-16 w-16 text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <p className="text-9xl font-bold text-gray-200 tracking-tight">
            401
          </p>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            You don't have permission to access this resource. Please check your
            credentials or contact an administrator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-600 rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Home className="h-5 w-5 mr-2" />
            Home Page
          </button>
        </div>

      </div>
    </div>
  );
}
