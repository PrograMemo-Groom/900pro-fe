import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import './MyTest.scss';

// CodeLanguage 타입 정의
type CodeLanguage = 'java' | 'cpp' | 'python' | 'javascript';

// 팀원 데이터 타입 정의
interface TeamMember {
  name: string;
  code: string;
  language: CodeLanguage;
}

const MyTest: React.FC = () => {
  // 현재 선택된 탭 상태 관리
  const [activeTab, setActiveTab] = useState<'problem' | 'teamCode'>('teamCode');

  // 현재 선택된 팀원 인덱스
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0);

  // 팀원 코드 데이터
  const teamMembers: TeamMember[] = [
    {
      name: '김건영',
      code: `BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

while (true) {
  StringTokenizer st = new StringTokenizer(br.readLine());
  int a = Integer.parseInt(st.nextToken());
  int b = Integer.parseInt(st.nextToken());
  int c = Integer.parseInt(st.nextToken());

  if (a == 0 && b == 0 && c == 0) break;

  int max = Math.max(a, Math.max(b, c));
  int sumOfOthers = a + b + c - max;

  if (sumOfOthers <= max) {
    System.out.println("Invalid");
  } else if (a == b && b == c) {
    System.out.println("Equilateral");
  } else if (a == b || b == c || a == c) {
    System.out.println("Isosceles");
  } else {
    System.out.println("Scalene");
  }
}`,
      language: 'java'
    },
    {
      name: '이지원',
      code: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);

    while (true) {
      int a = sc.nextInt();
      int b = sc.nextInt();
      int c = sc.nextInt();

      if (a == 0 && b == 0 && c == 0) break;

      int[] sides = {a, b, c};
      Arrays.sort(sides);

      if (sides[0] + sides[1] <= sides[2]) {
        System.out.println("Invalid");
      } else if (a == b && b == c) {
        System.out.println("Equilateral");
      } else if (a == b || b == c || a == c) {
        System.out.println("Isosceles");
      } else {
        System.out.println("Scalene");
      }
    }

    sc.close();
  }
}`,
      language: 'java'
    },
    {
      name: '박민수',
      code: `#include <iostream>
using namespace std;

int main() {
  while (true) {
    int a, b, c;
    cin >> a >> b >> c;

    if (a == 0 && b == 0 && c == 0) break;

    int max_side = max(a, max(b, c));
    int sum_others = a + b + c - max_side;

    if (sum_others <= max_side) {
      cout << "Invalid" << endl;
    } else if (a == b && b == c) {
      cout << "Equilateral" << endl;
    } else if (a == b || b == c || a == c) {
      cout << "Isosceles" << endl;
    } else {
      cout << "Scalene" << endl;
    }
  }
  return 0;
}`,
      language: 'cpp'
    },
    {
      name: '최수진',
      code: `def is_valid_triangle(a, b, c):
    sides = sorted([a, b, c])
    return sides[0] + sides[1] > sides[2]

while True:
    a, b, c = map(int, input().split())

    if a == 0 and b == 0 and c == 0:
        break

    if not is_valid_triangle(a, b, c):
        print("Invalid")
    elif a == b == c:
        print("Equilateral")
    elif a == b or b == c or a == c:
        print("Isosceles")
    else:
        print("Scalene")`,
      language: 'python'
    },
    {
      name: '정현우',
      code: `function solution() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (line) => {
    const [a, b, c] = line.split(' ').map(Number);

    if (a === 0 && b === 0 && c === 0) {
      rl.close();
      return;
    }

    const max = Math.max(a, b, c);
    const sumOfOthers = a + b + c - max;

    if (sumOfOthers <= max) {
      console.log("Invalid");
    } else if (a === b && b === c) {
      console.log("Equilateral");
    } else if (a === b || b === c || a === c) {
      console.log("Isosceles");
    } else {
      console.log("Scalene");
    }
  });
}

solution();`,
      language: 'javascript'
    }
  ];

  // 이전 팀원 코드로 이동
  const goToPreviousMember = () => {
    setCurrentMemberIndex((prevIndex) =>
      prevIndex === 0 ? teamMembers.length - 1 : prevIndex - 1
    );
  };

  // 다음 팀원 코드로 이동
  const goToNextMember = () => {
    setCurrentMemberIndex((prevIndex) =>
      (prevIndex + 1) % teamMembers.length
    );
  };

  // 문제 내용 (예시)
  const problemContent = `
    # 삼각형 판별하기

    세 변의 길이가 주어졌을 때, 삼각형의 종류를 판별하는 프로그램을 작성하시오.

    ## 입력
    입력은 여러 개의 테스트 케이스로 이루어져 있다.
    각 테스트 케이스는 세 정수 a, b, c로 이루어져 있으며, 각 변의 길이를 나타낸다.
    입력의 마지막 줄에는 0 0 0이 주어진다.

    ## 출력
    각 테스트 케이스마다 다음과 같이 출력한다.
    - 세 변의 길이가 삼각형의 조건을 만족하지 않으면 "Invalid"
    - 세 변의 길이가 모두 같으면 "Equilateral"
    - 두 변의 길이만 같으면 "Isosceles"
    - 세 변의 길이가 모두 다르면 "Scalene"
  `;

  // 현재 선택된 팀원
  const currentMember = teamMembers[currentMemberIndex];

  return (
    <div className="my-test-container">
      <div className="left-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'problem' ? 'active' : ''}`}
            onClick={() => setActiveTab('problem')}
          >
            문제 보기
          </button>
          <button
            className={`tab ${activeTab === 'teamCode' ? 'active' : ''}`}
            onClick={() => setActiveTab('teamCode')}
          >
            팀원 코드
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'problem' ? (
            <div className="problem-content">
              <pre>{problemContent}</pre>
            </div>
          ) : (
            <div className="team-code-content">
              <div className="member-navigation">
                <button className="nav-button prev" onClick={goToPreviousMember}>
                  &lt;
                </button>
                <div className="member-indicator">
                  {currentMemberIndex + 1} / {teamMembers.length}
                </div>
                <button className="nav-button next" onClick={goToNextMember}>
                  &gt;
                </button>
              </div>
              <div className="member-code-item active">
                <div className="member-name">{currentMember.name} 님의 코드</div>
                <div className="code-preview">
                  <CodeEditor
                    value={currentMember.code}
                    onChange={() => {}} // 읽기 전용이므로 onChange는 빈 함수
                    language={currentMember.language}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-container">
        {/* 채팅 기능 구현 예정 */}
      </div>
    </div>
  );
};

export default MyTest; 
