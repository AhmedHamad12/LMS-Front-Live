import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Printer, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <>
            {/* Pre-Footer CTA Section */}
            <motion.section 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="px-4 py-16 bg-slate-900/50"
            >
                <div className="mx-auto max-w-5xl text-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">هل أنت مؤسسة تعليمية أو مدرس؟</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto mb-8">
                        هل ترغب في الحصول على منصة تعليمية خاصة بك بنفس القوة والتصميم؟ تواصل معنا لنبني لك مستقبلك الرقمي.
                    </p>
                    <a 
                        href="tel:01094870104"
                        className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-bold text-black shadow-lg shadow-white/20 transition-all duration-300 hover:-translate-y-1 hover:bg-opacity-90"
                    >
                        تواصل معنا الآن
                    </a>
                </div>
            </motion.section>

            {/* Main Footer */}
            <footer className="bg-black/30 px-8 pt-16 pb-8 text-right">
                <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: Brand */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-3xl font-black text-white mb-4" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.6)" }}>
                            المحاضرة.
                        </h3>
                        <p className="text-slate-400 mb-6">
                            منصة تعليمية تضع المستقبل بين يديك، باستخدام أحدث التقنيات والذكاء الاصطناعي.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Linkedin size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-4">روابط سريعة</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">الرئيسية</Link></li>
                            <li><Link to="/courses" className="text-slate-400 hover:text-cyan-400 transition-colors">الكورسات</Link></li>
                            <li><Link to="/teacher-signup" className="text-slate-400 hover:text-cyan-400 transition-colors">انضم كمدرس</Link></li>
                            <li><Link to="/student-signup" className="text-slate-400 hover:text-cyan-400 transition-colors">حساب طالب جديد</Link></li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-4">تواصل معنا</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-400">
                                <Phone size={16} className="text-cyan-400"/>
                                <a href="tel:01094870104" className="hover:text-cyan-400 transition-colors">01094870104</a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Mail size={16} className="text-cyan-400"/>
                                <a href="mailto:contact@elmohdra.info" className="hover:text-cyan-400 transition-colors">contact@elmohdra.info</a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Mail size={16} className="text-cyan-400"/>
                                <a href="mailto:admin@elmohdra.info" className="hover:text-cyan-400 transition-colors">admin@elmohdra.info</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Business Info */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-4">معلومات العمل</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-400">
                                <Printer size={16} className="text-cyan-400"/>
                                <span>تم تسجيل منصة المحاضرة ضريبيا </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Sub-Footer */}
                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} منصة المحاضرة. كل الحقوق محفوظة.</p>
                </div>
            </footer>
        </>
    );
};
export default Footer;