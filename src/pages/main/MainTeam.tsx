import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import API from '@/store/api/ApiConfig.ts';

const MainTeam = () => {
  const location = useLocation();
  const user = jwtDecode(sessionStorage.getItem('token'));
  const [team, setTeam] = useState(location.state?.team || []);
  const navigator = useNavigate();

  const handleTeamOut = async () => {
      await API.delete(`/teams/${team.id}/members?userId=${user.userId}`);
      alert(`${team.teamName}을 탈퇴했습니다. 팀 list로 돌아갑니다.`);
      navigator("/main");
  }

  useEffect(() => {
    if (team) {
      console.log("넘겨받은 팀 정보:", team);
    } else {
      /* GET /user/${user.id}
        {
          "success": true,
          "data": {
            "id": 6,
            "email": "newfly101@naver.com",
            "username": "hong234",
            "active": true
          },
          "message": null
        }
      * */
      // TODO : 유저가 속한 팀 정보를 불러오는 API가 없음. 그래서 팀이 있는 경우를 확인할 방법이 없음
      // (async () => {
      //   const user = jwtDecode(sessionStorage.getItem('token'));
      //   const response = await API.get(`/user/${user.id}`);
      //   console.log("내 팀 정보",response.data);
      //   setTeam(response.data);
      // })();
    }
  }, [team]);

  return (
    <div>
      팀이 있는 경우 디자인 필요
      {/* 히스토리 버튼 클릭 시 넘겨야 하는 data 정보에 대해서 명시하지 않았기 때문에, api 호출 이후의 값들에 대한 명시가 필요함 */}
      <button onClick={() => navigator("/history", {state: {team}})}>히스토리</button>
      <p onClick={() => handleTeamOut()}>팀 탈퇴하기</p>
    </div>
  );
};

export default MainTeam;
