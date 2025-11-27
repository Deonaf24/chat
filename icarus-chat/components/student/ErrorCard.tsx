import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorCardProps {
  title?: string;
  message: string;
}

export function ErrorCard({ title = "Something went wrong", message }: ErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  );
}
