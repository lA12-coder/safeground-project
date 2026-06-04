import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2 text-center">SafeGround</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">Sign In</h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
            <Link href="/guest" className="text-sm text-gray-600 hover:text-brand-primary">
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
