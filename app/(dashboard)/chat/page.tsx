export default function ChatPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-screen md:h-auto flex flex-col">
      <h1 className="text-3xl font-bold text-brand-primary mb-8">Anonymous Support Chat</h1>

      <div className="flex-1 bg-card rounded-lg shadow-sm flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto border-b border-gray-200">
          <div className="text-center text-gray-500">
            <p>Welcome to SafeGround&apos;s anonymous chat</p>
            <p className="text-sm mt-2">Your privacy is protected. You are known as an anonymous alias.</p>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-6 space-y-4">
          <textarea
            placeholder="Type your message here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
            rows={3}
          />
          <button className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darker transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
