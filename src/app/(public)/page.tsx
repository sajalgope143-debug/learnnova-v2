import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { CategoriesSection } from "@/components/home/categories-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { InstructorSection, FinalCtaSection } from "@/components/home/cta-sections";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCourses />
      <CategoriesSection />
      <StatsSection />
      <TestimonialsSection />
      <InstructorSection />
      <FinalCtaSection />
    </>
  );
}
