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
  ReferenceLine,
} from "recharts";

export const HomeBarChart = ({
  chartData,
  barColor,
  abnormalBarColor,
  lines, // horizontal border
  yDomain,
  yTicks,
  dataFormatter,
  interval,
  visibleAbnormal,
  barClick,
  diagramClick,
  xTicks,
}) => {
  // console.log("****************************");
  // console.log("drawing chart");
  // console.log("****************************");
  // console.log("xTicks >>>    ", xTicks);
  return (
    // ReponsiveContainer width="100%"로 하면 Home화면 차트컴포넌트 좌측 라벨컴포넌트가 부모컴포넌트 밖으로 나가는 현상.. Why?
    <ResponsiveContainer width="99%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={chartData}
        margin={{
          top: 10,
          right: 0,
          left: 15,
          bottom: 0,
        }}
        style={{ backgroundColor: "#32313A" }}
        onClick={diagramClick}
      >
        <CartesianGrid />
        <XAxis
          dataKey="updateDate"
          xAxisId={0}
          // tick={true}
          ticks={xTicks}
          tickFormatter={dataFormatter}
          // tickCount={6}
          // interval={interval}
        />

        {visibleAbnormal && <XAxis dataKey="updateDate" xAxisId={1} hide />}
        {visibleAbnormal && <XAxis dataKey="updateDate" xAxisId={2} hide />}

        <YAxis
          type="number"
          domain={yDomain}
          ticks={yTicks}
          interval={0}
          orientation="right"
        />
        {/** trigger="click" */}
        <Tooltip />
        {lines.map((value) => {
          return (
            <ReferenceLine key={value} y={value} label="" stroke="#FDE25E" />
          );
        })}
        {/* <Legend /> */}
        <Bar
          xAxisId={0}
          dataKey="measures"
          fill={barColor}
          onClick={barClick}
        />

        {/* {abnormalData.map((item, idx) => {
          return (
            <Bar
              xAxisId={idx + 1}
              dataKey={item.dataKey}
              fill={abnormalBarColor}
            />
          );
        })} */}

        {visibleAbnormal && (
          <Bar
            onClick={barClick}
            xAxisId={1}
            dataKey="minMeasures"
            fill={abnormalBarColor}
          />
        )}
        {visibleAbnormal && (
          <Bar
            onClick={barClick}
            xAxisId={2}
            dataKey="maxMeasures"
            fill={abnormalBarColor}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
