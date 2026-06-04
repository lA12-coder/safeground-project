export default function DirectoryPage() {
  const providers = [
    {
      id: 1,
      name: 'Dr. Abeba Solomon',
      specialization: 'Mental Health Counselor',
      location: 'Addis Ababa',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Counselor Yohannes Bekele',
      specialization: 'Life Coach',
      location: 'Dire Dawa',
      rating: 4.6,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-primary mb-8">Healthcare Directory</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <div key={provider.id} className="bg-card rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{provider.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{provider.specialization}</p>
            <p className="text-sm text-gray-600 mb-4">📍 {provider.location}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-yellow-500">★ {provider.rating}</span>
              <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-darker transition-colors">
                Book Consultation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
