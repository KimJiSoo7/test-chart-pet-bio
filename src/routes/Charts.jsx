import styled from "styled-components";
import { useParams } from "react-router-dom";
import { URL_WEB_SERVER } from "../global/url";
import { useEffect, useState } from "react";
import {
  COLOR_BREATH,
  COLOR_HEART,
  DEVICE_ID,
  RATES_MAX_BREATH,
  RATES_MAX_HEART,
  RATES_MIN_BREATH,
  RATES_MIN_HEART,
} from "../global/globalVariables";
import src_heart from "../images/heart_orange.png";
import src_breath from "../images/heart_green.png";
import { HomeBarChart } from "../common/DrawCharts";
import axios from "axios";
import { Hr } from "../common/Common";
// const axios = require("axios").default;

const Wrapper = styled.div`
  /* width: 100%; */
  /* height: 110vh; */
  background-color: #474554;
`;

// chart page header
const Header = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const HeaderItem = styled.button`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 25px;
  font-size: 25px;
  color: white;
  background-color: ${(props) =>
    props.linkId === props.selectedTab ? "#8457ff" : "#5a5865;"};
  margin-left: 30px;
  text-decoration: none;
`;

const TextBox = styled.div`
  height: 170px;
  display: flex;
  flex-direction: column;
  row-gap: 15px;
  justify-content: center;
  /* background-color: red; */
  margin-left: 30px;
`;

const ChartBox = styled.div`
  width: 90%;
  height: 40%;
  height: 320px;
  background-color: #3c3b47;
  border-radius: 30px;
  padding: 30px 20px;
  margin: 0 auto;
  margin-bottom: 20px;
`;

const NoticeBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* width: %; */
  height: 80px;
  margin: 0 auto;
  background-color: ${(props) => props.isClicked && "#3c3b47"};
`;

const NoticeTextBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 35px 0px;
  row-gap: 15px;
  background-color: #3c3b47;
`;

const Span = styled.span`
  font-size: ${(props) => props.ftSize || "20px"};
  color: ${(props) => props.ftColor || "#a3a2aa"};
  font-weight: ${(props) => props.ftWeight || "normal"};
`;

const Img = styled.img.attrs({ alt: `can't find a image` })`
  width: 45px;
  height: 45px;
  margin-right: 5px;
`;

