/** Shell settings shared by every step: property name, progress and back. */
export interface StepFrameProps {
  propertyName: string;
  progress: { step: number; total: number };
  onBack: () => void;
  preview: boolean;
}
