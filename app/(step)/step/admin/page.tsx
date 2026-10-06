import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stepPath } from "@/lib/step/config";

export default async function StepAdminIndexPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    redirect(stepPath(host, "/dashboard/admin"));
}
