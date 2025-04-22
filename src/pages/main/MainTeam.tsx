import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MainTeam = () => {
  const location = useLocation();
  const [team, setTeam] = useState(location.state?.team || []);

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
    </div>
  );
};

export default MainTeam;
