import { useEffect, useState } from "react";
import { Building2, Pencil, Plus } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { SearchBar } from "../../components/ui/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { adminService } from "../../services/adminService";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(null);
  const [search, setSearch] = useState("");
  const [editingCompany, setEditingCompany] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCompanies = () =>
    adminService
      .listCompanies()
      .then(setCompanies)
      .catch((requestError) => setError(requestError.message));
  useEffect(() => {
    loadCompanies();
  }, []);

  if (!companies && !error)
    return <LoadingScreen message="Loading companies..." />;
  if (error)
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );

  const visibleCompanies = companies.items.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()),
  );

  const saveCompany = async (payload) => {
    setIsSaving(true);
    try {
      if (editingCompany?.id)
        await adminService.updateCompany(editingCompany.id, payload);
      else await adminService.createCompany(payload);
      setEditingCompany(null);
      await loadCompanies();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary-600">
            Company management
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">
            Companies
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Maintain the company master used by placement drives.
          </p>
        </div>
        <Button onClick={() => setEditingCompany({ name: "" })}>
          <Plus size={17} />
          Add company
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search companies"
          />
        </CardContent>
      </Card>
      {visibleCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Add a company or change the search."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Drives</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {company.name}
                    </TableCell>
                    <TableCell>{company.drives}</TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => setEditingCompany(company)}
                        className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-primary-600"
                        aria-label={`Edit ${company.name}`}
                      >
                        <Pencil size={17} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      <CompanyModal
        key={editingCompany?.id ?? "new-company"}
        company={editingCompany}
        isSaving={isSaving}
        onClose={() => setEditingCompany(null)}
        onSave={saveCompany}
      />
    </div>
  );
}

function CompanyModal({ company, isSaving, onClose, onSave }) {
  const [name, setName] = useState(company?.name ?? "");
  return (
    <Modal
      open={Boolean(company)}
      onClose={onClose}
      title={company?.id ? "Edit company" : "Add company"}
      description="Company details can be reused across multiple drives."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={isSaving}
            disabled={!name.trim()}
            onClick={() => onSave({ name: name.trim() })}
          >
            {company?.id ? "Save changes" : "Add company"}
          </Button>
        </>
      }
    >
      <Input
        label="Company name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. ABC Technologies"
      />
    </Modal>
  );
}
