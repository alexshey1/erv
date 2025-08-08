"use client";

import { AnomalyContent } from "@/components/views/anomaly-content";

export default function AnomalyContentWrapper({
  user,
  cultivations,
}: {
  user: any;
  cultivations: any;
}) {
  return <AnomalyContent user={user} cultivations={cultivations} />;
}
