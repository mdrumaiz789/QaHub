import Header from "./components/Header";
import OverviewCard from "./components/OverviewCard";
import StepsCard from "./components/StepsCard";
import CommentsCard from "./components/CommentsCard";
import HistoryCard from "./components/HistoryCard";

export default function TestCaseDetailsPage() {
  return (
    <div className="space-y-6 p-6">
      <Header />

      <OverviewCard />

      <StepsCard />

      <CommentsCard />

      <HistoryCard />
    </div>
  );
}