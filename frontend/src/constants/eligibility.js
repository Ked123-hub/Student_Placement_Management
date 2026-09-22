const numericOperators = [
  { value: "GREATER_THAN", label: ">" },
  {
    value: "GREATER_THAN_EQUAL",
    label: ">=",
  },
  { value: "LESS_THAN", label: "<" },
  {
    value: "LESS_THAN_EQUAL",
    label: "<=",
  },
  { value: "EQUAL", label: "=" },
];

export const ELIGIBILITY_FIELDS = [
  {
    value: "CGPA",
    label: "CGPA",
    type: "number",
    operators: numericOperators,
  },
  {
    value: "PERCENTAGE_10TH",
    label: "10th Percentage",
    type: "number",
    operators: numericOperators,
  },
  {
    value: "PERCENTAGE_12TH",
    label: "12th Percentage",
    type: "number",
    operators: numericOperators,
  },
  {
    value: "PERCENTAGE_DIPLOMA",
    label: "Diploma Percentage",
    type: "number",
    operators: numericOperators,
  },
  {
    value: "BACKLOGS",
    label: "Backlogs",
    type: "number",
    operators: numericOperators,
  },
  {
    value: "YEAR",
    label: "Year",
    type: "number",
    operators: [
      { value: "EQUAL", label: "=" },
      {
        value: "GREATER_THAN_EQUAL",
        label: ">=",
      },
      {
        value: "LESS_THAN_EQUAL",
        label: "<=",
      },
    ],
  },
  {
    value: "BRANCH",
    label: "Branch",
    type: "text",
    operators: [
      { value: "EQUAL", label: "=" },
      { value: "IN", label: "IN" },
      { value: "NOT_IN", label: "NOT IN" },
    ],
  },
];