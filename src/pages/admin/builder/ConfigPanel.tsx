import React from 'react';
import { useBuilderStore, FormType } from '../../../store/builderStore';
import { Settings2, List, Calculator, Grid, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function ConfigPanel() {
  const { form, blocks, activeBlockId, updateBlock, setActiveBlock, updateFormMeta } = useBuilderStore();

  const activeBlock = blocks.find(b => b.id === activeBlockId);

  const handleChange = (field: string, value: any) => {
    if (activeBlock) {
      updateBlock(activeBlock.id, { [field]: value });
    }
  };

  const handleAddOption = () => {
    if (!activeBlock) return;
    const newOptions = [...(activeBlock.options || [])];
    const newId = crypto.randomUUID();
    newOptions.push({
      id: newId,
      code: `O${newOptions.length + 1}`,
      label: `Lựa chọn ${newOptions.length + 1}`,
      stored_value: `${newOptions.length + 1}`,
      score: 0,
      sort_order: newOptions.length,
      is_active: true
    });
    handleChange('options', newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (!activeBlock) return;
    const newOptions = [...(activeBlock.options || [])];
    newOptions.splice(index, 1);
    handleChange('options', newOptions);
  };

  const handleDragOptionEnd = (result: DropResult) => {
    if (!result.destination || !activeBlock) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const newOptions = [...(activeBlock.options || [])];
    const [movedOption] = newOptions.splice(sourceIndex, 1);
    newOptions.splice(destinationIndex, 0, movedOption);
    
    // Update sort_order
    const updatedOptions = newOptions.map((opt, idx) => ({ ...opt, sort_order: idx }));
    handleChange('options', updatedOptions);
  };

  const handleAddEncouragement = () => {
    if (!form) return;
    const newMessages = [...(form.encouragement_messages || [])];
    newMessages.push({
      id: crypto.randomUUID(),
      after_block_index: 0,
      message: 'Làm tốt lắm! Hãy tiếp tục nhé.',
      type: 'motivation'
    });
    updateFormMeta({ encouragement_messages: newMessages });
  };

  const handleRemoveEncouragement = (id: string) => {
    if (!form) return;
    const newMessages = form.encouragement_messages?.filter(m => m.id !== id);
    updateFormMeta({ encouragement_messages: newMessages });
  };

  const updateEncouragement = (id: string, updates: any) => {
    if (!form) return;
    const newMessages = form.encouragement_messages?.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    updateFormMeta({ encouragement_messages: newMessages });
  };

  if (!activeBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Cài đặt Bảng hỏi</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin chung</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại biểu mẫu</label>
              <select 
                value={form?.type}
                onChange={(e) => updateFormMeta({ type: e.target.value as FormType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="survey">Bảng hỏi & Khảo sát</option>
                <option value="assessment">Lượng giá & Đánh giá</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lời động viên (Encouragement)</h3>
            <p className="text-xs text-gray-500">Hiển thị lời động viên sau khi người dùng hoàn thành một số câu hỏi.</p>
            
            <div className="space-y-3">
              {form?.encouragement_messages?.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <select 
                      value={msg.after_block_index}
                      onChange={(e) => updateEncouragement(msg.id, { after_block_index: Number(e.target.value) })}
                      className="text-xs border-gray-300 rounded bg-white"
                    >
                      <option value={-1}>Sau thông tin liên hệ</option>
                      {blocks.map((b, idx) => (
                        <option key={b.id} value={idx}>Sau câu {idx + 1}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleRemoveEncouragement(msg.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea 
                    value={msg.message}
                    onChange={(e) => updateEncouragement(msg.id, { message: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 rounded"
                    rows={2}
                  />
                  <select 
                    value={msg.type}
                    onChange={(e) => updateEncouragement(msg.id, { type: e.target.value })}
                    className="w-full text-xs border-gray-300 rounded bg-white"
                  >
                    <option value="motivation">Động viên</option>
                    <option value="success">Thành công</option>
                    <option value="celebration">Chúc mừng</option>
                  </select>
                </div>
              ))}
              <button 
                onClick={handleAddEncouragement}
                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Thêm lời động viên
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">Cấu hình</h2>
        </div>
        <button 
          onClick={() => setActiveBlock(null)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin cơ bản</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã câu hỏi (Code)</label>
            <input 
              type="text" 
              value={activeBlock.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <textarea 
              rows={2}
              value={activeBlock.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (Tùy chọn)</label>
            <textarea 
              rows={2}
              value={activeBlock.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="required"
              checked={activeBlock.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="required" className="text-sm text-gray-700">Bắt buộc trả lời</label>
          </div>
        </div>

        {/* Options Config (if applicable) */}
        {(activeBlock.type === 'single_choice' || activeBlock.type === 'multi_choice' || activeBlock.type === 'likert') && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <List size={14} /> Đáp án
              </h3>
              <button 
                onClick={handleAddOption}
                className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Thêm
              </button>
            </div>
            
            <DragDropContext onDragEnd={handleDragOptionEnd}>
              <Droppable droppableId="options-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {activeBlock.options?.map((opt, index) => {
                      const DraggableComponent = Draggable as any;
                      return (
                        <DraggableComponent key={opt.id} draggableId={opt.id} index={index}>
                          {(provided: any, snapshot: any) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-start gap-2 bg-gray-50 p-2 rounded-md border ${snapshot.isDragging ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}
                            >
                            <div 
                              {...provided.dragHandleProps}
                              className="mt-1.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={14} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input 
                                type="text" 
                                value={opt.label}
                                onChange={(e) => {
                                  const newOptions = [...(activeBlock.options || [])];
                                  newOptions[index].label = e.target.value;
                                  handleChange('options', newOptions);
                                }}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhãn hiển thị"
                              />
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={opt.stored_value}
                                  onChange={(e) => {
                                    const newOptions = [...(activeBlock.options || [])];
                                    newOptions[index].stored_value = e.target.value;
                                    handleChange('options', newOptions);
                                  }}
                                  className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                  placeholder="Giá trị lưu (Value)"
                                  title="Giá trị lưu trữ"
                                />
                                <input 
                                  type="number" 
                                  value={opt.score}
                                  onChange={(e) => {
                                    const newOptions = [...(activeBlock.options || [])];
                                    newOptions[index].score = Number(e.target.value);
                                    handleChange('options', newOptions);
                                  }}
                                  className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Điểm"
                                  title="Điểm số"
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveOption(index)}
                              className="mt-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </DraggableComponent>
                    );
                  })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Content Block Info */}
        {activeBlock.type === 'content' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">
            <p>Khối này dùng để hiển thị văn bản giới thiệu, hướng dẫn hoặc tiêu đề nhóm. Nó không yêu cầu người dùng nhập liệu.</p>
          </div>
        )}

        {/* Matrix Config (if applicable) */}
        {activeBlock.type === 'matrix' && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Grid size={14} /> Cấu hình Ma trận
            </h3>
            
            {/* Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Hàng (Rows)</span>
                <button 
                  onClick={() => {
                    const newRows = [...(activeBlock.rows || [])];
                    newRows.push({
                      id: crypto.randomUUID(),
                      code: `R${newRows.length + 1}`,
                      label: `Hàng ${newRows.length + 1}`,
                      sort_order: newRows.length
                    });
                    handleChange('rows', newRows);
                  }}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Thêm hàng
                </button>
              </div>
              <div className="space-y-2">
                {activeBlock.rows?.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                    <input 
                      type="text" 
                      value={row.label}
                      onChange={(e) => {
                        const newRows = [...(activeBlock.rows || [])];
                        newRows[index].label = e.target.value;
                        handleChange('rows', newRows);
                      }}
                      className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhãn hàng"
                    />
                    <button 
                      onClick={() => {
                        const newRows = [...(activeBlock.rows || [])];
                        newRows.splice(index, 1);
                        handleChange('rows', newRows);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columns */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cột / Đáp án (Columns)</span>
                <button 
                  onClick={() => {
                    const newCols = [...(activeBlock.columns || [])];
                    newCols.push({
                      id: crypto.randomUUID(),
                      code: `C${newCols.length + 1}`,
                      label: `Cột ${newCols.length + 1}`,
                      input_type: 'linear',
                      stored_value: `${newCols.length + 1}`,
                      score: 0,
                      sort_order: newCols.length
                    });
                    handleChange('columns', newCols);
                  }}
                  className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Thêm cột
                </button>
              </div>
              <div className="space-y-2">
                {activeBlock.columns?.map((col, index) => (
                  <div key={col.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={col.label}
                        onChange={(e) => {
                          const newCols = [...(activeBlock.columns || [])];
                          newCols[index].label = e.target.value;
                          handleChange('columns', newCols);
                        }}
                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhãn cột"
                      />
                      <div className="flex gap-2">
                        <select
                          value={col.input_type}
                          onChange={(e) => {
                            const newCols = [...(activeBlock.columns || [])];
                            newCols[index].input_type = e.target.value as any;
                            handleChange('columns', newCols);
                          }}
                          className="w-1/3 bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="linear">Linear</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                        </select>
                        <input 
                          type="text" 
                          value={col.stored_value}
                          onChange={(e) => {
                            const newCols = [...(activeBlock.columns || [])];
                            newCols[index].stored_value = e.target.value;
                            handleChange('columns', newCols);
                          }}
                          className="w-1/3 bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="Value"
                        />
                        <input 
                          type="number" 
                          value={col.score}
                          onChange={(e) => {
                            const newCols = [...(activeBlock.columns || [])];
                            newCols[index].score = Number(e.target.value);
                            handleChange('columns', newCols);
                          }}
                          className="w-1/3 bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Điểm"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newCols = [...(activeBlock.columns || [])];
                        newCols.splice(index, 1);
                        handleChange('columns', newCols);
                      }}
                      className="mt-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scoring Config */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Calculator size={14} /> Chấm điểm
          </h3>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="score_enabled"
              checked={activeBlock.score_enabled || false}
              onChange={(e) => handleChange('score_enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="score_enabled" className="text-sm text-gray-700">Tính điểm câu này</label>
          </div>

          {activeBlock.score_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm điểm (Score Group)</label>
              <input 
                type="text" 
                value={activeBlock.score_group_code || ''}
                onChange={(e) => handleChange('score_group_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="VD: DEPRESSION"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
