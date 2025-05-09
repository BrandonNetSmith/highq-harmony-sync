
export interface ApiConfigForm {
  ghlApiKey: string;
  intakeqApiKey: string;
}

export interface TestResult {
  success: boolean;
  message: string | null;
}

export interface TestingStatus {
  ghl: boolean;
  intakeq: boolean;
}

export interface TestResults {
  ghl: TestResult | null;
  intakeq: TestResult | null;
}
