import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useLanguage } from "../contexts/LanguageContext";

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; description: string; category: string; tags: string[] }) => void;
}

export function CreateCommunityModal({ open, onOpenChange, onCreate }: CreateCommunityModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = () => {
    const tagsArray = tags.split(",").map((tag) => tag.trim());
    onCreate({ name, description, category, tags: tagsArray });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        style={{ maxHeight: '80vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <DialogHeader>
          <DialogTitle>{t.modals.createCommunity.title}</DialogTitle>
          <DialogDescription>
            {t.modals.createCommunity.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right md:text-right text-left md:col-span-1 col-span-1">
              {t.modals.createCommunity.name}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full md:col-span-3 col-span-1"
              placeholder={t.modals.createCommunity.namePlaceholder}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right md:text-right text-left md:col-span-1 col-span-1">
              {t.modals.createCommunity.descriptionLabel}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full md:col-span-3 col-span-1"
              placeholder={t.modals.createCommunity.descriptionPlaceholder}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right md:text-right text-left md:col-span-1 col-span-1">
              {t.modals.createCommunity.category}
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:col-span-3 col-span-1"
              placeholder={t.modals.createCommunity.categoryPlaceholder}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right md:text-right text-left md:col-span-1 col-span-1">
              {t.modals.createCommunity.tags}
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full md:col-span-3 col-span-1"
              placeholder={t.modals.createCommunity.tagsPlaceholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{t.modals.createCommunity.create}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}