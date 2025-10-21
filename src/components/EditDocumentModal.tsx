import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";
import { api } from "../lib/api";

interface EditDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  onSaved?: () => void;
}

export function EditDocumentModal({
  open,
  onOpenChange,
  documentId,
  onSaved,
}: EditDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pricePi, setPricePi] = useState(0);
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState("");

  // 문서 데이터 불러오기
  useEffect(() => {
    if (open && documentId) {
      loadDocument();
    }
  }, [open, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await api.getDoc(documentId);
      const doc = response.data;
      
      setTitle(doc.title || "");
      setContent(doc.content || "");
      setPricePi(doc.pricePi || 0);
      setStatus(doc.status || "published");
      setTags(doc.tags || []);
      setImage(doc.image || "");
    } catch (error) {
      console.error("Error loading document:", error);
      alert("문서를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      
      await api.updateDoc(documentId, {
        title: title.trim(),
        content: content.trim(),
        pricePi,
        status,
        tags,
        image: image.trim() || null,
      });

      alert("문서가 성공적으로 수정되었습니다.");
      onOpenChange(false);
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error updating document:", error);
      alert("문서 수정 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>문서 수정</DialogTitle>
          <DialogDescription>
            문서 정보를 수정하세요. 모든 변경사항은 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        {loading && !title ? (
          <div className="py-8 text-center text-muted-foreground">
            문서를 불러오는 중...
          </div>
        ) : (
          <div className="space-y-4">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목 *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문서 제목을 입력하세요"
                disabled={loading}
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="edit-content">내용 *</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문서 내용을 입력하세요"
                rows={10}
                disabled={loading}
              />
            </div>

            {/* 이미지 URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-image">이미지 URL (선택사항)</Label>
              <Input
                id="edit-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>

            {/* 가격 및 상태 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">가격 (Pi)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.1"
                  value={pricePi}
                  onChange={(e) => setPricePi(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  0으로 설정하면 무료 문서가 됩니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select
                  value={status}
                  onValueChange={(value: "published" | "draft") =>
                    setStatus(value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">발행됨</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <Label>태그</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그 입력 후 Enter"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
