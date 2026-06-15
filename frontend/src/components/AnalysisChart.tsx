import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AnalysisChartProps {
  data: {
    label: string;
    value: number;
    description: string;
  }[];
  color?: string;
}

export function AnalysisChart({ data, color = "#6699ff" }: AnalysisChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    description: item.description,
  }));

  const chartConfig = {
    value: {
      label: "Score",
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full mt-4 mb-2">
      <div className="h-[280px] w-full">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
              right: 60,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e2e8f0" verticalFill={["#f8fafc", "#ffffff"]} fillOpacity={0.5} />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-[11px] font-bold text-slate-700"
              width={100}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(102, 153, 255, 0.05)", radius: 10 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={34}>
              {chartData.map((entry, index) => {
                const isWarning = entry.value > 70;
                let fillColor = "#10b981"; // Green (Healthy/Real)
                if (isWarning) {
                  fillColor = color === "#6699ff" ? "#ef4444" : "#f59e0b"; // Red (Deepfake) or Amber (AI Text)
                }
                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
              <LabelList
                dataKey="value"
                position="right"
                offset={15}
                className="fill-slate-900 font-black text-sm"
                formatter={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 border-t border-slate-100 pt-8">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col relative">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2 w-2 rounded-full ${item.value > 70 ? (color === "#6699ff" ? "bg-red-500" : "bg-amber-500") : "bg-emerald-500"}`} />
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900">{item.label}</p>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-medium pl-4 border-l-2 border-slate-100 italic">
              "{item.description}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
