import styled from "styled-components";
import src_heartRate from "../images/heart_rate.png";
import src_heart from "../images/heart_orange.png";
import src_breath from "../images/heart_green.png";
import src_sun from "../images/sun.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL_WEB_SERVER } from "../global/url";
import {
  DEVICE_ID,
  COLOR_HEART,
  COLOR_BREATH,
} from "../global/globalVariables";
import { useNavigate } from "react-router-dom";
import { HomeBarChart } from "../common/DrawCharts";
import { useRecoilState, useRecoilValue } from "recoil";
import { homeNotice, getHomeNotice, test } from "../global/atoms";
import { useRef } from "react";
import { Hr } from "../common/Common";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 90vh;
  background-color: #474554;
  overflow-y: auto;
  margin-top: 5px;
`;

const NoticeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #fde25e;
`;

const NoticeBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  /* width: 230px; */
  height: 100%;
  column-gap: 20px;
  margin-left: 20px;
  margin-right: 20px;
`;

const CurrentStateWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 62px;
  width: 100%;
`;

const ChartBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 200px;
  padding: 20px 30px;
  margin-top: 10px;
  border-radius: 15px;
  background-color: #3c3b47;
  /* overflow-x: auto;
  overflow-y: auto; */
`;

const AverageMeasureWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90%;
  height: 100px;
  position: relative;
  margin: 0 auto;
  margin-top: 10px;
`;

const Box = styled.div`
  display: flex;
  /* justify-content: center; */
  align-items: center;
`;

const Span = styled.span`
  font-size: ${(props) => props.fontSize || "20px"};
  color: ${(props) => props.color || "white"};
  font-weight: ${(props) => props.ftWeight || "bold"};
`;

const CurrentStateBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  column-gap: 10px;
`;

const Img = styled.img.attrs({ alt: `can't find a image` })`
  width: ${(props) => props.width || "55px"};
  width: ${(props) => props.height || "40px"};
`;

// ??????/????????? ?????????, ????????? ????????????
const RateBox = ({ imageUrl, title, value, unit, color, ftWeight }) => {
  return (
    <>
      <Box>
        <Img src={imageUrl} width="30px" height="30px"></Img>
        <Span fontSize={"24px"} color={color} ftWeight={ftWeight}>
          {title}
        </Span>
      </Box>
      <Box style={{ alignItems: "baseline" }}>
        <Span fontSize={"48px"}>{value}</Span>
        <Span
          fontSize={"20px"}
          color={"#97959E"}
          style={{ marginLeft: "10px" }}
        >
          {unit}
        </Span>
      </Box>
    </>
  );
};

const Button = styled.button`
  width: ${(props) => props.width || "35px"};
  height: ${(props) => props.height || "35px"};
  border-radius: 25px;
  font-size: 30px;
  font-weight: bold;
  color: ${(props) => props.ftColor || "white"};
  border: 0;
  background-color: ${(props) => props.bgColor || "#5a5865"};
  &:hover {
    background-color: #3c3b47;
    cursor: pointer;
  }
