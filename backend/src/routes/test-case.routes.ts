import { Router } from "express";
import { getTestCases, postTestCaseImport } from "../controllers/test-case.controller";
import { authenticate } from "../middleware/auth.middleware";

const testCaseRouter = Router({ mergeParams: true });

testCaseRouter.use(authenticate);
testCaseRouter.get("/", getTestCases);
testCaseRouter.post("/import", postTestCaseImport);

export default testCaseRouter;
