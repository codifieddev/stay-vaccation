import EditTransferContent from "./EditTransferContent";

export const metadata = {
  title: "Edit Transfer — Stay Vacation",
  description: "Modify an existing transfer route or pricing.",
};

export default function EditTransferPage({ params }: { params: { id: string } }) {
  return <EditTransferContent id={params.id} />;
}
