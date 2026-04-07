import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { Products } from '@/pages/Products';
import { ProductDetail } from '@/pages/ProductDetail';
import { Gallery } from '@/pages/Gallery';
import { Testimonials } from '@/pages/Testimonials';
import { StaticPage } from '@/pages/StaticPage';
import { Contact } from '@/pages/Contact';
import { About } from '@/pages/About';

// Admin Pages
import { AdminLayout } from '@/pages/Admin/AdminLayout';
import { AdminLogin } from '@/pages/Admin/Login';
import { Dashboard } from '@/pages/Admin/Dashboard';
import { ProductsAdmin } from '@/pages/Admin/ProductsAdmin';
import { CategoriesAdmin } from '@/pages/Admin/CategoriesAdmin';
import { GalleryAdmin } from '@/pages/Admin/GalleryAdmin';
import { TestimonialsAdmin } from '@/pages/Admin/TestimonialsAdmin';
import { PagesAdmin } from '@/pages/Admin/PagesAdmin';
import { MessagesAdmin } from '@/pages/Admin/MessagesAdmin';
import { PartnersAdmin } from '@/pages/Admin/PartnersAdmin';
import { SettingsAdmin } from '@/pages/Admin/SettingsAdmin';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col public-site">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/product/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
        <Route path="/about-us" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact-us" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/:slug" element={<PublicLayout><StaticPage /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="testimonials" element={<TestimonialsAdmin />} />
          <Route path="pages" element={<PagesAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="partners" element={<PartnersAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}
