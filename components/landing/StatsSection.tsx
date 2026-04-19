'use client';

const stats = [
  {
    value: '73%',
    label: 'of international students apply to companies with no H-1B history',
    color: 'text-red-400',
  },
  {
    value: '2,400+',
    label: 'companies actively sponsored H-1B visas in 2024',
    color: 'text-emerald-400',
  },
  {
    value: '6 months',
    label: 'average time wasted on visa-incompatible applications',
    color: 'text-amber-400',
  },
  {
    value: '3×',
    label: 'higher interview rate with visa-aware, targeted applications',
    color: 'text-blue-400',
  },
];

export default function StatsSection() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 bg-dark-700/20" />

      <div className="relative z-10 container-max">
        <div className="glass-card rounded-3xl p-10 md:p-14 border border-white/[0.06] relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] glow-orb-blue opacity-15 -translate-y-1/2" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                The Numbers Tell the Story
              </h2>
              <p className="text-slate-400">
                Why visa-aware navigation isn't a nice-to-have — it's essential.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.value} className="text-center">
                  <div className={`text-4xl sm:text-5xl font-black mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
