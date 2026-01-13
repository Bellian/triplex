/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { fg } from "@triplex/lib/fg";
import { useDND } from "@triplex/lib";
import { useScreenView } from "@triplex/ux";
import { useEffect } from "react";
import { preloadSubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";
import { AIChat } from "../ai-chat";
import { FloatingControls } from "../floating-controls";
import { Panels } from "../panels";
import { useSceneContext } from "./context";
import { Dialogs } from "./dialogs";
import { EmptyState } from "./empty-state";
import { Events } from "./events";
import { on } from "@triplex/bridge/host";

export function AppRoot() {
  useScreenView("app", "Screen");

  const context = useSceneContext();
  const { bindingsDND } = useDND(sendVSCE, context.exportName, context.path);

  useEffect(() => {
    return on("component-insert", (data) => {
      sendVSCE("component-insert", data);
    });
  }, []);

  return (
    <div className="fixed inset-0 flex select-none"
      {...bindingsDND}
    >
      <Events />
      <Panels />
      <Dialogs />
      <div className="relative h-full w-full">
        <FloatingControls />
        <EmptyState />
        <iframe
          allow="cross-origin-isolated"
          className="h-full w-full"
          data-testid="scene"
          id="scene"
          src={`http://localhost:${window.triplex.env.ports.client}/scene`}
        />
      </div>
      {fg("ai_chat") && <AIChat />}
    </div>
  );
}

preloadSubscription("/scene/:path/:exportName", {
  exportName: window.triplex.initialState.exportName,
  path: window.triplex.initialState.path,
});
