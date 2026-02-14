import React, { useMemo } from 'react';
import { normalizeRequired, getFieldLabel, getCustomFields } from '../utils/fieldUtils';

/**
 * Fields Tab Component - displays custom fields for the product
 */
const FieldsTab = ({ dir, product }) => {
  const customFields = useMemo(() => getCustomFields(product), [product]);

  return (
    <div className="space-y-3 animate-fadeIn">
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {dir === 'rtl' ? 'الحقول المخصصة للمنتج (عرض فقط).' : 'Custom fields for this product (read-only).'}
      </p>

      {customFields.length === 0 ? (
        <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {dir === 'rtl' ? 'لا توجد حقول مخصصة.' : 'No custom fields.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {customFields.map((field, index) => {
            const required = normalizeRequired(field?.required);
            const fieldType = String(field?.fieldtype ?? field?.type ?? '').trim();
            const fieldKey = `${field?.fieldname ?? field?.name ?? 'field'}-${index}`;
            const description = String(field?.description ?? '').trim();
            const options = String(field?.fieldoptions ?? '').trim();
            return (
              <div
                key={fieldKey}
                className="rounded-lg border p-3"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--page-bg)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {getFieldLabel(field, dir)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {fieldType ? (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {dir === 'rtl' ? 'النوع' : 'Type'}: {fieldType}
                        </span>
                      ) : null}
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {dir === 'rtl' ? 'إلزامي' : 'Required'}: {required ? (dir === 'rtl' ? 'نعم' : 'Yes') : (dir === 'rtl' ? 'لا' : 'No')}
                      </span>
                    </div>
                  </div>
                </div>

                {description ? (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {description}
                  </p>
                ) : null}

                {options ? (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {dir === 'rtl' ? 'الخيارات' : 'Options'}: {options}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FieldsTab;
