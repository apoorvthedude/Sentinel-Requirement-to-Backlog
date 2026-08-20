import { useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";
import ReadOnlyField from "../components/ReadOnlyField";
import SidebarField from "../components/SidebarField";
import "./SettingsPage.css";

export default function SettingsPage() {
  const [defaultIssueType, setDefaultIssueType] = useState("Story");

  return (
    <Layout>
      <div className="settings-page">
        <h1>Settings</h1>
        <p>Connection and defaults for story generation.</p>

        <Card className="settings-page__card">
          <div className="settings-page__row">
            <span className="settings-page__row-title">Jira connection</span>
            <StatusPill label="Connected" tone="success" />
          </div>
          <ReadOnlyField label="Jira site URL" value="https://acme.atlassian.net" />
          <ReadOnlyField label="Default project key" value="PROJ" />
          <Button variant="secondary" className="settings-page__reconnect">
            Reconnect
          </Button>
        </Card>

        <Card className="settings-page__card">
          <span className="settings-page__row-title">Defaults</span>
          <SidebarField
            label="Default issue type"
            value={defaultIssueType}
            onChange={setDefaultIssueType}
            options={["Story", "Task", "Epic"]}
          />
        </Card>
      </div>
    </Layout>
  );
}
