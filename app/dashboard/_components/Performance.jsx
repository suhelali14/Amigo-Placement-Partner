"use client";
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart, Tooltip, Legend, Cell } from "recharts";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Performance = () => {
  const [data, setData] = React.useState({});
  const [hoveredOption, setHoveredOption] = React.useState("interviews");
  const { user } = useUser();

  const fetchData = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`/api/interview/performance`, {
        params: { userEmail: user.emailAddresses[0].emailAddress },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [user]);

  const chartData = React.useMemo(() => {
    if (hoveredOption === "interviews") {
      return [
        { name: "User Interviews", value: data.totalInterviewsAttended || 0 },
        { name: "Total Interviews", value: data.totalInterviews || 0 },
      ];
    } else if (hoveredOption === "questions") {
      return [
        { name: "User Answers", value: data.totalQuestionsAnswered || 0 },
        { name: "Total Answers", value: data.totalQuestions || 0 },
      ];
    } else if (hoveredOption === "average") {
      return [{ name: "Average Rating", value: parseFloat(data.averageRating) || 0 }];
    }
  }, [data, hoveredOption]);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <Card className="w-full max-w-3xl shadow-lg rounded-lg">
        <CardHeader className="text-center  text-primary py-4 rounded-t-lg">
          <CardTitle className="text-2xl font-semibold">Performance Overview</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between items-center p-4">
          <div className="w-full sm:w-2/3 mb-4 sm:mb-0">
            <PieChart width={300} height={300}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={
                    hoveredOption === "average"
                      ? `${data.averageRating}`
                      : chartData[0]?.value
                  }
                  position="center"
                  className="text-xl"
                />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onMouseEnter={() => setHoveredOption("interviews")}
              className={`p-3 rounded-lg transition-colors duration-300 ${
                hoveredOption === "interviews"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <div>User Interviews: {data.totalInterviewsAttended}</div>
              <div>Platform Beat : {(data.interviewRatio)*100}%</div>
            </button>
            <button
              onMouseEnter={() => setHoveredOption("questions")}
              className={`p-3 rounded-lg transition-colors duration-300 ${
                hoveredOption === "questions"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <div>User Answers: {data.totalQuestionsAnswered}</div>
              <div>Platform Beat : {(data.answerRatio)*100}%</div>
            </button>
            <button
              onMouseEnter={() => setHoveredOption("average")}
              className={`p-3 rounded-lg transition-colors duration-300 ${
                hoveredOption === "average"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <div>Average Rating: {data.averageRating}</div>
            </button>
          </div>
        </CardContent>
        <CardFooter className="text-center bg-gray-50 py-4 rounded-b-lg">
          <div className="text-lg font-medium">
            Trending up by 5.2% this month <TrendingUp className="inline-block h-5 w-5" />
          </div>
          <div className="text-sm text-gray-500">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Performance;
