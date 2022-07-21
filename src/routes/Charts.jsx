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
  width: 100%;
  height: 110vh;
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
  /* font-weight: bold; */
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
  const [day, setDay] = useState(new Date()); // swipe variable for day before and next
  const [barClicked, setBarClicked] = useState(false);
  let isBarClicked = false; // barClicked는 state기 때문에 바로바로 변화가 안돼서 click event에서 사용힘듬
  const [noticeClicked, setNoticeClicked] = useState(false); // notice box clicked
  const [hasAbnormal, setHasAbonormal] = useState(false); // the clicked bar's abnormal data when notice box is clicked
  const { gubun } = useParams(); // 1: heart 2: breath
  // 왜 지역변수로는 동작을 안 하는지..? parameter넘길 때 빈값으로 넘어감
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
        const time = currHour < 12 ? "오전" : "오후";
        month = String(newDate.getMonth() + 1).padStart(2, "0");
        date = newDate.getDate();
        fullText = `${month}월 ${date}일 ${time} ${currHour}시~${
          currHour + 1
        }시`;
      } else {
        year = updateDate.substring(0, 4);
        month = updateDate.substring(5, 7);
        date = updateDate.substring(8);
        fullText = `${year}년 ${month}월 ${date}일`;
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
    switch (hours) {
      case "00":
        return "0시";
      case "06":
        return "6시";
      case "12":
        return "12시";
      case "18":
        return "18시";
      default:
        return "";
    }
  };

  const weekFormatter = (dates) => {
    switch (new Date(dates).getDay()) {
      case 0:
        return "일";
      case 1:
        return "월";
      case 2:
        return "화";
      case 3:
        return "수";
      case 4:
        return "목";
      case 5:
        return "금";
      case 6:
        return "토";
      default: // datetime is null, can't cast into Date()
        return "";
    }
  };

  const monthFormatter = (dates) => {
    const date = new Date(dates);
    switch (date.getDay()) {
      case 0:
        return date.getDate() + "일";
      default:
        return "";
    }
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
        length = 24; // 24시간
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
        length = 7; // 일주일
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
        length = daysInMonth.getDate(); // 해당 월의 일 수
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
              ? data[0].dates.substring(0, 13) + // 일주일 단위로 표시?  VS 존재하는 데이터 기준으로 표시?
                " ~ " +
                data[data.length - 1].dates.substring(6, 13)
              : data[0].dates.substring(0, 9),
        }));

        // dynamic data chart, custom labelFormatter없이 db에 저장된 날짜 형식과 갯수만큼 배열에 할당
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
          일
        </HeaderItem>
        <HeaderItem
          id="W"
          linkId={"W"}
          selectedTab={tab}
          onClick={onClickHeader}
        >
          주
        </HeaderItem>
        <HeaderItem
          id="M"
          linkId={"M"}
          selectedTab={tab}
          onClick={onClickHeader}
        >
          월
        </HeaderItem>
      </Header>
      <Hr />
      <TextBox>
        <Span ftSize="24px" ftColor="#fde25e">
          범위
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
                  // 2일 씩 줄어드는 현상 >> 한 객체의 똑같은 메모리 주소를 참조해서 그런 듯
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
            // 미래날짜는 조회 불가
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
              {gubun === "1" ? "비정상심박수 알림" : "과다호흡 알림"}
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
              {gubun === "1" ? "심박수" : "호흡수"}
              {"가 정상범위를 벗어났습니다"}
            </Span>
            <Span>강아지의 상태를 확인해주세요.</Span>
            <Span>{""}가 오랫동안 지속된다면</Span>
            <Span>{"OO"}질병을 의심할 수 있으니</Span>
            <Span>병원에 반드시 내원해주시기 바랍니다.</Span>
          </NoticeTextBox>
        )}

      <Hr />
    </Wrapper>
  );
}
export default Charts;
