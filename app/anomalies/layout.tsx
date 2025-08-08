import AnomaliesLayoutWrapper from "../../components/layout/anomalies-layout-wrapper";

export default function AnomaliesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnomaliesLayoutWrapper>
      {children}
    </AnomaliesLayoutWrapper>
  );
}