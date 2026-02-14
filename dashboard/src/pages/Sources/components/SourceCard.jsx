import React from 'react';
import { Globe, Pencil, Trash2, Wifi, RefreshCcw, BadgePercent } from 'lucide-react';

const SourceCard = ({
  source,
  dir,
  isRTL,
  t,
  testing,
  syncing,
  onEdit,
  onDelete,
  onTestConnection,
  onSync,
  onApplyProfit,
}) => {
  const isEnabled = source?.enabled !== false;
  const status = (source?.connectionStatus || 'unknown');
  const isConnected = isEnabled && status === 'connected';
  const isDisconnected = isEnabled && status === 'disconnected';

  const keyLast4 = typeof source?.apiKeyLast4 === 'string' ? source.apiKeyLast4.trim() : '';
  const keyRaw = typeof source?.apiKey === 'string' ? source.apiKey.trim() : '';
  const maskedKey = keyLast4 ? `••••${keyLast4}` : (keyRaw ? `••••${keyRaw.slice(-4)}` : '-');

  const badgeEnabledText = isEnabled ? t.active : t.inactive;
  const badgeEnabledStyle = isEnabled
    ? { backgroundColor: 'rgba(134,239,172,0.12)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.25)' }
    : { backgroundColor: 'rgba(160,160,165,0.12)', color: '#A0A0A5', border: '1px solid rgba(160,160,165,0.25)' };

  const badgeConnectionText = isConnected ? t.connected : (isDisconnected ? t.disconnected : t.unknown);
  const badgeConnectionStyle = isConnected
    ? { backgroundColor: 'rgba(134,239,172,0.12)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.25)' }
    : (isDisconnected
      ? { backgroundColor: 'rgba(252,165,165,0.12)', color: '#FCA5A5', border: '1px solid rgba(252,165,165,0.25)' }
      : { backgroundColor: 'rgba(253,230,138,0.10)', color: '#FDE68A', border: '1px solid rgba(253,230,138,0.20)' });

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden shadow-lg"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Header */}
      <div className="p-5 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="p-2.5 rounded-xl"
              style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}
            >
              <Globe size={18} style={{ color: '#6366F1' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {source?.name}
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={badgeEnabledStyle}>
                  {badgeEnabledText}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={badgeConnectionStyle}>
                  {badgeConnectionText}
                </span>
              </div>
              {source?.description ? (
                <p className="text-sm mt-2 break-words" style={{ color: 'var(--text-secondary)' }}>
                  {source.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg transition-all duration-200 transform active:scale-[0.95]"
              style={{ backgroundColor: 'transparent' }}
              aria-label={t.edit}
              type="button"
            >
              <Pencil size={18} className="text-[#A0A0A5] hover:text-[#6366F1] transition-colors" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg transition-all duration-200 transform active:scale-[0.95]"
              style={{ backgroundColor: 'transparent' }}
              aria-label={t.delete}
              type="button"
            >
              <Trash2 size={18} className="text-[#FCA5A5] hover:text-[#EF4444] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.apiUrl}:</div>
            <div className="font-mono text-xs break-all" style={{ color: 'var(--text-primary)' }}>{source?.apiUrl || '-'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.username}:</div>
            <div style={{ color: 'var(--text-primary)' }}>{source?.username || '-'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.apiKey}:</div>
            <div className="font-mono" style={{ color: 'var(--text-primary)' }}>{maskedKey}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.profitMargin}:</div>
            <div className="font-bold" style={{ color: '#86EFAC' }}>{source?.profitPercentage || 0}%</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.products}:</div>
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{source?.productsCount || 0}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>{t.connectionStatus}:</div>
            <div className="font-bold" style={{ color: isConnected ? '#86EFAC' : (isDisconnected ? '#FCA5A5' : '#FDE68A') }}>
              {badgeConnectionText}
            </div>
            {isDisconnected && source?.lastConnectionError ? (
              <div className="text-xs mt-1 break-words" style={{ color: '#FCA5A5' }}>
                {source.lastConnectionError}
              </div>
            ) : null}
          </div>
        </div>

        {/* Balance/Currency */}
        <div className="pt-4 flex gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.credit}</div>
            <div className="text-lg font-bold" style={{ color: '#86EFAC' }}>
              ${source?.balance || '0'}
            </div>
          </div>
          <div className="flex-1 p-3 rounded-xl" style={{ backgroundColor: 'var(--page-bg)', border: '1px solid var(--border-color)' }}>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.currency}</div>
            <div className="text-lg font-bold" style={{ color: '#FDE68A' }}>
              {source?.currency || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-4 flex flex-wrap gap-5 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
        <button
          type="button"
          onClick={onTestConnection}
          disabled={testing}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
        >
          <Wifi size={16} style={{ color: 'var(--text-secondary)' }} />
          <span className="hover:text-[#6366F1] transition-colors">{testing ? t.testing : t.testConnection}</span>
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'transparent', color: '#6366F1' }}
        >
          <RefreshCcw size={16} className="text-[#6366F1]" />
          <span className="hover:text-[#818CF8] transition-colors">{syncing ? t.syncing : t.sync}</span>
        </button>

        <button
          type="button"
          onClick={onApplyProfit}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
        >
          <BadgePercent size={16} style={{ color: 'var(--text-secondary)' }} />
          <span className="hover:text-[#6366F1] transition-colors">{t.applyProfit}</span>
        </button>
      </div>
    </div>
  );
};

export default SourceCard;
