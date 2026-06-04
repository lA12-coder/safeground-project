export default function SpiritualPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-primary mb-8">Spiritual Connection</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Faith Resources */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Faith Resources</h2>
          <p className="text-gray-600 mb-4">
            Connect with spiritual organizations and faith leaders in your community.
          </p>
          <button className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors">
            Browse Resources
          </button>
        </div>

        {/* Spiritual Companion */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Inspiration</h2>
          <p className="text-gray-600 mb-4">
            &quot;Believe in yourself and all that you are.&quot;
          </p>
          <button className="px-6 py-2 bg-success text-white rounded-lg font-semibold hover:bg-green-800 transition-colors">
            Get New Affirmation
          </button>
        </div>

        {/* Meditation */}
        <div className="bg-card rounded-lg shadow-sm p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guided Practices</h2>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <p className="font-semibold text-gray-900">Morning Meditation</p>
              <p className="text-sm text-gray-600">10 minutes</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <p className="font-semibold text-gray-900">Evening Reflection</p>
              <p className="text-sm text-gray-600">15 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
