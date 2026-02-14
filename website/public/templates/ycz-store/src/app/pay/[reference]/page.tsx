import PaymentScreen from "./PaymentScreen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <PaymentScreen reference={reference} />;
}
