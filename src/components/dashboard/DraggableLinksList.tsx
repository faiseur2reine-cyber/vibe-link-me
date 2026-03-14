import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TapGrip as GripVertical, TapLink as LinkIcon, TapExternalLink as ExternalLink, TapTrash as Trash2, TapPencil as Edit } from '@/components/icons/TapIcons';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DraggableLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  position: number;
}

interface DraggableLinksListProps {
  links: DraggableLink[];
  onReorder: (links: DraggableLink[]) => void;
  onEdit?: (link: DraggableLink) => void;
  onDelete?: (id: string) => void;
}

export const DraggableLinksList = ({ links, onReorder, onEdit, onDelete }: DraggableLinksListProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reordered = items.map((item, index) => ({
      ...item,
      position: index,
    }));

    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="links">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {links.map((link, index) => (
              <Draggable key={link.id} draggableId={link.id} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className={`group relative overflow-hidden transition-all duration-200 ${
                        snapshot.isDragging
                          ? 'shadow-lg ring-2 ring-primary/50 scale-[1.02] rotate-1'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <LinkIcon className="w-4 h-4 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{link.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-accent rounded-md transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(link);
                              }}
                              className="p-1.5 hover:bg-accent rounded-md transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(link.id);
                              }}
                              className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Drag indicator */}
                      {snapshot.isDragging && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pointer-events-none"
                        />
                      )}
                    </Card>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {links.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun lien pour le moment</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
