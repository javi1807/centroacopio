import React from 'react';
import { Tractor, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-400 font-bold text-2xl">
                            <Tractor className="h-8 w-8" />
                            <span>AgroSync</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Sistema profesional de gestión de acopio agrícola. Transformando la agricultura con tecnología inteligente y accesible.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Producto</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#features" className="hover:text-green-400 transition-colors">Características</a></li>
                            <li><a href="#pricing" className="hover:text-green-400 transition-colors">Precios</a></li>
                            <li><a href="#demo" className="hover:text-green-400 transition-colors">Demo</a></li>
                            <li><a href="#updates" className="hover:text-green-400 transition-colors">Actualizaciones</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Recursos</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-green-400 transition-colors">Documentación</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Tutoriales</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Soporte</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-green-400 transition-colors">Privacidad</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Términos</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Cookies</a></li>
                            <li><a href="#" className="hover:text-green-400 transition-colors">Seguridad</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">&copy; 2024 AgroSync. Todos los derechos reservados.</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Mapa del Sitio</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
