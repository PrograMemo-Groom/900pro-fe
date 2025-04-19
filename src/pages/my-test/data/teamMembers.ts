// CodeLanguage 타입 정의
export type CodeLanguage = 'java' | 'cpp' | 'python' | 'javascript';

// 팀원 데이터 타입 정의
export interface TeamMember {
  name: string;
  code: string;
  language: CodeLanguage;
}

// 팀원 코드 데이터
export const teamMembers: TeamMember[] = [
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
