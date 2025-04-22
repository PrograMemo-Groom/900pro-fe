import { FileItem } from '@/pages/coding-test/types/types';

// 샘플 파일 구조 데이터
export const sampleFileStructure: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '2',
        name: 'main',
        type: 'folder',
        children: [
          { id: '3', name: 'main.java', type: 'file', extension: 'java' },
          { id: '4', name: 'Untitled.txt', type: 'file', extension: 'txt' },
        ]
      },
      {
        id: '5',
        name: 'test',
        type: 'folder',
        children: [
          { id: '6', name: 'input.txt', type: 'file', extension: 'txt' },
        ]
      },
    ]
  },
  {
    id: '7',
    name: 'etc',
    type: 'folder',
    children: [
      { id: '8', name: 'practice.js', type: 'file', extension: 'js' },
      { id: '9', name: 'practice.cpp', type: 'file', extension: 'cpp' },
      { id: '10', name: 'practice.py', type: 'file', extension: 'py' },
    ]
  },
]; 
