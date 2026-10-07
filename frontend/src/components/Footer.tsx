import { GlobeIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-border bg-gray-50">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-6 py-10 text-sm sm:grid-cols-3 lg:px-10">
        <div>
          <h4 className="mb-3 font-semibold">Support</h4>
          <ul className="space-y-2 text-gray-text">
            <li>Help Center</li>
            <li>AirCover</li>
            <li>Anti-discrimination</li>
            <li>Disability support</li>
            <li>Cancellation options</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Hosting</h4>
          <ul className="space-y-2 text-gray-text">
            <li>Airbnb your home</li>
            <li>AirCover for Hosts</li>
            <li>Hosting resources</li>
            <li>Community forum</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Airbnb</h4>
          <ul className="space-y-2 text-gray-text">
            <li>Newsroom</li>
            <li>New features</li>
            <li>Careers</li>
            <li>Investors</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-border">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm sm:flex-row lg:px-10">
          <p className="text-gray-text">
            © {new Date().getFullYear()} Airbnb Clone · Built for the SDE Fullstack
            Assignment · Terms · Privacy
          </p>
          <div className="flex items-center gap-4 font-medium">
            <span className="flex items-center gap-2">
              <GlobeIcon /> English (US)
            </span>
            <span>$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
