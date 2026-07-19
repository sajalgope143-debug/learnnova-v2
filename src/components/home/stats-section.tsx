const stats = [
  { value: "50,000+", label: "Students enrolled" },
  { value: "1,200+", label: "Courses available" },
  { value: "300+", label: "Expert instructors" },
  { value: "4.8/5", label: "Average rating" },
];

export function StatsSection() {
  return (
    <section className="container-app py-16">
      <div className="grid grid-cols-2 gap-6 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:grid-cols-4 sm:p-12">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-display text-3xl font-bold sm:text-4xl">{stat.value}</div>
            <div className="mt-1 text-sm text-brand-100">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
