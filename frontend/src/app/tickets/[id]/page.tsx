import TicketDetailContent from "@/components/TicketDetailContent";

interface TicketDetailPageProps {
  params: { id: string };
}

const TicketDetailPage: React.FC<TicketDetailPageProps> = async ({
  params,
}) => {
  const { id } = params;
  return <TicketDetailContent id={id} />;
};

export default TicketDetailPage;
