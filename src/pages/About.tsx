import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Globe, Users, Target, Award, History, TrendingUp, Zap } from 'lucide-react';

export function About() {
  const stats = [
    { label: 'Years of Experience', value: '15+', icon: History },
    { label: 'Global Partners', value: '500+', icon: Users },
    { label: 'Countries Reached', value: '50+', icon: Globe },
    { label: 'Verified Products', value: '10k+', icon: ShieldCheck },
  ];

  const values = [
    {
      title: "Integrity First",
      description: "We maintain the highest standards of transparency and ethics in every international transaction.",
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Global Innovation",
      description: "Leveraging cutting-edge logistics technology to optimize supply chains across continents.",
      icon: Zap,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Client Centric",
      description: "Your growth is our priority. We tailor our trade solutions to meet your specific industrial needs.",
      icon: Target,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Quality Excellence",
      description: "Rigorous multi-stage inspection protocols ensuring only premium equipment reaches your doorstep.",
      icon: Award,
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-50 pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/5 rounded-l-[200px] -mr-32 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="section-label">Our Story</span>
              <h1 className="text-2xl sm:text-4xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Pioneering the Future of <span className="text-brand-primary">Global Trade.</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-xl leading-relaxed max-w-xl">
                Since 2005, we've been bridging the gap between manufacturers and markets, 
                ensuring seamless logistics and premium industrial supply chains worldwide.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1000" 
                  alt="Global Operations" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">150%</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Annual Growth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary mx-auto">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Our Mission</h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  To empower businesses worldwide by providing reliable, efficient, and transparent 
                  international trade services. We strive to be the most trusted link in the 
                  global industrial supply chain.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                {values.map((value, i) => (
                  <div key={i} className="space-y-4 text-center flex flex-col items-center">
                    <div className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center`}>
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm sm:text-xl font-bold text-slate-900">{value.title}</h3>
                    <p className="text-slate-400 text-[10px] sm:text-sm leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[40px] p-12 sm:p-20 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight !text-white italic">Our Vision</h2>
                <p className="text-slate-400 text-lg sm:text-xl leading-relaxed italic">
                  "To create a world where geographical boundaries are no longer a barrier to 
                  industrial excellence. We envision a future of borderless trade powered by 
                  trust and technology."
                </p>
                <div className="pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center font-bold">CEO</div>
                    <div>
                      <div className="font-bold">Alex Thompson</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest">Founder & CEO</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ready to Partner with Us?
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Join our network of verified global partners and take your business to the international stage.
          </p>
          <div className="flex justify-center">
            <Link to="/contact-us" className="btn-primary py-5 px-12 text-lg">
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
