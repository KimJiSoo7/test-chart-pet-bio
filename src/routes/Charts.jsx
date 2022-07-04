import styled from "styled-components";
import { useParams } from "react-router-dom";
import { URL_WEB_SERVER } from "../global/url";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
const axios = require("axios").default;

const DEVICE_ID = "1234567890";

const Wrapper = styled.div`
  width: 100%;
  height: 50vh;
`;

function Charts() {
  const [data, setData] = useState([]);
  // web_server_URL: http://localhost:3000/charts/heart
  const { type } = useParams(); // type: heart

  async function getHeartsRates() {
    try {
      console.log(`${URL_WEB_SERVER}/${type}`);
      const response = await axios.get(`${URL_WEB_SERVER}/${type}`, {
        device_id: DEVICE_ID,
      });
      setData(response.data[0]);
    } catch (error) {
      console.error(error);
    }
  }
  // getHeartsRates(type, DEVICE_ID);

  useEffect(() => {
    getHeartsRates();
  }, []);

  let tempArr = [];
  console.log("data>> ", data);

  data.forEach((item) => {
    tempArr.push({
      heartRates: [item.minVal, item.maxVal],
      abnormal_min_heartRates: item.minVal <= 70 ? [item.minVal, 70] : null,
      abnormal_max_heartRates: item.maxVal >= 120 ? [120, item.maxVal] : null,
      updateDate: item.update_date,
    });
  });
  console.log("tempArr>> ", tempArr);

  return (
    <Wrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          // barGap={"-73.5%"}
          // barCategoryGap={10}
          width={500}
          height={300}
          data={tempArr}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="updateDate"
            xAxisId={0}
            ticks={[
              "2022-07-04T02:02:27.000Z",
              "2022-07-04T02:02:54.000Z",
              "2022-07-04T02:03:24.000Z",
              "2022-07-04T02:03:54.000Z",
              "2022-07-04T02:04:24.000Z",
            ]}
          />
          <XAxis dataKey="abnormal_min_heartRates" xAxisId={1} hide />
          <XAxis dataKey="abnormal_max_heartRates" xAxisId={2} hide />
          <YAxis
            type="number"
            domain={[0, 200]}
            tick={[0, 100, 200]}
            interval={0}
          />
          <Tooltip />
          <Legend />
          <Bar xAxisId={0} dataKey="heartRates" fill="#cc1a4f" />
          <Bar xAxisId={1} dataKey="abnormal_min_heartRates" fill="#82ca9d" />
          <Bar xAxisId={2} dataKey="abnormal_max_heartRates" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Wrapper>
  );
}
export default Charts;
