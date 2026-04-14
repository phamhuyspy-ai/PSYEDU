import React from 'react';
import { useBuilderStore } from '../../../store/builderStore';

export default function LivePreview() {
  const { form, blocks } = useBuilderStore();

  if (!form) return null;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bản xem trước (Live Preview)</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Giao diện người dùng</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-950">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{form.description}</p>
            )}
          </div>

          {/* Form Blocks */}
          <div className="p-6 space-y-8">
            {blocks.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
                Chưa có câu hỏi nào.
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="space-y-3">
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{index + 1}.</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {block.title}
                        {block.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {block.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{block.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="pl-6">
                    {/* Render different block types for preview */}
                    {block.type === 'single_choice' && (
                      <div className="space-y-2">
                        {block.options?.map(opt => (
                          <label key={opt.id} className="flex items-center gap-2">
                            <input type="radio" name={`preview_${block.id}`} className="text-blue-600" />
                            <span className="text-sm text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {block.type === 'multi_choice' && (
                      <div className="space-y-2">
                        {block.options?.map(opt => (
                          <label key={opt.id} className="flex items-center gap-2">
                            <input type="checkbox" className="text-blue-600 rounded" />
                            <span className="text-sm text-gray-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {block.type === 'text' && (
                      <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        rows={3}
                        placeholder="Câu trả lời của bạn..."
                        disabled
                      />
                    )}

                    {block.type === 'likert' && (
                      <div className="flex justify-between items-center gap-2 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {block.options?.map(opt => (
                          <label key={opt.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[60px]">
                            <input type="radio" name={`preview_${block.id}`} className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-center text-gray-600">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {block.type === 'matrix' && (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-3 border-b border-gray-200"></th>
                              {block.columns?.map(col => (
                                <th key={col.id} className="p-3 border-b border-gray-200 text-center font-medium text-gray-700">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows?.map((row, rIdx) => (
                              <tr key={row.id} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-3 border-b border-gray-100 font-medium text-gray-700">{row.label}</td>
                                {block.columns?.map(col => (
                                  <td key={col.id} className="p-3 border-b border-gray-100 text-center">
                                    <input type="radio" name={`preview_matrix_${row.id}`} className="text-blue-600" />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium text-sm opacity-50 cursor-not-allowed">
              Gửi câu trả lời
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
