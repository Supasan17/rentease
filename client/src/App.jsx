/**
 * App Root Component
 *
 * Temporary landing screen for the client setup. Routing and the real
 * pages are added on top of this component.
 */

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-emerald-600">RentEase</h1>
      <p className="mt-3 max-w-md text-gray-600">
        Rent household items from people near you, or earn from the things you
        already own.
      </p>
    </main>
  );
}

export default App;
