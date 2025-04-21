import { CodeLanguage } from '../components/CodeEditor';

export const availableLanguages: CodeLanguage[] = ['python', 'javascript', 'java', 'cpp', 'c'];

export const languageDisplayNames: Record<CodeLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C'
};

export const defaultCode: Record<CodeLanguage, string> = {
  python: '# 파이썬 코드를 작성하세요\nprint("Hello World!")\n',
  javascript: '// 자바스크립트 코드를 작성하세요\nconsole.log("Hello World!");\n',
  java: '// 자바 코드를 작성하세요\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}\n',
  cpp: '// C++ 코드를 작성하세요\n#include <iostream>\n\nint main() {\n  std::cout << "Hello World!" << std::endl;\n  return 0;\n}\n',
  c: '// C 코드를 작성하세요\n#include <stdio.h>\n\nint main() {\n  printf("Hello World!\\n");\n  return 0;\n}\n'
};
