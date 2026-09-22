import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { FileUpload } from "../../components/ui/FileUpload";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { driveService } from "../../services/driveService";

export default function DriveOperationsPanel({ driveId }) {
  const [shortlist, setShortlist] = useState(null);
  const [file, setFile] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [round, setRound] = useState({
    name: "",
    type: "INTERVIEW",
    sequence: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    driveService
      .getRounds(driveId)
      .then((response) => setRounds(response.items))
      .catch(() => {});
  }, [driveId]);

  const calculateShortlist = async () => {
    try {
      setShortlist(
        await driveService.admin.calculateShortlist(driveId, { criteria: [] }),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const uploadShortlist = async () => {
    if (!file) return;
    try {
      setShortlist(
        await driveService.admin.uploadCompanyShortlist(driveId, file),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const addRound = async () => {
    try {
      const created = await driveService.admin.createRound(driveId, {
        ...round,
        sequence: Number(round.sequence),
      });
      setRounds((current) => [...current, created]);
      setRound({ name: "", type: "INTERVIEW", sequence: "" });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shortlist management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-surface-500">
            Calculate a shortlist from valid applications or validate a company
            file.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={calculateShortlist}>
              Calculate shortlist
            </Button>
            {shortlist?.id && (
              <Button
                onClick={() =>
                  driveService.admin.publishShortlist(shortlist.id)
                }
              >
                Publish shortlist
              </Button>
            )}
          </div>
          {shortlist && (
            <p className="rounded-lg bg-primary-50 p-3 text-sm text-primary-900">
              Processed {shortlist.processed}; valid {shortlist.valid}; invalid{" "}
              {shortlist.invalid}.
            </p>
          )}
          <FileUpload
            file={file}
            onFileSelect={setFile}
            accept=".xlsx,.xls,.csv"
            label="Company shortlist"
            helperText="Excel or CSV file"
          />
          <Button variant="outline" onClick={uploadShortlist} disabled={!file}>
            Validate uploaded shortlist
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recruitment rounds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rounds.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-surface-200 p-3 text-sm"
            >
              <span className="font-medium">
                {item.sequence}. {item.name}
              </span>
              <span className="text-surface-500">{item.type}</span>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Round name"
              value={round.name}
              onChange={(event) =>
                setRound((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
            <Select
              value={round.type}
              onChange={(event) =>
                setRound((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
              options={[
                { value: "ASSESSMENT", label: "Assessment" },
                { value: "INTERVIEW", label: "Interview" },
                { value: "GROUP_DISCUSSION", label: "Group discussion" },
                { value: "HR", label: "HR" },
              ]}
            />
            <Input
              placeholder="Sequence"
              type="number"
              min="1"
              value={round.sequence}
              onChange={(event) =>
                setRound((current) => ({
                  ...current,
                  sequence: event.target.value,
                }))
              }
            />
          </div>
          <Button
            variant="outline"
            onClick={addRound}
            disabled={!round.name || !round.sequence}
          >
            Add recruitment round
          </Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
