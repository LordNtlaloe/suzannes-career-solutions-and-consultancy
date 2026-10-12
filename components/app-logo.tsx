import AppLogoIcon from "@/components/app-logo-icon";

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-0 bg-blue-dark text-white">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                    General
                </span>
                <span className="truncate text-[11px] text-blue-light">Project</span>
            </div>
        </>
    );
}