function Charts() {
  const [tab, setTab] = useState("D"); // selected Tab
  const [text, setText] = useState({ minRates: 0, maxRates: 0, dates: "" }); // when bar is not clicked
  const [selectedBarText, setSelectedBarText] = useState({
    minRates: null,
    maxRates: null,
    dates: null,
  }); // when bar is clicked
  const [chart, setChart] = useState([]); // bar chart data
  const [cntAbnormal, setCntAbnormal] = useState(0); // abnormal data count
  const [day, setDay] = useState(new Date()); // swipe variable, unit: period(a day, a week, a month)
  const [noticeClicked, setNoticeClicked] = useState(false); // notice box clicked
  const [hasAbnormal, setHasAbonormal] = useState(false); // the clicked bar's abnormal data when notice box is clicked
  const [barClicked, setBarClicked] = useState(false);
  let isBarClicked = false; // barClicked??? state??? ????????? ???????????? ????????? ????????? click event?????? ????????????
  const { gubun } = useParams(); // 1: heart 2: breath

  // ??? ?????????????????? ????????? ??? ?????????..? parameter?????? ??? ???????????? ?????????
  // let xTicks = [];
  const [xTicks, setXTicks] = useState([]);

  const onClickHeader = (e) => {
    const {
      target: { id },
    } = e;
    setHasAbonormal(false);
    setNoticeClicked(false);
    isBarClicked = false;
    setBarClicked(false);
    setDay(new Date());
    setTab(id);
  };

  const onClickBar = (e) => {
    const { minMeasures, maxMeasures } = e;
    console.log("onClickBar >>   ", e);
    if (minMeasures || maxMeasures) {
      setHasAbonormal(true);
    } else {
      setHasAbonormal(false);
    }
    if (e) {
      setBarClicked((prev) => (prev = true));
      isBarClicked = true;
      const { updateDate, measures } = e;
      console.log(updateDate);
      let fullText = "";
      let year = "";
      let month = "";
      let date = 0;
      if (tab === "D") {
        const currHour = parseInt(updateDate.substring(0, 2), 10);
        const newDate = new Date(new Date().setHours(currHour));
        const time = currHour < 12 ? "??????" : "??????";
        month = String(newDate.getMonth() + 1).padStart(2, "0");
        date = newDate.getDate();
        fullText = `${month}??? ${date}??? ${time} ${currHour}???~${
          currHour + 1
        }???`;
      } else {
        year = updateDate.substring(0, 4);
        month = updateDate.substring(5, 7);
        date = updateDate.substring(8);
        fullText = `${year}??? ${month}??? ${date}???`;
      }
      setSelectedBarText((prev) => ({
        ...prev,
        minRates: measures[0],
        maxRates: measures[1],
        dates: fullText,
      }));
    }
  };

  const onClickDiagram = (e) => {
    console.log("onClickDiagram >>   ", e);
    if (!isBarClicked) {
      setBarClicked((prev) => (prev = false));
      isBarClicked = !isBarClicked;
      setHasAbonormal(false);
    }
  };

  const dayFormatter = (dates) => {
    const hours = `${dates}`.substring(0, 2);
    let tickText = "";
    switch (hours) {
      case "00":
        tickText = "0???";
        break;
      case "06":
        tickText = "6???";
        break;
      case "12":
        tickText = "12???";
        break;
      case "18":
        tickText = "18???";
        break;
    }
    return tickText;
  };

  const weekFormatter = (dates) => {
    // switch statement will be changed into lookUpTable by compiler, maybe...?
    const key = new Date(dates).getDay();
    // let tickText = "";
    // switch (key) {
    //   case 0:
    //     tickText = "???";
    //     break;
    //   case 1:
    //     tickText = "???";
    //     break;
    //   case 2:
    //     tickText = "???";
    //     break;
    //   case 3:
    //     tickText = "???";
    //     break;
    //   case 4:
    //     tickText = "???";
    //     break;
    //   case 5:
    //     tickText = "???";
    //     break;
    //   case 6:
    //     tickText = "???";
    //     break;
    // }
    // return tickText;

    const lookUpTable = {
      0: "???",
      1: "???",
      2: "???",
      3: "???",
      4: "???",
      5: "???",
      6: "???",
    };
    return lookUpTable[key];
  };

  const monthFormatter = (dates) => {
    const date = new Date(dates);
    let tickText = "";
    if (!date.getDay()) {
      tickText = date.getDate() + "???";
    }
    return tickText;
  };

  const setChartData = (gubun, arrItem, minVal, maxVal, abnormal) => {
    if (gubun === "1") {
      setArrayElement(
        arrItem,
        RATES_MIN_HEART,
        RATES_MAX_HEART,
        minVal,
        maxVal,
        abnormal
      );
    } else {
      setArrayElement(
        arrItem,
        RATES_MIN_BREATH,
        RATES_MAX_BREATH,
        minVal,
        maxVal,
        abnormal
      );
    }
  };

  const setArrayElement = (arrItem, MIN, MAX, minVal, maxVal, abnormal) => {
    let hasAbnormal = false;
    arrItem.measures = [minVal, maxVal];
    if (minVal <= MIN) {
      arrItem.minMeasures = [minVal, MIN];
      hasAbnormal = true;
    }
    if (maxVal >= MAX) {
      arrItem.maxMeasures = [MAX, maxVal];
      hasAbnormal = true;
    }
    if (hasAbnormal) {
      abnormal.cnt++;
    }
  };

  const getChartArray = (gubun, data) => {
    const chartArr = [];
    let dataIndex = 0;
    let length = 0;
    let abnormal = { cnt: 0 };
    switch (tab) {
      case "D":
        length = 24; // 24??????
        chartArr.length = length;

        // initialize chart Array
        for (let i = 0; i < length; i++) {
          chartArr[i] = {
            measures: null,
            minMeasures: null,
            maxMeasures: null,
            updateDate: String(i).padStart(2, 0) + ":00:00",
          };

          if (data[dataIndex]) {
            if (
              parseInt(data[dataIndex].update_date.substring(0, 2), 10) === i
            ) {
              if (data[dataIndex].minVal && data[dataIndex].maxVal) {
                setChartData(
                  gubun,
                  chartArr[i],
                  data[dataIndex].minVal,
                  data[dataIndex].maxVal,
                  abnormal
                );
              }
              dataIndex++;
            }
          }
        }
        break;
      case "W":
        const baseDate = new Date(data[0].update_date);
        const currDay = baseDate.getDay();
        const firstDayOfWeek = new Date(
          baseDate.setDate(baseDate.getDate() - currDay)
        );
        length = 7; // ?????????
        // console.log("firstDayOfWeek >> ", firstDayOfWeek);
        chartArr.length = length;
        for (let i = 0; i < length; i++) {
          const tempDate = new Date(firstDayOfWeek);
          chartArr[i] = {
            measures: null,
            minMeasures: null,
            maxMeasures: null,
            updateDate: new Date(tempDate.setDate(tempDate.getDate() + i))
              .toISOString()
              .substring(0, 10),
          };
          // console.log("updateDate >> ", chartArr[i].updateDate);

          if (data[dataIndex]) {
            if (data[dataIndex].update_date === chartArr[i].updateDate) {
              if (data[dataIndex].minVal && data[dataIndex].maxVal) {
                setChartData(
                  gubun,
                  chartArr[i],
                  data[dataIndex].minVal,
                  data[dataIndex].maxVal,
                  abnormal
                );
              }
              dataIndex++;
            }
          }
          // console.log("second chartArr[i] >> ", chartArr[i]);
        }
        break;
      case "M":
        // getMonth(): 0 ~ 11
        const daysInMonth = new Date(day.getFullYear(), day.getMonth() - 1, 0);
        length = daysInMonth.getDate(); // ?????? ?????? ??? ???
        chartArr.length = length;
        for (let i = 0; i < length; i++) {
          chartArr[i] = {
            measures: null,
            minMeasures: null,
            maxMeasures: null,
            updateDate:
              day.getFullYear() +
              "-" +
              String(day.getMonth() + 1).padStart(2, 0) +
              "-" +
              String(i + 1).padStart(2, 0),
          };

          if (data[dataIndex]) {
            if (data[dataIndex].update_date === chartArr[i].updateDate) {
              if (data[dataIndex].minVal && data[dataIndex].maxVal) {
                setChartData(
                  gubun,
                  chartArr[i],
                  data[dataIndex].minVal,
                  data[dataIndex].maxVal,
                  abnormal
                );
              }
              dataIndex++;
            }
          }
        }
        break;
    }
    setCntAbnormal((prev) => (prev = abnormal.cnt));
    return chartArr;
  };

  const getTicks = (arr) => {
    let ticks = [];

    console.log("******************************", arr, tab);
    switch (tab) {
      case "D":
        ticks = ["00:00:00", "06:00:00", "12:00:00", "18:00:00"];
        break;
      case "W":
        for (let i = 0; i < arr.length; i++) {
          ticks.push(arr[i].updateDate);
        }
        break;
      case "M":
        for (let i = 0; i < arr.length; i++) {
          if (new Date(arr[i].updateDate).getDay() === 0) {
            ticks.push(arr[i].updateDate);
          }
        }
        break;
    }
    console.log("xTicks >>>   ", ticks);
    return ticks;
  };

  async function setData() {
    try {
      const response = await axios.get(`${URL_WEB_SERVER}/charts/${tab}`, {
        params: {
          gb: gubun,
          deviceId: DEVICE_ID,
          dates: day.toISOString().substring(0, 10),
        },
      });

      const data = response.data[0];
      if (data.length) {
        setText((prev) => ({
          ...prev,
          minRates: data[data.length - 1].minimum,
          maxRates: data[data.length - 1].maximum,
          dates:
            tab === "D"
              ? data[data.length - 1].dates
              : tab === "W"
              ? data[0].dates.substring(0, 13) + // ????????? ????????? ???????  VS ???????????? ????????? ???????????? ???????
                " ~ " +
                data[data.length - 1].dates.substring(6, 13)
              : data[0].dates.substring(0, 9),
        }));

        // dynamic data chart, custom labelFormatter?????? db??? ????????? ?????? ????????? ???????????? ????????? ??????
        // const tempArr = [];
        // data.forEach((item) => {
        //   tempArr.push({
        //     measures: [item.minVal, item.maxVal],
        //     updateDate: item.update_date,
        //   });
        // });
        // setChart([...tempArr]);

        // x-axis fixed count data chart
        let chartArr = getChartArray(gubun, data);
        // xTicks.length = 0;
        // xTicks = getTicks(chartArr);
        setChart([...chartArr]);
        setXTicks([...getTicks(chartArr)]);
      } else {
        setText((prev) => ({
          ...prev,
          minRates: null,
          maxRates: null,
          dates: null,
        }));
        setChart(null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setData();
  }, [day]);

  return (
    <Wrapper>
      <Header>
        <HeaderItem
          id="D"
          linkId={"D"}
          selectedTab={tab}
          onClick={onClickHeader}
        >
          ???
        </HeaderItem>
        <HeaderItem
          id="W"
          linkId={"W"}
          selectedTab={tab}
          onClick={onClickHeader}
        >
          ???
        </HeaderItem>
        <HeaderItem
          id="M"
          linkId={"M"}
          selectedTab={tab}
          onClick={onClickHeader}
        >
          ???
        </HeaderItem>
      </Header>
      <Hr />
      <TextBox>
        <Span ftSize="24px" ftColor="#fde25e">
          ??????
        </Span>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            columnGap: "10px",
          }}
        >
          <Span ftSize="45px" ftWeight="bold" ftColor="white">
            {(text?.minRates &&
              (!barClicked
                ? `${text?.minRates}~${text?.maxRates}`
                : `${selectedBarText?.minRates}~${selectedBarText?.maxRates}`)) ||
              ""}
          </Span>
          <Span>BPM</Span>
        </div>
        <Span ftSize="18px">
          {!barClicked ? text?.dates : selectedBarText?.dates || ""}
        </Span>
      </TextBox>
      <ChartBox>
        <button
          onClick={() => {
            setBarClicked(false);
            setNoticeClicked(false);
            switch (tab) {
              case "D":
                setDay((prev) => {
                  // 2??? ??? ???????????? ?????? >> ??? ????????? ????????? ????????? ????????? ???????????? ?????? ???
                  const date = new Date(prev);
                  return new Date(date.setDate(date.getDate() - 1));
                });
                break;
              case "W":
                setDay((prev) => {
                  const date = new Date(prev);
                  return new Date(date.setDate(date.getDate() - 7));
                });
                break;
              case "M":
                setDay((prev) => {
                  const date = new Date(prev);
                  return new Date(date.setMonth(date.getMonth() - 1));
                });
                break;
            }
          }}
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            setBarClicked(false);
            setNoticeClicked(false);
            // ??????????????? ?????? ??????
            let tempDate = new Date(day);
            switch (tab) {
              case "D":
                if (
                  new Date(tempDate.setDate(tempDate.getDate() + 1)) <=
                  new Date()
                ) {
                  setDay((prev) => {
                    const date = new Date(prev);
                    return new Date(date.setDate(date.getDate() + 1));
                  });
                }
                break;
              case "W":
                if (
                  new Date(tempDate.setDate(tempDate.getDate() + 7)) <=
                  new Date()
                ) {
                  setDay((prev) => {
                    const date = new Date(prev);
                    return new Date(date.setDate(date.getDate() + 7));
                  });
                }
                break;
              case "M":
                if (
                  new Date(tempDate.setMonth(tempDate.getMonth() + 1)) <=
                  new Date()
                ) {
                  setDay((prev) => {
                    const date = new Date(prev);
                    return new Date(date.setMonth(date.getMonth() + 1));
                  });
                }
                break;
            }
          }}
        >
          {">"}
        </button>
        <HomeBarChart
          chartData={chart}
          barColor={
            noticeClicked
              ? "#5a5865"
              : gubun === "1"
              ? COLOR_HEART
              : COLOR_BREATH
          }
          abnormalBarColor={gubun === "1" ? COLOR_HEART : COLOR_BREATH}
          lines={[]}
          yDomain={gubun === "1" ? [0, 200] : [0, 60]}
          yTicks={gubun === "1" ? [0, 100, 200] : [0, 30, 60]}
          xTicks={xTicks}
          dataFormatter={
            tab === "D"
              ? dayFormatter
              : tab === "W"
              ? weekFormatter
              : monthFormatter
          }
          // interval={tab === "D" ? 5 : tab === "W" ? 0 : 0} // day:5  week:0  month:0
          visibleAbnormal={noticeClicked}
          barClick={onClickBar}
          diagramClick={onClickDiagram}
        />
      </ChartBox>
      <Hr />
      {cntAbnormal > 0 && (
        <NoticeBox
          isClicked={noticeClicked}
          onClick={() => {
            setNoticeClicked((prev) => !prev);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "30px",
            }}
          >
            <Img src={gubun === "1" ? src_heart : src_breath} />
            <Span ftSize="24px" ftColor={noticeClicked ? "#fde25e" : "white"}>
              {gubun === "1" ? "?????????????????? ??????" : "???????????? ??????"}
            </Span>
          </div>
          <div
            style={{
              // display: "flex",
              // alignItems: "center",
              marginRight: "40px",
            }}
          >
            <Span ftSize="24px" ftColor="#fde25e">
              {cntAbnormal}
            </Span>
          </div>
        </NoticeBox>
      )}
      <Hr />
      {hasAbnormal &&
        noticeClicked &&
        cntAbnormal > 0 && ( // clicked && single bar clicked
          <NoticeTextBox>
            <Span
              style={{ marginBottom: "15px" }}
              ftColor="white"
              ftSize="24px"
            >
              {gubun === "1" ? "?????????" : "?????????"}
              {"??? ??????????????? ??????????????????"}
            </Span>
            <Span>???????????? ????????? ??????????????????.</Span>
            <Span>{""}??? ???????????? ???????????????</Span>
            <Span>{"OO"}????????? ????????? ??? ?????????</Span>
            <Span>????????? ????????? ?????????????????? ????????????.</Span>
          </NoticeTextBox>
        )}

      <Hr />
    </Wrapper>
  );
}
export default Charts;
