export default function LogPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-primary mb-8">Log Your Well-being</h1>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Activity Type
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary">
              <option>Select an activity...</option>
              <option>Mindfulness</option>
              <option>Physical Exercise</option>
              <option>Social Connection</option>
              <option>Creative Work</option>
              <option>Spiritual Practice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., 30"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mood Before
              </label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mood After
              </label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              rows={4}
              placeholder="How did you feel? Any observations?"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors"
          >
            Save Activity
          </button>
        </form>
      </div>
    </div>
  );
}
