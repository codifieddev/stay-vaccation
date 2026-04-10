import EditTransferContent from "./EditTransferContent";

export const metadata = {
  title: "Edit Transfer — Stay Vacation",
  description: "Modify an existing transfer route or pricing.",
};

// Next.js 15+: params is a Promise — must be an async server component
export default async function EditTransferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditTransferContent id={id} />;
}
