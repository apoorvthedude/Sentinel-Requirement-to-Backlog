import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import StatCard from "../components/StatCard";
import ActivityList from "../components/ActivityList";
import { MOCK_STAT_CARDS, MOCK_ACTIVITY_ITEMS } from "../mockData";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-page__header">
          <div>
            <h1>Welcome back, Amit</h1>
            <p>Here&apos;s what Sentinel has been doing.</p>
          </div>
          <Button onClick={() => navigate("/")}>New Requirement</Button>
        </div>

        <div className="dashboard-page__stats">
          {MOCK_STAT_CARDS.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <ActivityList items={MOCK_ACTIVITY_ITEMS} />
      </div>
    </Layout>
  );
}
