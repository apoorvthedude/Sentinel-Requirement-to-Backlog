import Layout from "../components/Layout";
import Card from "../components/Card";
import { buildSteps } from "../lib/steps";

export default function DraftPage() {
  return (
    <Layout steps={buildSteps("draft")}>
      <Card>
        <p>Jira Draft preview screen — to be built next.</p>
      </Card>
    </Layout>
  );
}
