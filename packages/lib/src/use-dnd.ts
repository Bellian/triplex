/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DragEvent, useRef, useState } from "react";

export function useDND(sendCallback: any, activeScene: string, scenePath: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!containerRef.current || containerRef.current.contains(e.relatedTarget as Node)) {
            return;
        }
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!containerRef.current || !containerRef.current.contains(e.target as Node)) {
            return;
        }
        const items = e.dataTransfer.items;
        const fileUris: string[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "string" && item.type === "text/uri-list") {
                item.getAsString((uri) => {
                    fileUris.push(uri);
                    sendCallback("component-insert", {
                        activeScene,
                        componentPath: uri,
                        scenePath,
                    });
                });
            }
        }
    };

    return {
        bindingsDND: {
            onDragEnterCapture: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDragOverCapture: handleDragOver,
            onDropCapture: handleDrop,
            ref: containerRef,
        },
        containerRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        isDragging
    };
}


export default useDND;
