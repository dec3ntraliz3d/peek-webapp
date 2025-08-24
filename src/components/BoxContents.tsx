import React, { useState } from 'react';

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
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(description);
  const [descriptionError, setDescriptionError] = useState('');

  const handleAddItem = async () => {
    if (!newItem.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await onAddItem(boxId, newItem.trim());
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveItem = async (item: string) => {
    if (!confirm(`Remove "${item}" from this box?`)) return;

    setRemovingItem(item);
    try {
      await onRemoveItem(boxId, item);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
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
    setDescriptionError(''); // Clear any previous errors
    try {
      await onUpdateDescription(boxId, tempDescription);
      setEditingDescription(false);
    } catch (error) {
      console.error('Error updating description:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDescriptionError(`Error: ${errorMessage}`);
    }
  };

  const handleCancelDescription = () => {
    setTempDescription(description);
    setEditingDescription(false);
    setDescriptionError(''); // Clear errors when canceling
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
          <h2>📦 {boxId}</h2>
          <span className="item-count">{items.length} items</span>
        </div>
      </div>

      <div className="description-section">
        <div className="description-header">
          <label>📝 Description</label>
          {!editingDescription && (
            <button 
              onClick={() => setEditingDescription(true)}
              className="edit-description-btn"
              title="Edit description"
            >
              ✏️
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
              <button onClick={handleSaveDescription} className="save-btn">
                💾 Save
              </button>
              <button onClick={handleCancelDescription} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
            {descriptionError && (
              <div className="description-error">
                <p>❌ {descriptionError}</p>
                <button onClick={() => setDescriptionError('')} className="error-dismiss">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="description-display">
            {description || (
              <span className="description-placeholder">
                Click ✏️ to add a description for this box
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
            {isAdding ? '...' : '+ Add'}
          </button>
        </div>
      </div>

      <div className="items-section">
        {isLoading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="empty-box">
            <p>📭 This box is empty</p>
            <p>Add your first item above!</p>
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
                  {removingItem === item ? '...' : '🗑️'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="box-footer">
        <p className="sync-info">
          💾 Changes are automatically saved to your GitHub repository
        </p>
      </div>
    </div>
  );
};

export default BoxContents;