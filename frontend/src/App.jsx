import React from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header/Header'
import HeroSlider from './components/Hero/HeroSlider'
import CategoriesSection from './components/Categories/CategoriesSection'
import FeaturedProducts from './components/Products/FeaturedProducts'
import TestimonialsSection from './components/Testimonials/TestimonialsSection'
import Footer from './components/Layout/Footer'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Header />
        <main>
          <HeroSlider />
          <CategoriesSection />
          <FeaturedProducts />
          <TestimonialsSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}

export default App
