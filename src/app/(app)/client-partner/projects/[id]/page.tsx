"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  return (
    <div className="p-4 md:p-6">
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-2">Project Details</h1>
        <p className="text-sm text-muted-foreground">Project ID: {id}</p>
        <div className="mt-4 text-sm text-muted-foreground">This is a placeholder page.</div>
      </Card>
    </div>
  );
}



