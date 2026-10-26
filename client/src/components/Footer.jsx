/**
 * Footer Component
 *
 * Site footer shown at the bottom of every page.
 */

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} RentEase. Rent household items from people near you.
      </div>
    </footer>
  );
}

export default Footer;
