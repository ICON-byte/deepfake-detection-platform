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
      
      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Forensic Data Registry</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Metric Parameter</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Score</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden md:table-cell">Forensic Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, i) => {
                const isWarning = item.value > 70;
                const statusColor = isWarning 
                  ? (color === "#6699ff" ? "text-red-600 bg-red-50 border-red-100" : "text-amber-600 bg-amber-50 border-amber-100") 
                  : "text-emerald-600 bg-emerald-50 border-emerald-100";
                
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.label}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-black ${isWarning ? (color === "#6699ff" ? "text-red-600" : "text-amber-600") : "text-emerald-600"}`}>
                        {item.value}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusColor}`}>
                        {isWarning ? "SUSPICIOUS" : "CLEAN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                        "{item.description}"
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
