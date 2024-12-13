/** @format */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUsers, faBars, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Dashboard", icon: faChartLine },
    { path: "/equipes", label: "Équipes", icon: faUsers },
    { path: "/informations", label: "Informations", icon: faUser },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 transform -translate-x-1/2 top-4 z-50 transition-all duration-300 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] md:w-[calc(100%-8rem)] lg:w-[calc(100%-16rem)] xl:w-[calc(100%-32rem)]`}
    >
      <div className={`w-full h-full rounded-2xl overflow-hidden border border-white/10 ${
        scrolled ? 'bg-[#1f1f1f]/95 backdrop-blur-sm' : 'bg-[#1f1f1f]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-center">
          <div className="flex items-center justify-between w-full">
            {/* Logo avec animation */}
            <div className="flex-shrink-0 transform hover:scale-110 transition-all duration-300">
              <Link to="/" className="flex items-center cursor-pointer">
                <img
                  src="/voltaica.jpeg"
                  alt="Voiltaica Logo"
                  className="h-12 w-auto rounded-full shadow-xl hover:shadow-white/30 transition-all duration-300"
                />
              </Link>
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-300 text-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
              </button>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group inline-flex items-center px-6 py-2.5 text-base font-medium rounded-xl transition-all duration-300 cursor-pointer
                    ${
                      location.pathname === link.path
                        ? "text-white bg-white/10 shadow-lg scale-105"
                        : "text-white hover:bg-white/10 hover:scale-105"
                    }`}
                >
                  <span className="mr-3 transform group-hover:rotate-12 transition-transform duration-300 text-2xl">
                    <FontAwesomeIcon icon={link.icon} />
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links - Mobile */}
          <div
            className={`md:hidden absolute top-[70px] left-0 right-0 bg-[#1f1f1f] transition-all duration-300 ${
              isOpen ? "max-h-[500px] opacity-100 border-t border-white/10" : "max-h-0 opacity-0"
            } overflow-hidden rounded-b-2xl`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-4 text-base font-medium transition-all duration-300 cursor-pointer ${
                  location.pathname === link.path
                    ? "text-white bg-white/10"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span className="mr-3 text-2xl">
                  <FontAwesomeIcon icon={link.icon} />
                </span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
