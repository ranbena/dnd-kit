import React, {useEffect, useMemo, useRef} from 'react';

import {
  useDndContext,
  PositionalClientRect,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {useUniqueId} from '@dnd-kit/utilities';

import {getSortedRects} from '../utilities';

interface Props {
  children: React.ReactNode;
  items: UniqueIdentifier[];
  id?: string;
}

const ID_PREFIX = 'Sortable';

export const Context = React.createContext<{
  containerId: string;
  items: UniqueIdentifier[];
  overIndex: number;
  activeIndex: number;
  clientRects: PositionalClientRect[];
  disableInlineStyles: boolean;
  useClone: boolean;
}>({
  containerId: ID_PREFIX,
  items: [],
  overIndex: -1,
  activeIndex: -1,
  clientRects: [],
  disableInlineStyles: false,
  useClone: false,
});

export function SortableContext({children, id, items}: Props) {
  const {
    active,
    willRecomputeClientRects,
    clientRects,
    cloneNode,
    over,
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX, id);
  const useClone = cloneNode.clientRect !== null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = useRef(items);
  const sortedClientRects = useMemo(() => getSortedRects(items, clientRects), [
    items,
    clientRects,
  ]);
  const disableInlineStyles =
    willRecomputeClientRects ||
    (overIndex !== -1 && activeIndex === -1) ||
    previousItemsRef.current !== items;

  useEffect(() => {
    previousItemsRef.current = items;
  }, [items]);

  const contextValue = useMemo(() => {
    return {
      containerId,
      activeIndex,
      clientRects: sortedClientRects,
      disableInlineStyles,
      items,
      overIndex,
      useClone,
    };
  }, [
    containerId,
    disableInlineStyles,
    items,
    activeIndex,
    overIndex,
    sortedClientRects,
    useClone,
  ]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}