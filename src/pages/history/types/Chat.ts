export type ChatType = {
    id: number;
    chatRoomId: number;
    userId: number;
    userName: string; //유저네임 추가
    content: string;
    send_at: string;
  };

export type TeamVieweBoolean = {
  isTeamViewerOpen: boolean;
};

export type TeamViewerProps = {
  onShowTeamViewer: () => void;
};