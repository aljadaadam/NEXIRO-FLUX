import React from 'react';
import { Layers, Activity, CheckCircle2, Package } from 'lucide-react';

const cardStyle = {
  backgroundColor: 'var(--card-bg)',
  borderColor: 'var(--border-color)',
};

const innerIconWrapStyle = {
  backgroundColor: 'var(--page-bg)',
  border: '1px solid var(--border-color)',
};

const SourceStats = ({ stats, t }) => {
  const items = [
    {
      key: 'totalSources',
      label: t.totalSources,
      value: stats.totalSources,
      Icon: Layers,
      iconColor: '#6366F1',
    },
    {
      key: 'activeSources',
      label: t.activeSources,
      value: stats.activeSources,
      Icon: Activity,
      iconColor: '#86EFAC',
    },
    {
      key: 'connectedSources',
      label: t.connectedSources,
      value: stats.connectedSources,
      Icon: CheckCircle2,
      iconColor: '#86EFAC',
    },
    {
      key: 'totalProducts',
      label: t.totalProducts,
      value: stats.totalProducts,
      Icon: Package,
      iconColor: '#FDE68A',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ key, label, value, Icon, iconColor }) => (
        <div key={key} className="rounded-2xl border-2 p-5 shadow-lg" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {value}
              </div>
            </div>
            <div className="p-3 rounded-xl" style={innerIconWrapStyle}>
              <Icon size={22} style={{ color: iconColor }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourceStats;
