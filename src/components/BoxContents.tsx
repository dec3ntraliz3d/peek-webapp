import React, { useState } from 'react';
import { useToast } from './Toast';

interface BoxContentsProps {
  boxId: string;
  items: string[];
  description: string;
  onAddItem: (boxId: string, item: string) => Promise<void>;
  onRemoveItem: (boxId: string, item: string) => Promise<void>;
  onUpdateDescription: (boxId: string, description: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const BoxContents: React.FC<BoxContentsProps> = ({
  boxId,
  items,
  description,
  onAddItem,
  onRemoveItem,
  onUpdateDescription,
  onBack,
  isLoading = false
}) => {
  const { showToast } = useToast();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  const handleAddItem = async () => {
    if (!newItem.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await onAddItem(boxId, newItem.trim());
      setNewItem('');
      showToast('Item added', 'success');
    } catch (error) {
      console.error('Error adding item:', error);
      showToast('Failed to add item', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = async (item: string) => {
    setRemovingItem(item);
    try {
      await onRemoveItem(boxId, item);
      showToast('Item removed', 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Failed to remove item', 'error');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleSaveDescription = async () => {
    setIsSavingDescription(true);
    try {
      await onUpdateDescription(boxId, tempDescription);
      setEditingDescription(false);
      showToast('Description saved', 'success');
    } catch (error) {
      console.error('Error updating description:', error);
      showToast('Failed to save description', 'error');
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleCancelDescription = () => {
    setTempDescription(description);
    setEditingDescription(false);
  };

  // Update temp description when prop changes
  React.useEffect(() => {
    setTempDescription(description);
  }, [description]);

  return (
    <div className="box-contents-container">
      <div className="box-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <div className="box-info">
          <h2>{boxId}</h2>
          <span className="item-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ width: '60px' }} />
      </div>

      <div className="description-section">
        <div className="description-header">
          <label>Description</label>
          {!editingDescription && (
            <button
              onClick={() => setEditingDescription(true)}
              className="edit-description-btn"
              title="Edit description"
            >
              Edit
            </button>
          )}
        </div>

        {editingDescription ? (
          <div className="description-edit">
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Add a description for this box..."
              className="description-textarea"
              rows={3}
              autoFocus
            />
            <div className="description-buttons">
              <button
                onClick={handleSaveDescription}
                className="save-btn"
                disabled={isSavingDescription}
              >
                {isSavingDescription ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelDescription}
                className="cancel-btn"
                disabled={isSavingDescription}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="description-display">
            {description || (
              <span className="description-placeholder">
                No description added yet
              </span>
            )}
          </div>
        )}
      </div>

      <div className="add-item-section">
        <div className="add-item-form">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new item..."
            className="item-input"
            disabled={isAdding}
          />
          <button
            onClick={handleAddItem}
            disabled={!newItem.trim() || isAdding}
            className="add-btn"
          >
            {isAdding ? (
              <span className="btn-spinner"></span>
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>

      <div className="items-section">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-box">
            <p>This box is empty</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Add your first item above</p>
          </div>
        ) : (
          <div className="items-list">
            {items.map((item, index) => (
              <div key={`${item}-${index}`} className="item-row">
                <span className="item-text">{item}</span>
                <button
                  onClick={() => handleRemoveItem(item)}
                  disabled={removingItem === item}
                  className="remove-btn"
                  aria-label={`Remove ${item}`}
                >
                  {removingItem === item ? (
                    <span className="btn-spinner-small"></span>
                  ) : (
                    '×'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="box-footer">
        <p className="sync-info">Changes sync automatically</p>
      </div>
    </div>
  );
};

export default BoxContents;
