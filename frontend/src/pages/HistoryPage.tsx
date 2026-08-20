import Layout from "../components/Layout";
import HistoryTable from "../components/HistoryTable";
import { MOCK_HISTORY_ITEMS } from "../mockData";
import "./HistoryPage.css";

export default function HistoryPage() {
  return (
    <Layout>
      <div className="history-page">
        <h1>History</h1>
        <p>All requirements processed through Sentinel.</p>
        <HistoryTable rows={MOCK_HISTORY_ITEMS} />
      </div>
    </Layout>
  );
}
