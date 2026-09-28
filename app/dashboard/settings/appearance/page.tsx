import type { Metadata } from "next";

import Heading from "@/components/heading";
import { AppearanceTabs } from "@/components/appearance-tabs";

export const metadata: Metadata = {
    title: "Appearance settings",
};

export default function AppearancePage() {
    return (
        <div className="py-4 px-3">
            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />

                <AppearanceTabs />
            </div>
        </div>
    );
}