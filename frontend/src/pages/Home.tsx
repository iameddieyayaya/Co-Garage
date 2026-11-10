import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Home: React.FC = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (pathname === '/' && (hash === '#features' || hash === '#how-it-works')) {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [pathname, hash]);

    return (
        <div className="font-sans text-gray-100 bg-slate-900">
          {/* Hero */}
          <section className="relative h-screen flex items-center justify-center text-center bg-black">
            <img
              src="/hero.webp"
              alt="Garage interior"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="relative z-10 px-4">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
                Own Your Garage Experience
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 drop-shadow">
              Book garage bays and pro-grade tools on demand.
              </p>
	              <Link
	                to="/owners/signup"
	                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-sm"
	              >
	                Get Started
	              </Link>
            </div>
          </section>
    
          {/* Features */}
          <section id="features" className="max-w-7xl mx-auto px-4 py-24 scroll-mt-24">
            <h3 className="text-4xl font-bold text-center text-blue-500 mb-16">Why CoGarage?</h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                <img
                  src="/work-in-bay.jpg"
                  alt="Lift bay"
                  className="rounded-lg mb-4 h-56 w-full object-cover"
                />
                <h4 className="text-2xl font-bold mb-2 text-blue-500">Flexible Bay Booking</h4>
                <p className="text-gray-300">Request a half-day or full-day bay rental for your next project.</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                <img
                  src="/tools.jpg"
                  alt="Tools"
                  className="rounded-lg mb-4 h-56 w-full object-cover"
                />
                <h4 className="text-2xl font-bold mb-2 text-blue-500">Rent Pro Tools</h4>
                <p className="text-gray-300">Access specialized tools without breaking the bank. Only pay for what you use.</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                <img
                  src="/happy-lady.jpg"
                  alt="Safety"
                  className="rounded-lg mb-4 h-56 w-full object-cover"
                />
                <h4 className="text-2xl font-bold mb-2 text-blue-500">Safe & Secure</h4>
                <p className="text-gray-300">Request a booking online, then pay through Stripe after the shop confirms.</p>
              </div>
            </div>
          </section>
    
          {/* How it Works */}
          <section id="how-it-works" className="bg-slate-900 py-24 scroll-mt-24">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h3 className="text-4xl font-bold text-blue-500 mb-12">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-10">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                  <img
                    src="/autoshop.jpg"
                    alt="Browse bays"
                    className="rounded-lg mb-4 h-40 w-full object-cover"
                  />
                  <h4 className="text-xl font-bold mb-2 text-blue-500">1. Browse Bays & Tools</h4>
                  <p className="text-gray-300">Search for bays and tools near you with ease.</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                  <img
                    src="/work2.jpg"
                    alt="Pay online"
                    className="rounded-lg mb-4 h-40 w-full object-cover"
                  />
                  <h4 className="text-xl font-bold mb-2 text-blue-500">2. Request & Pay</h4>
                  <p className="text-gray-300">Send a booking request, then pay using the link provided after shop confirmation.</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-blue-500 transition transform hover:-translate-y-2">
                  <img
                    src="/work.jpg"
                    alt="Work on car"
                    className="rounded-lg mb-4 h-40 w-full object-cover"
                  />
                  <h4 className="text-xl font-bold mb-2 text-blue-500">3. Show Up & Work</h4>
                  <p className="text-gray-300">Arrive at your bay and start working. Tools and bays are ready to go.</p>
                </div>
              </div>
            </div>
          </section>
    
          {/* CTA */}
          <section id="signup" className="py-20 text-center">
            <h3 className="text-4xl font-bold mb-6 text-blue-500">Ready to Garage?</h3>
	            <Link
	              to="/owners/signup"
	              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-500 transition shadow-sm"
	            >
	              Sign Up Now
	            </Link>
          </section>
        </div>
      );
    };
    
    

export default Home
