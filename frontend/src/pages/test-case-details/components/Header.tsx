import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold">MIR_001</h1>

        <p className="text-slate-500 mt-1">
          Settings • Ready
        </p>
      </div>

      <Button>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
    </div>
  );
}