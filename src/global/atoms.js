import { atom, selector } from "recoil";

export const homeNotice = atom({
  key: "homeNotice",
  default: {
    date: "", // 알림 발생 일자, format ?월 ?일
    type: "", // 알림 타입, 과다호흡 비정상심박수
    count: 0, // 사용자가 확인 하기 전의 알림 갯수
    hasNotice: true, // count !== oldCount
    oldCount: 0, // 최근 기준으로 알림 갯수
  }, // Home화면 초기 알림, 이상 알림 조회했을 때 count > 0 이면 false
});

export const getHomeNotice = selector({
  key: "getHomeNotice",
  get: ({ get }) => {
    const notice = get(homeNotice);
    console.log("in getHomeNotice >>  ", notice);
    return notice;
  },
});
