import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { FavoritesProvider } from './contexts/FavoritesProvider';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header/Header'
import Footer from './components/Layout/Footer'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import FavoritesPage from './pages/FavoritesPage'
import SearchResultsPage from './pages/SearchResultsPage'
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import HeroManagement from './admin/pages/HeroManagement'
import CategoriesManagement from './admin/pages/CategoriesManagement'
import ProductsManagement from './admin/pages/ProductsManagement'
import OrdersManagement from './admin/pages/OrdersManagement'
import GlobalLoader from './components/Common/GlobalLoader'
import ScrollToTop from './components/Router/ScrollToTop'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth();
  
  // Show global loader while auth state is being determined
  if (loading) {
    return <GlobalLoader />;
  }
  
  return (
    <LanguageProvider user={user}>
      <FavoritesProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              user?.role === 'admin' || user?.role === 'superadmin' ? (
                <AdminLayout />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access the admin panel.</p>
                </div>
              )
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="hero" element={<HeroManagement />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
            </Route>

            {/* Public Routes */}
            <Route path="/*" element={
              <div className="App">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
      </FavoritesProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
