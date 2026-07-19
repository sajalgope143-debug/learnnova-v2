import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about LearnSphere's mission to make quality education accessible to everyone.",
};

export default function AboutPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">About LearnSphere</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>
          LearnSphere was built on a simple idea: quality education shouldn&apos;t be
          locked behind expensive tuition or limited to those who speak a
          single language. We connect motivated learners with expert
          instructors through practical, project-based courses — in both
          English and Bengali.
        </p>
        <p>
          Since launching, we&apos;ve helped thousands of students build
          real skills in web development, data science, design, and
          business — many of whom have gone on to land jobs, freelance
          gigs, or start their own ventures.
        </p>
        <h2>Our Mission</h2>
        <p>
          To make practical, career-relevant education affordable and
          accessible, regardless of where you live or what language you
          speak.
        </p>
        <h2>What Makes Us Different</h2>
        <ul>
          <li>Courses taught by working professionals, not just academics</li>
          <li>Full bilingual support — English and Bengali</li>
          <li>A referral program that rewards our community for growing it</li>
          <li>Lifetime access to every course you purchase</li>
        </ul>
      </div>
    </div>
  );
}
