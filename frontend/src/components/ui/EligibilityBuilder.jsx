import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import { Input } from "./Input";
import { Select } from "./Select";
import { ELIGIBILITY_FIELDS } from "../../constants/eligibility";

function createCriterion() {
  const defaultField = ELIGIBILITY_FIELDS[0];

  return {
    id: crypto.randomUUID(),
    field: defaultField.value,
    operator:
      defaultField.operators[1]?.value ??
      defaultField.operators[0].value,
    value: "",
  };
}

export function EligibilityBuilder({
  value = [],
  onChange,
  disabled = false,
}) {
  const criteria = value.length ? value : [createCriterion()];

  const fieldOptions = useMemo(
    () =>
      ELIGIBILITY_FIELDS.map(
        ({ label, value: fieldValue }) => ({
          label,
          value: fieldValue,
        }),
      ),
    [],
  );

  const updateCriterion = (id, patch) => {
    const next = criteria.map((criterion) => {
      if (criterion.id !== id) return criterion;

      const updated = { ...criterion, ...patch };

      if (patch.field) {
        const field = ELIGIBILITY_FIELDS.find(
          (item) => item.value === patch.field,
        );

        updated.operator =
          field?.operators[0]?.value ?? "";
        updated.value = "";
      }

      return updated;
    });

    onChange?.(next);
  };

  const addCriterion = () =>
    onChange?.([...criteria, createCriterion()]);

  const removeCriterion = (id) => {
    if (criteria.length === 1) return;

    onChange?.(
      criteria.filter((criterion) => criterion.id !== id),
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-surface-900">
            Eligibility Criteria
          </h3>

          <p className="mt-1 text-sm text-surface-500">
            Define the academic and branch requirements students
            must satisfy.
          </p>
        </div>

        <div className="space-y-3">
          {criteria.map((criterion) => {
            const field = ELIGIBILITY_FIELDS.find(
              (item) => item.value === criterion.field,
            );

            const operatorOptions = field?.operators ?? [];

            const isListOperator =
              criterion.operator === "IN" ||
              criterion.operator === "NOT_IN";

            return (
              <div
                key={criterion.id}
                className="grid gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 md:grid-cols-[1.2fr_0.9fr_1.2fr_auto]"
              >
                <Select
                  label="Field"
                  value={criterion.field}
                  options={fieldOptions}
                  onChange={(event) =>
                    updateCriterion(criterion.id, {
                      field: event.target.value,
                    })
                  }
                  disabled={disabled}
                />

                <Select
                  label="Operator"
                  value={criterion.operator}
                  options={operatorOptions}
                  onChange={(event) =>
                    updateCriterion(criterion.id, {
                      operator: event.target.value,
                    })
                  }
                  disabled={disabled}
                />

                <Input
                  label="Value"
                  type={
                    field?.type === "number"
                      ? "number"
                      : "text"
                  }
                  value={
                    Array.isArray(criterion.value)
                      ? criterion.value.join(", ")
                      : criterion.value
                  }
                  placeholder={
                    isListOperator
                      ? "CSE, IT"
                      : "Enter value"
                  }
                  onChange={(event) =>
                    updateCriterion(criterion.id, {
                      value: event.target.value,
                    })
                  }
                  disabled={disabled}
                />

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeCriterion(criterion.id)
                    }
                    disabled={
                      disabled || criteria.length === 1
                    }
                    className="rounded-lg p-2.5 text-surface-400 transition hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger/20 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove eligibility criterion"
                  >
                    <Trash2
                      size={18}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {isListOperator && (
                  <p className="text-xs text-surface-500 md:col-span-4">
                    Enter multiple values separated by commas.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCriterion}
          disabled={disabled}
        >
          <Plus size={16} aria-hidden="true" />
          Add Criterion
        </Button>
      </CardContent>
    </Card>
  );
}