import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, PlayCircle, Users, Package, Scale, TrendingUp,
    ShieldCheck, Smartphone, Cloud, RefreshCw, Truck, ClipboardCheck,
    Warehouse, BarChart3, ChevronDown, Phone, Mail, Clock, Check, X
} from 'lucide-react';
import LandingNavbar from '../components/layout/LandingNavbar';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-green-900 to-green-800 text-white">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1740&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-700/50 border border-green-600 backdrop-blur-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium text-green-100">Sistema Profesional de Acopio</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                Transforma tu <span className="text-green-400">gestión agrícola</span> con tecnología inteligente
                            </h1>

                            <p className="text-lg text-green-100 max-w-xl leading-relaxed">
                                Sistema integral para el registro, control de calidad y almacenamiento de productos agrícolas.
                                Optimiza tu cadena de acopio con nuestra plataforma web profesional.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-400 transition-all shadow-lg shadow-green-900/20">
                                    Comenzar Ahora
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                                    <PlayCircle className="h-5 w-5" />
                                    Ver Demo
                                </a>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                                <div>
                                    <div className="text-3xl font-bold text-white">500+</div>
                                    <div className="text-sm text-green-200">Agricultores</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">50K+</div>
                                    <div className="text-sm text-green-200">Toneladas</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">95%</div>
                                    <div className="text-sm text-green-200">Satisfacción</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">24/7</div>
                                    <div className="text-sm text-green-200">Soporte</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <Users className="h-8 w-8 text-green-400 mb-2" />
                                        <div className="text-2xl font-bold">245</div>
                                        <div className="text-sm text-green-200">Agricultores Activos</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <Package className="h-8 w-8 text-blue-400 mb-2" />
                                        <div className="text-2xl font-bold">1,245</div>
                                        <div className="text-sm text-green-200">Productos Acopiados</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <Scale className="h-8 w-8 text-yellow-400 mb-2" />
                                        <div className="text-2xl font-bold">12.5T</div>
                                        <div className="text-sm text-green-200">Peso Total</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl">
                                        <TrendingUp className="h-8 w-8 text-purple-400 mb-2" />
                                        <div className="text-2xl font-bold">$45K</div>
                                        <div className="text-sm text-green-200">Ingresos Mes</div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-green-500/30 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-10 bg-gray-50 border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                            <span>Seguro y Confiable</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-6 w-6 text-green-600" />
                            <span>Totalmente Responsive</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cloud className="h-6 w-6 text-green-600" />
                            <span>100% en la Nube</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-6 w-6 text-green-600" />
                            <span>Actualizaciones Auto</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Características Principales</h2>
                        <p className="text-lg text-gray-600">Diseñado específicamente para las necesidades del acopio agrícola moderno, simplificando cada paso del proceso.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="h-6 w-6" />,
                                title: "Gestión de Agricultores",
                                desc: "Registro detallado con historial completo de entregas, datos de contacto y geolocalización de terrenos."
                            },
                            {
                                icon: <ClipboardCheck className="h-6 w-6" />,
                                title: "Control de Calidad",
                                desc: "Sistema riguroso de evaluación con parámetros personalizables de humedad, impurezas y calidad."
                            },
                            {
                                icon: <Warehouse className="h-6 w-6" />,
                                title: "Almacenamiento Inteligente",
                                desc: "Gestión optimizada de inventarios con control de ubicaciones, lotes y fechas de vencimiento."
                            },
                            {
                                icon: <BarChart3 className="h-6 w-6" />,
                                title: "Dashboard en Tiempo Real",
                                desc: "Métricas y reportes automatizados con visualizaciones interactivas para toma de decisiones."
                            },
                            {
                                icon: <Smartphone className="h-6 w-6" />,
                                title: "Acceso Multiplataforma",
                                desc: "Accede desde cualquier dispositivo: computadora, tablet o smartphone. Diseño 100% responsive."
                            },
                            {
                                icon: <ShieldCheck className="h-6 w-6" />,
                                title: "Seguridad y Backup",
                                desc: "Protección de datos empresarial con backups automáticos y sistema de recuperación ante desastres."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                {...fadeInUp}
                                className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group"
                            >
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Flujo de Trabajo Optimizado</h2>
                        <p className="text-gray-400 text-lg">Proceso simplificado y eficiente para la gestión de acopio</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>

                        {[
                            { icon: <Truck />, title: "Registro", desc: "Recepción y pesaje inicial" },
                            { icon: <ClipboardCheck />, title: "Calidad", desc: "Evaluación y análisis" },
                            { icon: <Warehouse />, title: "Almacén", desc: "Ubicación y control" },
                            { icon: <BarChart3 />, title: "Reportes", desc: "Análisis y pagos" }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-900 mb-6 relative z-10">
                                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-sm border-4 border-gray-900">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-gray-400">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planes a Medida</h2>
                        <p className="text-lg text-gray-600">Elige el plan que mejor se adapte a tus necesidades</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: "Básico",
                                price: "49",
                                features: ["Hasta 50 agricultores", "Gestión básica", "Reportes estándar"],
                                notIncluded: ["Control de calidad avanzado", "Soporte prioritario"],
                                recommended: false
                            },
                            {
                                name: "Profesional",
                                price: "99",
                                features: ["Hasta 200 agricultores", "Gestión completa", "Control de calidad avanzado", "Dashboard real-time", "Soporte prioritario"],
                                notIncluded: [],
                                recommended: true
                            },
                            {
                                name: "Empresarial",
                                price: "199",
                                features: ["Agricultores ilimitados", "Todas las funciones", "API personalizada", "Migración de datos", "Soporte 24/7"],
                                notIncluded: [],
                                recommended: false
                            }
                        ].map((plan, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden border ${plan.recommended ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50' : 'border-gray-100'}`}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                        MÁS POPULAR
                                    </div>
                                )}
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline mb-6">
                                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                        <span className="text-gray-500 ml-2">/mes</span>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                <Check className="h-5 w-5 text-green-500 shrink-0" />
                                                {feat}
                                            </li>
                                        ))}
                                        {plan.notIncluded.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                                <X className="h-5 w-5 shrink-0" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to="/login"
                                        className={`block w-full py-3 px-6 rounded-lg text-center font-medium transition-colors ${plan.recommended
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        Comenzar
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para transformar tu gestión de acopio?</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                        Comienza hoy mismo y lleva tu operación agrícola al siguiente nivel con nuestra plataforma profesional.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login" className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                            Comenzar Gratis
                        </Link>
                        <a href="#contact" className="px-8 py-4 bg-green-700 text-white rounded-xl font-bold text-lg hover:bg-green-800 transition-colors border border-green-500">
                            Agendar Demo
                        </a>
                    </div>
                    <p className="mt-6 text-sm text-green-200 flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Prueba de 14 días • Sin tarjeta requerida • Cancelación en cualquier momento
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Tienes preguntas?</h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Estamos aquí para ayudarte a transformar tu gestión de acopio agrícola. Contáctanos por cualquiera de estos medios.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Teléfono</h4>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Email</h4>
                                        <p className="text-gray-600">info@agrosync.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Horario</h4>
                                        <p className="text-gray-600">Lun - Vie: 8:00 - 18:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Tu nombre" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="tucorreo@ejemplo.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="¿En qué podemos ayudarte?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                    <textarea rows="4" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="Escribe tu mensaje aquí..."></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">
                                    Enviar Mensaje
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
