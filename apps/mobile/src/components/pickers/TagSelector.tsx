import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar, Chip } from 'react-native-elements';
import { useExpenseStore } from '../../store/useExpenseStore';
import { Tag } from '@expense-tracker/shared';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsSelect: (tagIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  style?: any;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTagIds,
  onTagsSelect,
  placeholder = "Select Tags",
  maxSelections,
  style
}) => {
  const { tags } = useExpenseStore();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  const filteredTags = tags.filter(tag => 
    !searchQuery || 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTagColor = (color?: string) => {
    return color || '#007AFF';
  };

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    let newSelectedIds: string[];

    if (isSelected) {
      newSelectedIds = selectedTagIds.filter(id => id !== tag.id);
    } else {
      if (maxSelections && selectedTagIds.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      newSelectedIds = [...selectedTagIds, tag.id];
    }

    onTagsSelect(newSelectedIds);
  };

  const handleClearAll = () => {
    onTagsSelect([]);
  };

  const renderTagItem = (tag: Tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    const isDisabled = !isSelected && maxSelections && selectedTagIds.length >= maxSelections;

    return (
      <ListItem
        key={tag.id}
        onPress={() => !isDisabled && handleTagToggle(tag)}
        containerStyle={[
          styles.tagItem,
          isDisabled && styles.disabledTagItem
        ]}
        disabled={isDisabled}
      >
        <View style={[styles.tagColorIndicator, { backgroundColor: getTagColor(tag.color) }]} />
        <ListItem.Content>
          <ListItem.Title style={[
            styles.tagName,
            isDisabled && styles.disabledText
          ]}>
            #{tag.name}
          </ListItem.Title>
          {tag.description && (
            <ListItem.Subtitle style={[
              styles.tagDescription,
              isDisabled && styles.disabledText
            ]}>
              {tag.description}
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        {isSelected && (
          <Icon name="check" type="feather" size={20} color="#007AFF" />
        )}
        {isDisabled && (
          <Icon name="lock" type="feather" size={16} color="#8E8E93" />
        )}
      </ListItem>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ListItem
        onPress={() => setIsVisible(true)}
        containerStyle={styles.pickerButton}
      >
        <ListItem.Content>
          {selectedTags.length > 0 ? (
            <View style={styles.selectedTagsContainer}>
              <View style={styles.chipContainer}>
                {selectedTags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag.id}
                    title={tag.name}
                    buttonStyle={[styles.chipButton, { backgroundColor: getTagColor(tag.color) }]}
                    titleStyle={styles.chipText}
                    containerStyle={styles.chip}
                  />
                ))}
                {selectedTags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{selectedTags.length - 3}</Text>
                )}
              </View>
            </View>
          ) : (
            <ListItem.Title style={styles.placeholderText}>
              {placeholder}
            </ListItem.Title>
          )}
        </ListItem.Content>
        <Icon
          name="chevron-down"
          type="feather"
          size={20}
          color="#8E8E93"
        />
      </ListItem>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Button
              title="Cancel"
              type="clear"
              titleStyle={styles.cancelButton}
              onPress={() => {
                setIsVisible(false);
                setSearchQuery('');
              }}
            />
            <Text style={styles.modalTitle}>
              Select Tags {maxSelections ? `(${selectedTagIds.length}/${maxSelections})` : ''}
            </Text>
            <Button
              title="Done"
              type="clear"
              titleStyle={styles.doneButton}
              onPress={() => setIsVisible(false)}
            />
          </View>

          {selectedTags.length > 0 && (
            <View style={styles.selectedSection}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>Selected Tags</Text>
                <Button
                  title="Clear All"
                  type="clear"
                  titleStyle={styles.clearAllButton}
                  onPress={handleClearAll}
                />
              </View>
              <View style={styles.selectedChipContainer}>
                {selectedTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    title={tag.name}
                    buttonStyle={[styles.selectedChipButton, { backgroundColor: getTagColor(tag.color) }]}
                    titleStyle={styles.selectedChipText}
                    containerStyle={styles.selectedChip}
                    onPress={() => handleTagToggle(tag)}
                    icon={{
                      name: 'x',
                      type: 'feather',
                      size: 14,
                      color: 'white',
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <SearchBar
            placeholder="Search tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInput}
            lightTheme
          />

          <ScrollView style={styles.modalContent}>
            {filteredTags.map(renderTagItem)}

            {filteredTags.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching tags found' : 'No tags available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pickerButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  selectedTagsContainer: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    marginRight: 6,
    marginBottom: 4,
  },
  chipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modal: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    color: '#8E8E93',
    fontSize: 16,
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearAllButton: {
    color: '#FF3B30',
    fontSize: 14,
  },
  selectedChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedChipText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    marginRight: 4,
  },
  searchContainer: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  tagItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'flex-start',
  },
  disabledTagItem: {
    opacity: 0.5,
  },
  tagColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 6,
  },
  tagName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  tagDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  disabledText: {
    color: '#B0B0B0',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default TagSelector;