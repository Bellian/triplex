/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { fg } from "@triplex/lib/fg";
import { useScreenView } from "@triplex/ux";
import { type DragEvent, useRef, useState } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";
import { AIChat } from "../ai-chat";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";
import { useSceneContext } from "./context";
import { Dialogs } from "./dialogs";
import { EmptyState } from "./empty-state";
import { Events } from "./events";

export function AppRoot() {
  useScreenView("app", "Screen");

  const context = useSceneContext();
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set to false if leaving the drop zone itself
    if (
      e.currentTarget === dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    const fileUris: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "string" && item.type === "text/uri-list") {
        item.getAsString((uri) => {
          fileUris.push(uri);
          sendVSCE("component-insert", {
            activeScene: context.exportName,
            componentPath: uri,
            scenePath: context.path,
          });
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 flex select-none">
      <Events />
      <Panels />
      <Dialogs />
      <div className="relative h-full w-full">
        <FloatingControls />
        <EmptyState />
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          ref={dropZoneRef}
          style={{
            height: "100%",
            padding: "16px",
            position: "relative",
            width: "100%",
          }}
        >
          {isDragging && (
            <div
              style={{
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                left: "0",
                minHeight: "200px",
                padding: "40px",
                pointerEvents: "all",
                position: "absolute",
                textAlign: "center",
                top: "0",
                transition: "all 0.3s ease",
                width: "100%",
                zIndex: "99",
              }}
            >
              <p>Drop Component here</p>
            </div>
          )}
          <iframe
            allow="cross-origin-isolated"
            className="h-full w-full"
            data-testid="scene"
            id="scene"
            src={`http://localhost:${window.triplex.env.ports.client}/scene`}
          />
        </div>
      </div>
      {fg("ai_chat") && <AIChat />}
    </div>
  );
}

preloadSubscription("/scene/:path/:exportName", {
  exportName: window.triplex.initialState.exportName,
  path: window.triplex.initialState.path,
});
