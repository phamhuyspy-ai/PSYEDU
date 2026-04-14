import React from 'react';
import { useBuilderStore } from '../../../store/builderStore';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function Canvas() {
  const { blocks, activeBlockId, setActiveBlock, removeBlock, moveBlock, addBlock } = useBuilderStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const blockId = result.draggableId;
    moveBlock(blockId, destinationIndex);
  };

  const handleDuplicate = (e: React.MouseEvent, block: any) => {
    e.stopPropagation();
    const newBlock = { ...block, title: block.title + ' (Copy)', code: block.code + '_COPY' };
    addBlock(newBlock);
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50"
      onClick={() => setActiveBlock(null)}
    >
      <div className="max-w-3xl mx-auto pb-32">
        {blocks.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">Chưa có câu hỏi nào. Hãy chọn từ thanh công cụ bên trái.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="canvas-blocks">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {blocks.map((block, index) => {
                    const DraggableComponent = Draggable as any;
                    return (
                      <DraggableComponent key={block.id} draggableId={block.id} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              setActiveBlock(block.id);
                            }}
                            className={cn(
                              "bg-white rounded-xl border-2 transition-all cursor-pointer relative group",
                              activeBlockId === block.id 
                                ? "border-blue-500 shadow-md ring-4 ring-blue-50" 
                                : "border-transparent shadow-sm hover:border-gray-300",
                              snapshot.isDragging ? "shadow-xl ring-4 ring-blue-100 z-50" : ""
                            )}
                          >
                          {/* Drag Handle & Actions */}
                          <div 
                            {...provided.dragHandleProps}
                            className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center py-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 rounded-l-xl border-r border-gray-100 hover:bg-gray-100"
                          >
                            <GripVertical size={16} className="text-gray-400" />
                          </div>

                          <div className="pl-10 pr-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    {block.code}
                                  </span>
                                  {block.required && <span className="text-xs text-red-500 font-medium">* Bắt buộc</span>}
                                </div>
                                <h3 className="text-base font-medium text-gray-900">
                                  {block.title || 'Chưa có tiêu đề'}
                                </h3>
                                {block.description && (
                                  <p className="text-sm text-gray-500 mt-1">{block.description}</p>
                                )}
                              </div>

                              {/* Actions */}
                              {activeBlockId === block.id && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button 
                                    onClick={(e) => handleDuplicate(e, block)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Nhân bản"
                                  >
                                    <Copy size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeBlock(block.id);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Xóa"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Block Preview Content */}
                            <div className="mt-4">
                              {block.type === 'content' && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-700 italic">Khối nội dung hiển thị (Giới thiệu / Hướng dẫn / Tiêu đề nhóm)</p>
                                </div>
                              )}
                              {block.type === 'contact' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="h-8 bg-gray-50 border border-gray-200 rounded px-2 flex items-center text-xs text-gray-400">Họ tên</div>
                                  <div className="h-8 bg-gray-50 border border-gray-200 rounded px-2 flex items-center text-xs text-gray-400">Email</div>
                                </div>
                              )}
                              {block.type === 'single_choice' && (
                                <div className="space-y-2">
                                  {block.options?.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                      <span className="text-sm text-gray-700">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {block.type === 'multi_choice' && (
                                <div className="space-y-2">
                                  {block.options?.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded border border-gray-300"></div>
                                      <span className="text-sm text-gray-700">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {block.type === 'likert' && (
                                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                                  {block.options?.map(opt => (
                                    <div key={opt.id} className="flex flex-col items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
                                      <span className="text-xs text-gray-600 text-center max-w-[80px]">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {block.type === 'text' && (
                                <div className="w-full h-12 rounded-md border border-gray-300 bg-gray-50"></div>
                              )}
                              {block.type === 'matrix' && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2"></th>
                                        {block.columns?.map(col => (
                                          <th key={col.id} className="px-4 py-2 text-center">{col.label}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {block.rows?.map(row => (
                                        <tr key={row.id} className="bg-white border-b">
                                          <td className="px-4 py-2 font-medium text-gray-900">{row.label}</td>
                                          {block.columns?.map(col => (
                                            <td key={col.id} className="px-4 py-2 text-center">
                                              <div className="w-4 h-4 rounded-full border border-gray-300 mx-auto"></div>
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
        )}
      </div>
    </div>
  );
}

