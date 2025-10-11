import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Smile } from 'lucide-react';
import { GroupResponse, CreateGroupRequest, UpdateGroupRequest } from '@/store/api/groupsApi';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupRequest | UpdateGroupRequest) => void;
  isLoading?: boolean;
  editGroup?: GroupResponse | null;
  mode: 'create' | 'edit';
}

const EMOJI_OPTIONS = [
  '🌟', '🎨', '🔬', '🎵', '📚', '🎮', '🌿', '⚽', 
  '🍎', '🎭', '🎪', '🎯', '🎳', '🎲', '🃏', '🎸',
  '🎺', '🎻', '🥁', '🎤', '🎬', '📸', '🖼️', '🗺️',
  '🧩', '🎨', '✏️', '📝', '📖', '📚', '📰', '📄'
];

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editGroup = null,
  mode
}) => {
  const [formData, setFormData] = useState<CreateGroupRequest | UpdateGroupRequest>({
    name: '',
    emoji: '🌟',
    description: '',
    privacy: 'PUBLIC'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (editGroup && mode === 'edit') {
      setFormData({
        name: editGroup.name,
        emoji: editGroup.emoji || '🌟',
        description: editGroup.description || '',
        privacy: editGroup.privacy
      });
    } else {
      setFormData({
        name: '',
        emoji: '🌟',
        description: '',
        privacy: 'PUBLIC'
      });
    }
    setErrors({});
  }, [editGroup, mode, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Group name cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = mode === 'create' 
        ? formData as CreateGroupRequest
        : { ...formData } as UpdateGroupRequest;
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? 'Create New Group' : 'Edit Group'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Group Name *
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter group name"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji" className="text-sm font-medium">
              Group Emoji
            </Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInputChange('emoji', emoji)}
                  className={`text-2xl p-2 rounded hover:bg-gray-100 transition-colors ${
                    formData.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                  }`}
                  disabled={isLoading}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smile className="h-4 w-4" />
              <span>Selected: {formData.emoji}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your group (optional)"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description?.length || 0}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy" className="text-sm font-medium">
              Privacy Setting *
            </Label>
            <Select
              value={formData.privacy}
              onValueChange={(value) => handleInputChange('privacy', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select privacy setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public - Anyone can join</SelectItem>
                <SelectItem value="PRIVATE">Private - Invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Group' : 'Update Group'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupModal;