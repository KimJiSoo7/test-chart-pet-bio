import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Label } from "../common/Common";
import { DEVICE_ID } from "../global/deviceInfo";
import { URL_WEB_SERVER } from "../global/url";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: black;
  margin-top: 5px;
`;

const NoticeWrapper = styled.div`
  position: relative;
  width: 99%;
  max-height: 260px;
  background-color: #e6c4c43e;
  margin: 0 auto;
  overflow-y: auto;
`;

const Box = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
  width: 500px;
  height: 100px;
  background-color: transparent;
`;

const Paragraph = styled.p`
  /* padding: 7px; */
  margin: 10px;
  font-size: 24px;
  color: white;
  /* background-color: red; */
`;

const Notice = ({ day, time, bpm }) => {
  return (
    <Box>
      <div>
        <Paragraph>{day}</Paragraph>
        <Paragraph>{time}</Paragraph>
      </div>
      <Paragraph>{bpm}</Paragraph>
    </Box>
  );
};

function NoticeAbnormalData() {
  const [abnormalHeart, setAbnormalHeart] = useState([]);
  const [abnormalBreath, setAbnormalBreath] = useState([]);

  useEffect(() => {
    try {
      axios
        .post(`${URL_WEB_SERVER}/notice/heart`, {
          deviceId: DEVICE_ID,
        })
        .then((res) => {
          setAbnormalHeart(res.data[0]);
        });
      axios
        .post(`${URL_WEB_SERVER}/notice/breath`, {
          deviceId: DEVICE_ID,
        })
        .then((res) => {
          setAbnormalBreath(res.data[0]);
        });
    } catch (err) {
      console.log("Erorr >>  ", err);
    }
  }, []);

  return (
    <Wrapper>
      <Label color={"white"} weight={"bold"}>
        비정상심박수 알림
      </Label>
      <NoticeWrapper>
        {abnormalHeart?.map((item, i) => {
          console.log("key>> ", item.id.concat(i));
          return (
            <>
              <Notice
                key={item.id.concat(i)}
                day={item.update_date.substring(0, 10)}
                time={item.update_date.substring(11)}
                bpm={item.bpm}
              />
              <hr />
            </>
          );
        })}
      </NoticeWrapper>
      <Label color={"white"} weight={"bold"}>
        과다호흡 알림
      </Label>
      <NoticeWrapper>
        {abnormalBreath?.map((item, i) => {
          return (
            <>
              <Notice
                key={item.id.concat(i)}
                day={item.update_date.substring(0, 10)}
                time={item.update_date.substring(11)}
                bpm={item.frequency}
              />
              <hr />
            </>
          );
        })}
      </NoticeWrapper>
    </Wrapper>
  );
}
export default NoticeAbnormalData;
