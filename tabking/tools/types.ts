export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType;
}

export interface TimestampConverterState {
  dateTime: string;
  secondTimestamp: string;
  millisecondTimestamp: string;
}

export interface PasswordGeneratorState {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  password: string;
}