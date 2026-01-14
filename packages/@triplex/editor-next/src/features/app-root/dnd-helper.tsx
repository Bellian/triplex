/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useDND } from "@triplex/lib";
import { useEffect, useState } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { handleVSCERequestResponse, onVSCE, requestVSCE, type ToVSCodeEvent } from "../../util/bridge";
import { useSceneContext } from "./context";
import { type UseDNDReturn } from "../../../../../lib/src/use-dnd";
import { Dialog } from "@triplex/ux";
import { on } from "@triplex/bridge/host";

export function DNDHelper({ children }: { children: React.ReactNode }) {
    const context = useSceneContext();

    const [errorData, setErrorData] = useState<{
        exportNames: string[];
        type: 'multiple-exports' | 'unknown';
    }>();
    const [retryData, setRetryData] = useState<ToVSCodeEvent['component-insert']>();

    const handleComponentInsert = async (_: string, data: ToVSCodeEvent['component-insert']) => {
        const result = await requestVSCE<UseDNDReturn, "component-insert">("component-insert", data);
        if (!result.success) {
            setErrorData({
                exportNames: result.error.multipleExports,
                type: result.error.type || 'unknown',
            });
            setRetryData(data);
        } else {
            setErrorData(undefined);
            setRetryData(undefined);
        }
    };

    const { bindingsDND } = useDND(handleComponentInsert, context.exportName, context.path);

    useEffect(() => {
        return on("component-insert", (data) => {
            handleComponentInsert("component-insert", data);
        });
    }, []);

    useEffect(() => {
        return onVSCE("request-response", (data) => {
            handleVSCERequestResponse(data);
        });
    }, []);

    const onDismissError = () => {
        setErrorData(undefined);
        setRetryData(undefined);
    };
    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const selectedExportName = (event.currentTarget as HTMLFormElement).elements[0] as HTMLSelectElement;
        const exportName = selectedExportName.value;
        if (retryData) {
            handleComponentInsert("component-insert", { ...retryData, exportName });
        }
        setErrorData(undefined);
        setRetryData(undefined);
    };

    return (
        <div className="fixed inset-0 flex select-none"
            {...bindingsDND}
        >
            {errorData && (
                <Dialog onDismiss={onDismissError}>
                    <form className="flex flex-col gap-2.5 p-2.5" onSubmit={onSubmit}>
                        <span className="text-heading select-none font-medium">
                            Which component do you want to add?
                        </span>
                        <select>
                            {errorData.exportNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <div className="flex flex-col gap-1.5">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                                Add Component
                            </button>
                            <button className="text-gray-600 px-4 py-2 rounded" onClick={onDismissError} type="button">
                                Cancel
                            </button>
                        </div>

                    </form>
                </Dialog>
            )}
            {children}
        </div>
    );
}

preloadSubscription("/scene/:path/:exportName", {
    exportName: window.triplex.initialState.exportName,
    path: window.triplex.initialState.path,
});
