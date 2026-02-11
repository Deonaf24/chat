import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorCardProps = {
  message: string;
};

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
