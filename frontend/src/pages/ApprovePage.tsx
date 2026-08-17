import Layout from "../components/Layout";
import Card from "../components/Card";
import { buildSteps } from "../lib/steps";

export default function ApprovePage() {
  return (
    <Layout steps={buildSteps("approve")}>
      <Card>
        <p>Story approval card screen — to be built next.</p>
      </Card>
    </Layout>
  );
}
