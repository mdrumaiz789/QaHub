import TestCaseHeader from "./components/TestCaseHeader";
import TestCaseFilters from "./components/TestCaseFilters";
import TestCaseTable from "./components/TestCaseTable";
import { testCases } from "./mock/testCases";

export default function TestCasesPage() {
  return (
    <div className="space-y-6 p-6">

      <TestCaseHeader />

      <TestCaseFilters />

      <TestCaseTable testCases={testCases} />

    </div>
  );
}