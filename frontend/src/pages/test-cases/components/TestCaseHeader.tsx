import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

export default function TestCaseHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Test Cases
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage and organize your project's test cases.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Excel
        </Button>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Test Case
        </Button>
      </div>
    </div>
  );
}