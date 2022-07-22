import axios from "axios";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { Hr, Label } from "../common/Common";
import { homeNotice } from "../global/atoms";
import { DEVICE_ID } from "../global/globalVariables";
import { URL_WEB_SERVER } from "../global/url";
import src_heart from "../images/heart_orange.png";
import src_breath from "../images/heart_green.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #474554;
`;

const TitleBox = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  margin-left: 25px;
`;

const ItemWrapper = styled.div`
  position: relative;
  max-width: 560px;
  /* max-height: 260px; */
  /* background-color: #e6c4c43e; */
  /* margin: 0 auto; */
  margin-left: 25px;
  /* overflow-y: auto; */
`;

const ItemBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 85px;
`;

const Span = styled.span`
  font-size: ${(props) => props.ftSize || "20px"};
  color: ${(props) => props.color || "#93919d"};
`;

const Item = ({ day, time, bpm }) => {
  return (
    <>
      <ItemBox>
        <div
          key={day.concat(time)}
          style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}
        >
          <Span>{day}</Span>
          <Span color="white">{time}</Span>
        </div>
        <div
          key={day.concat(time, bpm)}
          style={{ display: "flex", alignItems: "center", columnGap: "8px" }}
        >
          <Span ftSize="28px" color="white">
            {bpm}
          </Span>
          <Span>BPM</Span>
        </div>
      </ItemBox>
      <Hr />
    </>
  );
};

const Img = styled.img.attrs({ alt: `can't find a image` })`
  width: 35px;
  height: 35px;
  margin-right: 5px;
`;

function Notice() {
  const [abnormalHeart, setAbnormalHeart] = useState([]);
  const [abnormalBreath, setAbnormalBreath] = useState([]);
  const [notice, setNotice] = useRecoilState(homeNotice);

  const setData = async (gb) => {
    const response = await axios.get(`${URL_WEB_SERVER}/notice`, {
      params: {
        deviceId: DEVICE_ID,
        gubun: gb,
      },
    });
    const data = response.data[0];
    if (data) {
      if (gb === "1") {
        setAbnormalHeart(() => [...data]);
      } else {
        setAbnormalBreath(() => [...data]);
      }
    }
  };

  useEffect(() => {
    // 알림화면 방문시 홈화면 알림 banner 읽음 처리
    setNotice((prev) => {
      return { ...prev, hasNotice: false, count: prev.oldCount };
    });
    try {
      setData("1");
      setData("2");
    } catch (err) {
      console.log("Erorr >>  ", err);
    }
  }, []);

  return (
    <Wrapper>
      <TitleBox>
        <Img src={src_heart} />
        <Label color={"white"} weight={"bold"}>
          비정상심박수 알림
        </Label>
      </TitleBox>
      <Hr height="2px" />

      <ItemWrapper>
        {abnormalHeart?.map((item) => {
          return (
            <Item
              key={item.date}
              day={item.date.substring(0, 12)}
              time={item.date.substring(13)}
              bpm={item.bpm}
            />
          );
        })}
      </ItemWrapper>
      <TitleBox>
        <Img src={src_breath} />
        <Label color={"white"} weight={"bold"}>
          과다호흡 알림
        </Label>
      </TitleBox>
      <Hr height="2px" />

      <ItemWrapper>
        {abnormalBreath?.map((item) => {
          return (
            <Item
              key={item.date}
              day={item.date.substring(0, 12)}
              time={item.date.substring(13)}
              bpm={item.rr}
            />
          );
        })}
      </ItemWrapper>
    </Wrapper>
  );
}
export default Notice;
