/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on } from "@triplex/bridge/client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Group, type Material, type Mesh, MeshBasicMaterial, Scene, ShaderMaterial } from "three";

const MaterialOverrideContext = createContext<MaterialOverride>("wireframe");

export function useMaterialOverride(): MaterialOverride {
  return useContext(MaterialOverrideContext);
}

export type MaterialOverride = "none" | "wireframe";

const wireframeMaterial = new MeshBasicMaterial({ color: 0xff_ff_ff, wireframe: true, wireframeLinewidth: 50 });
const originalMaterials = new WeakMap<Mesh, Material | Material[]>();

export function MaterialOverrideComponent({ children, resetCount }: { children: ReactNode, resetCount: number }) {
  const materialOverride = useContext(MaterialOverrideContext);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) { return; }
    // set wireframe material on all mesh children
    if (!(groupRef.current.parent instanceof Scene)) {
      return;
    }
    const sceneInstance = groupRef.current.parent;
    sceneInstance.getObjectsByProperty("isMesh", true).forEach((object) => {
      const mesh = object as Mesh;

      if (materialOverride === "none") {
        // restore original material
        if (originalMaterials.has(mesh)) {
          mesh.material = originalMaterials.get(mesh)!;
          originalMaterials.delete(mesh);
        }
        return;
      }

      // backup original material
      if (!originalMaterials.has(mesh)) {
        originalMaterials.set(mesh, mesh.material);
      }

      if (materialOverride === "wireframe" && !(mesh.material instanceof ShaderMaterial)) {
        // override with wireframe material
        mesh.material = wireframeMaterial;
      }
    });
  }, [resetCount, materialOverride]);

  return <>
    <group ref={groupRef}></group>
    {children}
  </>;
}

export function MaterialOverrideProvider({ children }: { children: ReactNode }) {
  const [materialOverride, setMaterialOverride] = useState<MaterialOverride>("none");

  useEffect(() => {
    return on("extension-point-triggered", (data) => {
      if (data.scope !== "scene") {
        return;
      }

      if (data.id === "material_override_none") {
        setMaterialOverride("none");
        return { handled: true };
      }

      if (data.id === "material_override_wireframe") {
        setMaterialOverride("wireframe");
        return { handled: true };
      }
    });
  }, []);

  return (
    <MaterialOverrideContext.Provider value={materialOverride}>
      {children}
    </MaterialOverrideContext.Provider>
  );
}
