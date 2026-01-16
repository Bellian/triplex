/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Link2Icon,
} from "@radix-ui/react-icons";
import { Pressable } from "../../components/pressable";
import { useResizableSurfaceHovered } from "../../components/resizable-surface";

interface ElementIconProps {
  hasChildren: boolean;
  id: string;
  isCustomComponent: boolean;
  isExpanded: boolean;
  isHostComponent: boolean;
  isImportedComponent: boolean;
  setExpanded: (value: (prev: boolean) => boolean) => void;
}

export function ElementIcon({
  hasChildren,
  id,
  isCustomComponent,
  isExpanded,
  isHostComponent: _isHostComponent,
  isImportedComponent,
  setExpanded,
}: ElementIconProps) {
  const hovered = useResizableSurfaceHovered();

  return (
    <>
      {(isCustomComponent || hasChildren) && (
        <Pressable
          actionId={
            isExpanded
              ? "scenepanel_element_collapse"
              : "scenepanel_element_expand"
          }
          className="z-10 -ml-[5px] px-0.5"
          describedBy={id}
          onClick={() => setExpanded((state) => !state)}
        >
          {isCustomComponent && isImportedComponent && !hovered ? (
            <Link2Icon />
          ) : isExpanded ? (
            <ChevronDownIcon aria-label="Hide Children" />
          ) : (
            <ChevronRightIcon aria-label="Show Children" />
          )}
        </Pressable>
      )}
    </>
  );
}
