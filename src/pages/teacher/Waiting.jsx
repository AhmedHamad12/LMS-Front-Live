import { Coffee } from "lucide-react"

function Waiting() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-500/10 p-6">
            <Coffee className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        {/* Error Code */}
        <div>
          <p className="text-5xl font-bold text-gray-200 tracking-tight">
            ...Waiting
          </p>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <p className="text-2xl font-bold text-white">
            Waiting for email activation
          </p>
        </div>

        {/* Additional Help Text */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team {" "}
            <p className="text-blue-400 hover:text-blue-300 transition-colors mt-2">
              01094870104
            </p>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Waiting
