export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-primary mb-8">Welcome to SafeGround</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Streak Card Placeholder */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Streak</h2>
          <div className="text-4xl font-bold text-brand-primary mb-2">7 Days</div>
          <p className="text-gray-600">Keep it going!</p>
        </div>

        {/* Mood Tracker Placeholder */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Mood</h2>
          <div className="flex gap-4">
            {['😢', '😐', '🙂', '😊', '😄'].map((emoji) => (
              <button
                key={emoji}
                className="text-3xl hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg shadow-sm p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Your activity will appear here</p>
        </div>
      </div>
    </div>
  );
}
