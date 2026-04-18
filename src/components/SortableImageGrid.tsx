"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: (id: string) => void;
}

export function SortableImageItem({ id, url, index, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square border border-black/10 group bg-white p-1 cursor-grab active:cursor-grabbing ${isDragging ? 'border-brand-black shadow-lg scale-105' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover pointer-events-none" />
      
      {/* Index Badge */}
      <div className="absolute top-0 left-0 bg-brand-black text-white px-2 py-1 text-[10px] font-bold z-10 pointer-events-none">
        {index + 1}
      </div>

      {/* Remove Button */}
      <button 
        type="button"
        onPointerDown={(e) => {
            e.stopPropagation();
        }}
        onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
        }}
        className="absolute -top-2 -right-2 bg-brand-black text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold group-hover:bg-red-600 transition-colors border border-white z-20 cursor-pointer"
      >
        <X size={10} />
      </button>
    </div>
  );
}

interface SortableImageGridProps {
  images: string[];
  setImages: (images: string[]) => void;
}

export default function SortableImageGrid({ images, setImages }: SortableImageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const items = images.filter(Boolean);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, 
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        setImages(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleRemove = (idToRemove: string) => {
    setImages(items.filter(url => url !== idToRemove));
  };
  
  const activeIndex = activeId ? items.indexOf(activeId) : -1;
  const activeUrl = activeId ? items[activeIndex] : null;

  if (items.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
          {items.map((url, index) => (
            <SortableImageItem 
                key={url} 
                id={url} 
                url={url} 
                index={index} 
                onRemove={handleRemove} 
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeId && activeUrl ? (
          <div className="relative aspect-square border-2 border-brand-black group bg-white p-1 cursor-grabbing shadow-2xl scale-105 z-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeUrl} alt="Dragging" className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute top-0 left-0 bg-brand-black text-white px-2 py-1 text-[10px] font-bold z-10 pointer-events-none">
              {activeIndex + 1}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
