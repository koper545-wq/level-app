import { AreaDetail } from "@/components/areas/area-detail";

export default function AreaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <AreaDetail areaId={params.id} />;
}
