import Link from "next/link";

const features = [
  { icon: "📅", title: "Easy Booking", description: "Submit event bookings in 3 simple steps — event details, services, and contact info." },
  { icon: "⚡", title: "Live Availability Check", description: "Instantly check if your selected equipment is available for your date and time." },
  { icon: "📊", title: "Admin Dashboard", description: "Manage all bookings, confirm or cancel, and track client information in one place." },
  { icon: "🔔", title: "Double-Booking Prevention", description: "Smart conflict detection ensures no equipment is double-booked." },
];

const services = [
  { name: "LED Screen 4×3", desc: "High-brightness display panel", price: "From RM 300/day", icon: "🖥️" },
  { name: "Sound System Pro", desc: "Full PA with subwoofers & monitors", price: "From RM 250/day", icon: "🔊" },
  { name: "Lighting Kit", desc: "Moving heads & wash lights", price: "From RM 180/day", icon: "💡" },
  { name: "Full AV Package", desc: "Complete audio, video & lighting", price: "From RM 600/day", icon: "🎬" },
];

export default function Home() {
  return (
    <main>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">Professional AV Equipment<br />for Your Events</h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">Book LED screens, sound systems, and lighting for corporate events, weddings, concerts, and more.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg">Book Now</Link>
            <Link href="/dashboard" className="px-8 py-3.5 bg-blue-500/30 text-white font-semibold rounded-xl border border-white/30 hover:bg-blue-500/40 transition">Admin Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Use EventBook?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Our Services</h2>
          <p className="text-center text-gray-500 mb-10">Professional equipment for every event size</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div key={s.name} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-3">{s.desc}</p>
                <span className="text-sm font-medium text-blue-600">{s.price}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/booking" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
              Start Your Booking
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© 2026 EventBook · Professional AV Equipment Rental</p>
      </footer>
    </main>
  );
}
