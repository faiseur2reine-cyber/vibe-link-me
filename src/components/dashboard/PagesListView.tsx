import { CreatorPage } from '@/hooks/useCreatorPages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface PagesListViewProps {
  pages: CreatorPage[];
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
}

const PagesListView = ({ pages, onSelectPage, onCreatePage }: PagesListViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Mes pages créateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{pages.length} page{pages.length !== 1 ? 's' : ''} créée{pages.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Aucune page créateur</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Créez votre première page créateur pour commencer à partager vos liens.
          </p>
          <Button onClick={onCreatePage} className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Plus className="w-4 h-4" /> Créer une page
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page, i) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
                onClick={() => onSelectPage(page.id)}
              >
                <CardContent className="p-0">
                  {/* Cover */}
                  {page.cover_url ? (
                    <div className="h-24 overflow-hidden rounded-t-xl">
                      <img src={page.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl" />
                  )}

                  <div className="p-4 -mt-8 relative">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
                      {page.avatar_url ? (
                        <img src={page.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-foreground">
                            {(page.display_name || page.username)?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <h3 className="font-display font-bold text-foreground truncate">
                        {page.display_name || page.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">@{page.username}</p>
                      {page.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{page.bio}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        {page.is_nsfw && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full font-medium">+18</span>
                        )}
                      </div>
                      <a
                        href={`/${page.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Voir
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add new card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pages.length * 0.05 }}
          >
            <Card
              className="cursor-pointer border-dashed border-2 hover:border-primary/50 transition-all h-full min-h-[200px] flex items-center justify-center"
              onClick={onCreatePage}
            >
              <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Nouvelle page</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PagesListView;
