import { useState } from "react";
import { X, Upload, Tag, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { useCreatePost } from "../hooks/usePosts";
import { useLanguage } from "../contexts/LanguageContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [piEnabled, setPiEnabled] = useState(true);
  const [piPrice, setPiPrice] = useState("5");
  
  const createPostMutation = useCreatePost();

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPostMutation.mutateAsync({
        title,
        content,
        tags,
        piEnabled,
        piPrice: parseFloat(piPrice),
      });
      
      // 성공 시 폼 초기화 및 모달 닫기
      setTitle("");
      setContent("");
      setTags([]);
      setCurrentTag("");
      setPiEnabled(true);
      setPiPrice("5");
      onClose();
    } catch (error) {
      console.error('문서 생성 실패:', error);
      // 에러 처리는 UI에서 표시
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.modals.createPost.title}</DialogTitle>
          <DialogDescription>
            {t.modals.createPost.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t.modals.createPost.titleLabel}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.modals.createPost.titlePlaceholder}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">{t.modals.createPost.contentLabel}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.modals.createPost.contentPlaceholder}
              rows={6}
              required
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>{t.modals.createPost.fileAttach}</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t.modals.createPost.fileUploadText}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.modals.createPost.fileFormats}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tag-input">{t.modals.createPost.tags}</Label>
            <div className="flex space-x-2">
              <Input
                id="tag-input"
                name="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder={t.modals.createPost.tagsPlaceholder}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                autoComplete="off"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  #{tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Pi Settings */}
          <div className="space-y-4 border rounded-lg p-4 bg-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-purple-600" />
                <Label htmlFor="pi-enabled">{t.modals.createPost.piEnable}</Label>
              </div>
              <Switch
                id="pi-enabled"
                checked={piEnabled}
                onCheckedChange={setPiEnabled}
              />
            </div>
            
            {piEnabled && (
              <div className="space-y-2">
                <Label htmlFor="pi-price">{t.modals.createPost.piPrice}</Label>
                <Input
                  id="pi-price"
                  type="number"
                  value={piPrice}
                  onChange={(e) => setPiPrice(e.target.value)}
                  min="0"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  {t.modals.createPost.piPriceDesc}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? t.modals.createPost.creating : t.modals.createPost.share}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}