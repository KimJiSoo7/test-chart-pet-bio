import { atom, selector } from "recoil";

export const homeNotice = atom({
  key: "homeNotice",
  default: {
    date: "", // 알림 발생 일자, format ?월 ?일
    type: "", // 알림 타입, 과다호흡 비정상심박수
    count: 0, // 사용자가 확인 하기 전 알림 갯수
    hasNotice: true, // 사용자가 알림 확인하면 true 그렇지 않으면 false count !== oldCount
    oldCount: 0, // 실시간으로 갱신되는 전체 알림 갯수
  },
});

export const getHomeNotice = selector({
  key: "getHomeNotice",
  get: ({ get }) => {
    const notice = get(homeNotice);
    console.log("in getHomeNotice >>  ", notice);
    return notice;
  },
});