`;

function Home() {
  let count = 0;
  // react-query ?????????????
  let intervalSec;
  let intervalMin;
  let intervalDay;
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    humid: "",
    temperature: "",
    weight: "",
  });
  const [notice, setNotice] = useRecoilState(homeNotice);
  // const getNotice = useRecoilValue(getHomeNotice);

  // 1?????? ?????? ?????? ????????? ??? ?????????
  const [bpm, setBPM] = useState(0);
  const [rr, setRR] = useState(0);
  const [chartBPM, setChartBPM] = useState([]);
  const [chartRR, setChartRR] = useState([]);

  // ?????? ??? ?????? ???????????? ??? ?????? ????????? ??? ?????????
  const [dayBPM, setDayBPM] = useState(0);
  const [dayRR, setDayRR] = useState(0);

  const [xTicks, setXTicks] = useState([]);

  const getTicks = (arr) => {
    let ticks = [];

    for (let item of arr) {
      if (item.timeDiff % 5 === 0) {
        ticks.push(item.updateDate);
      }
    }
    // for (let i = 0; i < arr.length; i++) {
    //   switch (arr[i].timeDiff) {
    //     case 15:
    //       ticks.push(arr[i].updateDate);
    //       break;
    //     case 10:
    //       ticks.push(arr[i].updateDate);
    //       break;
    //     case 5:
    //       ticks.push(arr[i].updateDate);
    //       break;
    //   }
    // }

    // console.log(ticks);
    return ticks;
  };

  const setAbnormalNotice = async () => {
    const response = await axios.get(`${URL_WEB_SERVER}/home/notice`, {
      params: {
        deviceId: DEVICE_ID,
      },
    });
    const data = response.data[0][0];
    if (data) {
      setNotice((prev) => ({
        ...prev,
        date: data.date,
        type: data.type,
        oldCount: data.cnt,
        hasNotice: prev.count !== data.cnt ? true : false,
      }));
    }
  };

  const setCurrStatus = async () => {
    const response = await axios.get(`${URL_WEB_SERVER}/home/currStatus`, {
      params: {
        deviceId: DEVICE_ID,
      },
    });
    const data = response.data[0][0];
    if (data) {
      setStatus({
        humid: data.humidity,
        temperature: data.temperature,
        weight: data.weight,
      });
    }
  };

  // 1: heart 2: breath
  const setAvgData = async (gubun, value, isDay) => {
    const response = await axios.get(`${URL_WEB_SERVER}/home/avg-data`, {
      params: {
        gb: gubun,
        deviceId: DEVICE_ID,
        value: value, // MINUTES ??????
      },
    });
    const data = response.data[0][0];
    // console.log("Average data >>>", response);
    if (data) {
      if (!isDay) {
        if (gubun === "1") {
          setBPM(data.frequency);
        } else {
          setRR(data.frequency);
        }
      } else {
        if (gubun === "1") {
          setDayBPM(data.frequency);
        } else {
          setDayRR(data.frequency);
        }
      }
    }
  };

  const fifteenMinutesFormatter = (dates) => {
    console.log("count >>   ", count++);
    // ??? 10????????? ???????
    let tickText;
    const now = new Date();
    const yyyyMMdd = now.toISOString().substring(0, 10);
    const timeDiff = now - new Date(`${yyyyMMdd} ${dates}`);
    const timeDiffByMinutes = timeDiff / 1000 / 60; //Math.floor(timeDiff / 1000 / 60);
    console.log("[formatter] timeDiffByMinutes >>  ", timeDiffByMinutes);
    if (timeDiffByMinutes < 16 && timeDiffByMinutes > 14) {
      tickText = "15???";
    } else if (timeDiffByMinutes < 11 && timeDiffByMinutes > 9) {
      tickText = "10???";
    } else if (timeDiffByMinutes < 6 && timeDiffByMinutes > 4) {
      tickText = "5???";
    } else {
      tickText = ""; // undefined
    }
    return tickText;
  };

  // 1: heart 2: breath
  const setChartData = async (gubun) => {
    console.log("setChartDate is called!!!");
    // format: 2022-07-08 13:15:00
    // const formattedTime = time
    //   .toISOString(0, 10)
    //   .substring(0, 10)
    //   .concat(" ", time.toTimeString().substring(0, 6), "00");
    const response = await axios.get(`${URL_WEB_SERVER}/home/chart-data`, {
      params: {
        deviceId: DEVICE_ID,
        gb: gubun,
        // time: formattedTime,
      },
    });
    const data = response.data[0];
    // console.log("Chart data >>>", response);
    if (data) {
      const chartArr = [];
      data.forEach((item) => {
        chartArr.push({
          measures: [item.minVal, item.maxVal],
          updateDate: item.update_date,
          timeDiff: item.diff,
        });
      });
      if (gubun === "1") {
        setChartBPM([...chartArr]);
      } else {
        setChartRR([...chartArr]);
      }
      // console.log("Call getTicks()!!");
      setXTicks([...getTicks(chartArr)]);
    }
  };

  // 10????????? ??????
  function timerEveryTenSeconds() {
    return setInterval(() => {
      const time = new Date();
      if (time.getSeconds() % 10 === 0) {
        console.log("occur every 10 seconds", time);
        // ??????, ??????, ??????
        setCurrStatus();
        // ????????? ??????
        setAbnormalNotice();
      }
    }, 1000);
  }

  // ?????? 0????????? ??????
  function timerEveryMinutes() {
    return setInterval(() => {
      const time = new Date();
      if (time.getSeconds() === 0) {
        console.log("occur every 1 minutes", time);
        // ????????? ?????????(?????? ?????? ????????? ??? ?????????)
        setAvgData("1", 1, false);
        setAvgData("2", 1, false);
        setChartData("1");
        setChartData("2");
      }
    }, 1000);
  }

  // 00??? 0????????? ??????
  function timerAtMidnight() {
    return setInterval(() => {
      const time = new Date();
      if (time.getSeconds() === 0 && time.getHours() === 0) {
        setAvgData("1", 1 * 60 * 24, true);
        setAvgData("2", 1 * 60 * 24, true);
      }
    }, 1000);
  }

  console.log("rendered!!");

  useEffect(() => {
    try {
      // initialize
      const dates = new Date();
      setAvgData("1", 1, false);
      setAvgData("2", 1, false);
      setAvgData("1", 60 * 24, true);
      setAvgData("2", 60 * 24, true);
      setChartData("1");
      setChartData("2");
      setAbnormalNotice();
      setCurrStatus();
      // timer on
      intervalSec = timerEveryTenSeconds();
      intervalMin = timerEveryMinutes();
      intervalDay = timerAtMidnight();
      // console.log("Active intervalSec >>  ", intervalSec);
      // console.log("Active intervalMin >>  ", intervalMin);
      // console.log("Active intervalDay >>  ", intervalDay);
      return () => {
        // console.log("component unmounted!!!");
        clearInterval(intervalSec);
        clearInterval(intervalMin);
        clearInterval(intervalDay);
        // console.log("unmounted intervalSec >>  ", intervalSec);
        // console.log("unmounted intervalMin >>  ", intervalMin);
        // console.log("unmounted intervalDay >>  ", intervalDay);
        // intervalSec = null;
        // intervalMin = null;
        // intervalDay = null;
      };
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <Wrapper>
      {notice?.hasNotice && (
        <NoticeWrapper
          onClick={() => {
            navigate("/notice");
          }}
        >
          <NoticeBox>
            <Img src={src_heartRate} />
            <Span color={"black"} ftWeight={"400"}>
              {notice.type}
            </Span>
          </NoticeBox>
          <NoticeBox>
            <Span color={"black"} ftWeight={"400"}>
              {notice.date}
            </Span>
            <Button
              ftColor="black"
              bgColor="white"
              onClick={(event) => {
                event.stopPropagation();
                setNotice((prev) => ({
                  ...prev,
                  count: prev.oldCount,
                  hasNotice: false,
                }));
              }}
            >
              X
            </Button>
          </NoticeBox>
        </NoticeWrapper>
      )}

      <CurrentStateWrapper>
        <CurrentStateBox>
          <Img src={src_sun} />
          <Span color={"#93919d"} ftWeight={"400"}>
            {"??????"}
          </Span>
          <Span ftWeight={"400"}>{status?.weight}</Span>
        </CurrentStateBox>
        <CurrentStateBox>
          <Img src={src_sun} />
          <Span color={"#93919d"} ftWeight={"400"}>
            {"????????????"}
          </Span>
          <Span ftWeight={"400"}> {status?.temperature}</Span>
        </CurrentStateBox>
        <CurrentStateBox>
          <Img src={src_sun} />
          <Span color={"#93919d"} ftWeight={"400"}>
            {"????????????"}
          </Span>
          <Span ftWeight={"400"}> {status?.humid}</Span>
        </CurrentStateBox>
      </CurrentStateWrapper>
      <Hr height="2px" />

      <ChartBox>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "150px",
            minWidth: "135px",
          }}
        >
          <RateBox
            title="?????????"
            color={COLOR_HEART}
            value={bpm}
            imageUrl={src_heart}
            unit="BPM"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            marginLeft: "8px",
          }}
        >
          <HomeBarChart
            chartData={chartBPM}
            abnormalData={[]}
            barColor={COLOR_HEART}
            lines={[70, 120]}
            yDomain={[0, 200]}
            yTicks={[0, 100, 200]}
            dataFormatter={fifteenMinutesFormatter}
            // interval={4}
            xTicks={xTicks}
          />
        </div>
      </ChartBox>
      <ChartBox>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "150px",
            minWidth: "135px",
          }}
        >
          <RateBox
            title="?????????"
            color={COLOR_BREATH}
            value={rr}
            imageUrl={src_breath}
            unit="RR"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            marginLeft: "8px",
          }}
        >
          <HomeBarChart
            chartData={chartRR}
            abnormalData={[]}
            barColor={COLOR_BREATH}
            lines={[18, 34]}
            yDomain={[0, 60]}
            yTicks={[0, 30, 60]}
            dataFormatter={fifteenMinutesFormatter}
            // interval={4}
            xTicks={xTicks}
          />
        </div>
      </ChartBox>
      <AverageMeasureWrapper>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "200px",
            minWidth: "170px",
          }}
        >
          <RateBox
            imageUrl={src_heart}
            title="????????? ?????????"
            value={dayBPM}
            unit="BPM"
            color={COLOR_HEART}
            ftWeight="100"
          />
        </div>

        <Button
          style={{
            position: "absolute",
            right: 0,
          }}
          onClick={() => {
            navigate("/charts/1");
          }}
        >
          {">"}
        </Button>
      </AverageMeasureWrapper>
      <Hr height="2px" />
      <AverageMeasureWrapper>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            width: "200px",
            minWidth: "170px",
          }}
        >
          <RateBox
            imageUrl={src_breath}
            title="????????? ?????????"
            value={dayRR}
            unit="RR"
            color={COLOR_BREATH}
            ftWeight="100"
          />
        </div>

        <Button
          style={{
            position: "absolute",
            right: 0,
          }}
          onClick={() => {
            navigate("/charts/2");
          }}
        >
          {">"}
        </Button>
      </AverageMeasureWrapper>
    </Wrapper>
  );
}
export default Home;
