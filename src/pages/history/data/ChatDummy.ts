export type Chat = {
    id: number;
    chatRoomId: number;
    userId: number;
    content: string;
    send_at: string;
};

export const ChatDummy: Chat[] = [
    {
        id: 1,
        chatRoomId: 1,
        userId: 1,
        content: '와! 오늘도 많이 배워가는 것 같아요 ~',
        send_at: '2025-04-10 15:44:00',
    },
    {
        id: 2,
        chatRoomId: 1,
        userId: 1,
        content: '더 레벨 높은 팀으로 이동하려면 더 열심히 해봅시다! 오늘 논의 수고하셨어요',
        send_at: '2025-04-10 15:44:00',
    },
    {
        id: 3,
        chatRoomId: 1,
        userId: 2,
        content: '[25.04.10]\n응시하느라 고생하셨습니다\n오늘의 문제번호 : #121 #3999 #986',
        send_at: '2025-04-10 15:44:00',
    },
    {
        id: 4,
        chatRoomId: 1001,
        userId: 3,
        content: '오늘 문제 저번에 공부한거 나온거 맞죠 ??? 👏🏻',
        send_at: '2025-04-10 15:44:00',
    },
    {
        id: 5,
        chatRoomId: 1001,
        userId: 4,
        content: '어제 풀었던 #1253 번 맞나요 !!\n비슷한 느낌이 나긴 했어요 ~ 근데 저는 이렇게 풀었는데 제 코드 보러 오실래요?',
        send_at: '2025-04-10 15:44:00',
    }
]