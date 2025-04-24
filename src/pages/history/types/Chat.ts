// export type ChatType = {
//     id: number;
//     chatRoomId: number;
//     userId: number;
//     userName: string; //유저네임 추가
//     content: string;
//     sendAt: string;
//   };

export type ChatType = {
  id: number;
  chatRoomId: number;
  userId: number | null;
  userName: string | null;
  content: string;
  sendAt: string;
  testDate: string | null;
  chatbotMessage: string | null;
  chatbot: boolean;
};
