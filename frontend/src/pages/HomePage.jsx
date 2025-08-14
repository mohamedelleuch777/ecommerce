import React from 'react'
import HeroSlider from '../components/Hero/HeroSlider'
import CategoriesSection from '../components/Categories/CategoriesSection'
import FeaturedProducts from '../components/Products/FeaturedProducts'
import TestimonialsSection from '../components/Testimonials/TestimonialsSection'
import usePageTitle from '../hooks/usePageTitle'

const HomePage = () => {
  usePageTitle('homePageTitle');

  return (
    <>
      <HeroSlider />
      <CategoriesSection />
      <FeaturedProducts />
      <TestimonialsSection />
    </>
  )
}

export default HomePage