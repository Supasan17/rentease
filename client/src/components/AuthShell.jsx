/**
 * Auth Shell Component
 *
 * Two-panel frame for the login and sign-up pages: a brand panel with the
 * main benefits next to the form. The brand panel is hidden on small screens.
 */

const BENEFITS = [
  'Find tools, appliances and party gear near you',
  'See the full price before you book',
  'Earn from the things you already own',
];

function AuthShell({ children }) {
  return (
    <section className="card mx-auto grid max-w-4xl animate-rise overflow-hidden lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-800 to-teal-950 p-10 text-white lg:flex">
        <p className="text-xl font-bold">RentEase</p>
        <div>
          <p className="text-3xl font-bold leading-tight tracking-tight">Why buy it when you can borrow it?</p>
          <ul className="mt-6 space-y-3 text-sm text-emerald-50">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span aria-hidden="true" className="font-bold text-emerald-300">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-6 sm:p-10">{children}</div>
    </section>
  );
}

export default AuthShell;
