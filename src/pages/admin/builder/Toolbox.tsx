import React from 'react';
import { 
  Type, 
  AlignLeft, 
  Heading, 
  User, 
  CircleDot, 
  CheckSquare, 
  ListOrdered, 
  MessageSquare, 
  Grid
} from 'lucide-react';
import { useBuilderStore, BlockType } from '../../../store/builderStore';

const tools = [
  { type: 'content', icon: Type, label: 'Nội dung (Giới thiệu/Hướng dẫn)' },
  { type: 'contact', icon: User, label: 'Thông tin liên lạc' },
  { type: 'single_choice', icon: CircleDot, label: 'Chọn 1 đáp án' },
  { type: 'multi_choice', icon: CheckSquare, label: 'Chọn nhiều đáp án' },
  { type: 'likert', icon: ListOrdered, label: 'Thang Likert' },
  { type: 'text', icon: MessageSquare, label: 'Tự luận' },
  { type: 'matrix', icon: Grid, label: 'Ma trận' },
];

export default function Toolbox() {
  const addBlock = useBuilderStore(state => state.addBlock);

  const handleAddBlock = (type: BlockType) => {
    addBlock({
      type,
      code: `Q${Math.floor(Math.random() * 1000)}`,
      title: 'Câu hỏi mới',
      required: false,
      visible: true,
      options: type === 'single_choice' || type === 'multi_choice' || type === 'likert' ? [
        { id: crypto.randomUUID(), code: 'O1', label: 'Lựa chọn 1', stored_value: '1', score: 0, sort_order: 0, is_active: true },
        { id: crypto.randomUUID(), code: 'O2', label: 'Lựa chọn 2', stored_value: '2', score: 0, sort_order: 1, is_active: true },
      ] : undefined,
      rows: type === 'matrix' ? [
        { id: crypto.randomUUID(), code: 'R1', label: 'Hàng 1', sort_order: 0 }
      ] : undefined,
      columns: type === 'matrix' ? [
        { id: crypto.randomUUID(), code: 'C1', label: 'Cột 1', input_type: 'linear', stored_value: '1', score: 1, sort_order: 0 }
      ] : undefined
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Công cụ</h2>
        <p className="text-xs text-gray-500 mt-1">Nhấn để thêm vào biểu mẫu</p>
      </div>
      <div className="p-3 overflow-y-auto flex-1 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => handleAddBlock(tool.type as BlockType)}
            className="w-full flex items-center gap-3 p-3 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 rounded-lg transition-colors text-left"
          >
            <tool.icon size={18} className="text-gray-500" />
            <span className="font-medium">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
