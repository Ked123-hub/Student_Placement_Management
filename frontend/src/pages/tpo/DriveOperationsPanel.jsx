import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  UploadCloud,
  Users,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { FileUpload } from "../../components/ui/FileUpload";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select } from "../../components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Tabs } from "../../components/ui/Tabs";
import { applicationService } from "../../services/applicationService";
import { driveService } from "../../services/driveService";

const tabs = [
  { id: "shortlist", label: "Shortlist", icon: ClipboardList },
  { id: "rounds", label: "Recruitment operations", icon: ClipboardCheck },
];

const roundTypes = [
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "GROUP_DISCUSSION", label: "Group discussion" },
  { value: "HR", label: "HR" },
];

export default function DriveOperationsPanel({ driveId }) {
  const [activeTab, setActiveTab] = useState("shortlist");
  const [error, setError] = useState("");

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Recruitment operations</CardTitle>
        <p className="text-sm text-surface-500">
          Manage candidates and progress the drive through its recruitment
          stages.
        </p>
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <p className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {error}
          </p>
        )}
        {activeTab === "shortlist" ? (
          <ShortlistWorkspace driveId={driveId} onError={setError} />
        ) : (
          <RecruitmentWorkspace driveId={driveId} onError={setError} />
        )}
      </CardContent>
    </Card>
  );
}

