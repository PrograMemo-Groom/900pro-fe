import { FileItem } from '@/pages/coding-test/types/types';

// 샘플 파일 구조 데이터
export const sampleFileStructure: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      { id: '2', name: 'main.py', type: 'file', extension: 'py' },
      { id: '3', name: 'input.txt', type: 'file', extension: 'txt' },
    ]
  },
];
