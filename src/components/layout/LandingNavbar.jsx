import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import logo from '../../assets/angrologo.png';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isLoggedIn } = useData();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Características', href: '#features' },
        { name: 'Cómo Funciona', href: '#process' },
        { name: 'Testimonios', href: '#testimonials' },
        { name: 'Contacto', href: '#contact' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="AgroSync" className="h-24 w-auto" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-green-600 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        to={isLoggedIn ? "/dashboard" : "/login"}
                        className={`px-5 py-2 rounded-full font-medium transition-all ${isScrolled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-white text-green-700 hover:bg-gray-100'
                            }`}
                    >
                        {isLoggedIn ? 'Ir al Dashboard' : 'Iniciar Sesión'}
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className={isScrolled ? 'text-gray-800' : 'text-white'} /> : <Menu className={isScrolled ? 'text-gray-800' : 'text-white'} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-700 font-medium hover:text-green-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                to={isLoggedIn ? "/dashboard" : "/login"}
                                className="block w-full text-center px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {isLoggedIn ? 'Ir al Dashboard' : 'Iniciar Sesión'}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default LandingNavbar;