function ShortlistWorkspace({ driveId, onError }) {
  const [shortlist, setShortlist] = useState(null);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    driveService.admin
      .getShortlistCandidates(driveId)
      .then(setShortlist)
      .catch((requestError) => onError(requestError.message));
  }, [driveId, onError]);

  const calculate = async () => {
    setIsLoading(true);
    try {
      setShortlist(
        await driveService.admin.calculateShortlist(driveId, { criteria: [] }),
      );
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const upload = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      setShortlist({
        ...(await driveService.admin.uploadCompanyShortlist(driveId, file)),
        candidates: shortlist?.candidates ?? [],
        status: "DRAFT",
      });
      setFile(null);
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const publish = async () => {
    if (!shortlist?.shortlistId && !shortlist?.id) return;
    setIsLoading(true);
    try {
      const result = await driveService.admin.publishShortlist(
        shortlist.shortlistId ?? shortlist.id,
      );
      setShortlist((current) => ({ ...current, ...result }));
      setPublishOpen(false);
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const candidates = (shortlist?.candidates ?? []).filter(
    (candidate) =>
      (!status || candidate.status === status) &&
      `${candidate.name} ${candidate.prn} ${candidate.branch}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Processed"
          value={shortlist?.processed ?? candidates.length}
        />
        <Metric
          label="Valid"
          value={shortlist?.valid ?? candidates.length}
          tone="success"
        />
        <Metric label="Invalid" value={shortlist?.invalid ?? 0} tone="danger" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <Button variant="secondary" onClick={calculate} isLoading={isLoading}>
          <CheckCircle2 size={16} />
          Calculate shortlist
        </Button>
        <Button
          onClick={() => setPublishOpen(true)}
          disabled={!shortlist || shortlist.status === "PUBLISHED"}
        >
          Publish shortlist
        </Button>
        <FileUpload
          file={file}
          onFileSelect={setFile}
          accept=".xlsx,.xls,.csv"
          label=""
          helperText="Excel or CSV"
        />
      </div>

      {file && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 p-3">
          <p className="text-sm text-primary-900">
            Ready to validate {file.name}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={upload}
            isLoading={isLoading}
          >
            <UploadCloud size={15} />
            Validate upload
          </Button>
        </div>
      )}

      {shortlist?.issues?.length > 0 && <IssueList issues={shortlist.issues} />}

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search shortlisted candidates"
        />
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={[
            { value: "SHORTLISTED", label: "Shortlisted" },
            { value: "PENDING", label: "Pending" },
          ]}
          placeholder="All statuses"
        />
      </div>

      {candidates.length ? (
        <CandidateTable candidates={candidates} />
      ) : (
        <EmptyPanel
          icon={Users}
          text="No shortlist candidates match these filters."
        />
      )}

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish shortlist?"
        description="Publishing makes this candidate list visible to students and can trigger notifications."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} isLoading={isLoading}>
              Publish shortlist
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600">
          Review the valid candidate count before publishing. Invalid rows will
          remain excluded.
        </p>
      </Modal>
    </div>
  );
}

function RecruitmentWorkspace({ driveId, onError }) {
  const [rounds, setRounds] = useState([]);
  const [activeRoundId, setActiveRoundId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [round, setRound] = useState({
    name: "",
    type: "INTERVIEW",
    sequence: "",
  });
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    driveService
      .getRounds(driveId)
      .then((response) => {
        setRounds(response.items);
        setActiveRoundId(response.items[0]?.id ?? "");
      })
      .catch((requestError) => onError(requestError.message));
  }, [driveId, onError]);

  useEffect(() => {
    if (!activeRoundId) return;
    driveService.admin
      .getRoundParticipants(activeRoundId)
      .then((response) => setParticipants(response.items))
      .catch((requestError) => onError(requestError.message));
  }, [activeRoundId, onError]);

  const addRound = async () => {
    setIsSaving(true);
    try {
      const created = await driveService.admin.createRound(driveId, {
        ...round,
        sequence: Number(round.sequence),
      });
      setRounds((current) => [...current, created]);
      setActiveRoundId(created.id);
      setRound({ name: "", type: "INTERVIEW", sequence: "" });
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateParticipant = (applicationId, field, value) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.applicationId === applicationId
          ? { ...participant, [field]: value }
          : participant,
      ),
    );
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      await driveService.admin.recordAttendance(activeRoundId, {
        attendance: participants.map(({ applicationId, attendance }) => ({
          applicationId,
          status: attendance,
        })),
      });
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveResults = async () => {
    setIsSaving(true);
    try {
      await driveService.admin.recordResults(activeRoundId, {
        results: participants.map(({ applicationId, result }) => ({
          applicationId,
          result,
        })),
      });
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const recordFinalResult = async (applicationId, result) => {
    setIsSaving(true);
    try {
      await applicationService.admin.recordFinalResult(applicationId, result);
      updateParticipant(applicationId, "finalResult", result);
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const visibleParticipants = participants.filter((participant) =>
    `${participant.name} ${participant.prn}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Select
          value={activeRoundId}
          onChange={(event) => setActiveRoundId(event.target.value)}
          options={rounds.map((item) => ({
            value: item.id,
            label: `${item.sequence}. ${item.name}`,
          }))}
          placeholder="Select a round"
        />
        <Input
          placeholder="Search participant"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Users size={16} />
          {visibleParticipants.length} participants
        </div>
      </div>
      {activeRoundId && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={saveAttendance}
            isLoading={isSaving}
          >
            <Check size={16} />
            Save attendance
          </Button>
          <Button variant="outline" onClick={saveResults} isLoading={isSaving}>
            <CheckCircle2 size={16} />
            Save round results
          </Button>
        </div>
      )}
      {activeRoundId ? (
        <ParticipantTable
          participants={visibleParticipants}
          onUpdate={updateParticipant}
          onFinalResult={recordFinalResult}
        />
      ) : (
        <EmptyPanel
          icon={ClipboardCheck}
          text="Select a round to manage participants."
        />
      )}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Add recruitment round</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input
            placeholder="Round name"
            value={round.name}
            onChange={(event) =>
              setRound((current) => ({ ...current, name: event.target.value }))
            }
          />
          <Select
            value={round.type}
            onChange={(event) =>
              setRound((current) => ({ ...current, type: event.target.value }))
            }
            options={roundTypes}
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
          <Button
            variant="outline"
            onClick={addRound}
            disabled={!round.name || !round.sequence}
            isLoading={isSaving}
          >
            Add round
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CandidateTable({ candidates }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-surface-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>CGPA</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.applicationId}>
              <TableCell>
                <p className="font-medium text-surface-900">{candidate.name}</p>
                <p className="text-xs text-surface-500">{candidate.prn}</p>
              </TableCell>
              <TableCell>{candidate.branch}</TableCell>
              <TableCell>{candidate.cgpa.toFixed(1)}</TableCell>
              <TableCell>
                <Badge>{candidate.source.replaceAll("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    candidate.status === "SHORTLISTED" ? "success" : "warning"
                  }
                >
                  {candidate.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ParticipantTable({ participants, onUpdate, onFinalResult }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-surface-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Participant</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Round result</TableHead>
            <TableHead>Final result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.applicationId}>
              <TableCell>
                <p className="font-medium text-surface-900">
                  {participant.name}
                </p>
                <p className="text-xs text-surface-500">{participant.prn}</p>
              </TableCell>
              <TableCell>
                <Select
                  value={participant.attendance}
                  onChange={(event) =>
                    onUpdate(
                      participant.applicationId,
                      "attendance",
                      event.target.value,
                    )
                  }
                  options={[
                    { value: "PRESENT", label: "Present" },
                    { value: "ABSENT", label: "Absent" },
                    { value: "PENDING", label: "Pending" },
                  ]}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={participant.result}
                  onChange={(event) =>
                    onUpdate(
                      participant.applicationId,
                      "result",
                      event.target.value,
                    )
                  }
                  options={[
                    { value: "PASSED", label: "Passed" },
                    { value: "FAILED", label: "Failed" },
                    { value: "PENDING", label: "Pending" },
                  ]}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={
                      participant.finalResult === "SELECTED"
                        ? "primary"
                        : "outline"
                    }
                    onClick={() =>
                      onFinalResult(participant.applicationId, "SELECTED")
                    }
                  >
                    Select
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      participant.finalResult === "REJECTED"
                        ? "danger"
                        : "ghost"
                    }
                    onClick={() =>
                      onFinalResult(participant.applicationId, "REJECTED")
                    }
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Metric({ label, value, tone = "default" }) {
  return (
    <div className="rounded-lg border border-surface-200 bg-surface-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-surface-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-danger" : "text-surface-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
function IssueList({ issues }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">Upload issues</p>
      <div className="mt-2 space-y-1 text-xs text-amber-800">
        {issues.map((issue) => (
          <p key={`${issue.row}-${issue.prn}`}>
            Row {issue.row}: {issue.prn} · {issue.code}
          </p>
        ))}
      </div>
    </div>
  );
}
function EmptyPanel({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center text-sm text-surface-500">
      <Icon size={22} className="text-surface-400" />
      {text}
    </div>
  );
}
