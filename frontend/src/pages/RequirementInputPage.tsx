import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ChaseLoader from "../components/ChaseLoader";
import { buildSteps } from "../lib/steps";
import { ingest } from "../api/client";
import "./RequirementInputPage.css";

export default function RequirementInputPage() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await ingest(text);
      navigate(`/analyze/${data.thread_id}`, { state: { ingestResponse: data } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <Layout steps={buildSteps("input")}>
      <div className="requirement-input">
        {isSubmitting ? (
          <Card>
            <ChaseLoader />
          </Card>
        ) : (
          <>
            <div className="requirement-input__intro">
              <h1>Describe the requirement</h1>
              <p>
                Write the requirement in plain language. Sentinel will analyze it against your
                existing backlog and knowledge graph before drafting anything.
              </p>
            </div>

            <Card>
              <form onSubmit={handleSubmit} className="requirement-input__form">
                <label htmlFor="requirement-text" className="requirement-input__label">
                  Requirement text
                </label>
                <textarea
                  id="requirement-text"
                  className="requirement-input__textarea"
                  rows={9}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="As a user, I want to..."
                  required
                />
                <div className="requirement-input__actions">
                  <span className="requirement-input__hint">
                    Step 1 of 4 — nothing is sent to Jira yet
                  </span>
                  <Button type="submit" disabled={!text.trim()}>
                    AI Analyze
                  </Button>
                </div>
                {error && <p className="requirement-input__error">Error: {error}</p>}
              </form>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
