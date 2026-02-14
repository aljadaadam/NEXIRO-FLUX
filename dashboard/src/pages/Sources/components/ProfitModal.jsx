import React from 'react';
import { BadgePercent, Info } from 'lucide-react';

const ProfitModal = ({ dir, isRTL, t, selectedSource, profitPercentage, setProfitPercentage, onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full animate-scale-in" dir={dir}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="inline-flex items-center gap-2">
              <BadgePercent size={18} />
              {t.applyProfitTitle}
            </span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedSource?.name}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.profitPercentage}
            </label>
            <input
              type="number"
              value={profitPercentage}
              onChange={(e) => setProfitPercentage(parseFloat(e.target.value))}
              min="0"
              max="1000"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-bold"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="inline-flex items-center gap-2">
                <Info size={16} />
                {t.profitWarning} ({selectedSource?.productsCount || 0} {isRTL ? 'منتج' : 'products'})
              </span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
              {isRTL
                ? `مثال: سعر المصدر $1.00 + ربح ${profitPercentage}% = $${(1 * (1 + profitPercentage / 100)).toFixed(3)}`
                : `Example: Source price $1.00 + ${profitPercentage}% profit = $${(1 * (1 + profitPercentage / 100)).toFixed(3)}`}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            {t.cancel}
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            type="button"
          >
            {isRTL ? 'تطبيق الربح' : 'Apply Profit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitModal;
