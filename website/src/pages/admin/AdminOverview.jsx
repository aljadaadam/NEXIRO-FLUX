import { 
  Users, ShoppingCart, Layers, DollarSign, TrendingUp, TrendingDown,
  ArrowUpRight, Eye, Clock, CreditCard, Star, Activity
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Mock stats data
const stats = [
  { id: 1, labelAr: 'إجمالي المستخدمين', labelEn: 'Total Users', value: '2,847', change: '+12.5%', up: true, icon: Users, color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-500/10' },
  { id: 2, labelAr: 'القوالب المباعة', labelEn: 'Templates Sold', value: '1,234', change: '+8.2%', up: true, icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10' },
  { id: 3, labelAr: 'الإيرادات', labelEn: 'Revenue', value: '$48,250', change: '+23.1%', up: true, icon: DollarSign, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10' },
  { id: 4, labelAr: 'القوالب النشطة', labelEn: 'Active Templates', value: '7', change: '+1', up: true, icon: Layers, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10' },
];

// Mock recent sales
const recentSales = [
  { id: 1, user: 'أحمد المالكي', email: 'ahmed@mail.com', template: 'Digital Services Store', plan: 'Yearly', amount: '$349', date: '2026-02-14', avatar: 'A' },
  { id: 2, user: 'سارة الحربي', email: 'sarah@mail.com', template: 'Digital Services Store', plan: 'Monthly', amount: '$39', date: '2026-02-13', avatar: 'S' },
  { id: 3, user: 'محمد العتيبي', email: 'mohammed@mail.com', template: 'Digital Services Store', plan: 'Lifetime', amount: '$899', date: '2026-02-12', avatar: 'M' },
  { id: 4, user: 'نورة القحطاني', email: 'noura@mail.com', template: 'Digital Services Store', plan: 'Yearly', amount: '$349', date: '2026-02-11', avatar: 'N' },
  { id: 5, user: 'خالد الشمري', email: 'khaled@mail.com', template: 'Digital Services Store', plan: 'Monthly', amount: '$39', date: '2026-02-10', avatar: 'K' },
];

// Mock activity
const recentActivity = [
  { id: 1, textAr: 'أحمد المالكي اشترى قالب Digital Services Store', textEn: 'Ahmed Al-Malki purchased Digital Services Store', time: '5 min', icon: ShoppingCart, color: 'text-emerald-400' },
  { id: 2, textAr: 'مستخدم جديد: سارة الحربي', textEn: 'New user: Sarah Al-Harbi', time: '15 min', icon: Users, color: 'text-primary-400' },
  { id: 3, textAr: 'تقييم 5 نجوم من محمد العتيبي', textEn: '5-star review from Mohammed Al-Otaibi', time: '1h', icon: Star, color: 'text-yellow-400' },
  { id: 4, textAr: 'دفعة $349 تم تأكيدها', textEn: '$349 payment confirmed', time: '2h', icon: CreditCard, color: 'text-cyan-400' },
  { id: 5, textAr: 'زيارة الصفحة الرئيسية — 1,240 زائر اليوم', textEn: 'Homepage visit — 1,240 visitors today', time: '3h', icon: Eye, color: 'text-pink-400' },
];

export default function AdminOverview() {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          {isRTL ? 'نظرة عامة' : 'Overview'}
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          {isRTL ? 'مرحباً بك في لوحة التحكم الرئيسية' : 'Welcome to the main dashboard'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-[#111827] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{color: `var(--tw-gradient-from)`}} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-dark-400 text-sm mt-1">{isRTL ? stat.labelAr : stat.labelEn}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary-400" />
              {isRTL ? 'آخر المبيعات' : 'Recent Sales'}
            </h3>
            <span className="text-xs text-dark-500">{isRTL ? 'آخر 7 أيام' : 'Last 7 days'}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المستخدم' : 'User'}</th>
                  <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'القالب' : 'Template'}</th>
                  <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'الخطة' : 'Plan'}</th>
                  <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-start px-6 py-3 text-dark-500 font-medium text-xs">{isRTL ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-xs font-bold text-primary-400 border border-primary-500/20">
                          {sale.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium text-xs">{sale.user}</p>
                          <p className="text-dark-500 text-[11px]">{sale.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-dark-300 text-xs">{sale.template}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.plan === 'Lifetime' ? 'bg-amber-500/10 text-amber-400' :
                        sale.plan === 'Yearly' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-primary-500/10 text-primary-400'
                      }`}>{sale.plan}</span>
                    </td>
                    <td className="px-6 py-3 text-white font-medium text-xs">{sale.amount}</td>
                    <td className="px-6 py-3 text-dark-500 text-xs">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-[#111827] rounded-2xl border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
            </h3>
          </div>
          <div className="p-4 space-y-1">
            {recentActivity.map(act => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-300 text-xs leading-relaxed">{isRTL ? act.textAr : act.textEn}</p>
                    <p className="text-dark-600 text-[11px] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
          </h3>
          <div className="flex items-center gap-2">
            {['1W', '1M', '3M', '1Y'].map((period, i) => (
              <button key={period} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                i === 1 ? 'bg-primary-500/10 text-primary-400' : 'text-dark-500 hover:text-white'
              }`}>{period}</button>
            ))}
          </div>
        </div>
        {/* Simple bar chart */}
        <div className="flex items-end gap-2 h-40">
          {[35, 55, 45, 70, 60, 85, 75, 90, 65, 80, 95, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all hover:from-primary-500 hover:to-primary-300"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-dark-600">
                {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
