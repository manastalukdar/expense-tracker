import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, ListItem, Icon, Button, SearchBar, Chip } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { Tag } from '@expense-tracker/shared';

const TagManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    tags, 
    deleteTag, 
    isLoading 
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTag = () => {
    navigation.navigate('TagForm' as never, { mode: 'create' } as never);
  };

  const handleEditTag = (tag: Tag) => {
    navigation.navigate('TagForm' as never, { 
      mode: 'edit', 
      tag 
    } as never);
  };

  const handleDeleteTag = (tag: Tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tag.id);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete tag'
              );
            }
          },
        },
      ]
    );
  };

  const getTagColor = (color?: string) => {
    return color || '#007AFF';
  };

  const filteredTags = searchQuery
    ? tags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tags;

  const groupTagsByFirstLetter = () => {
    const grouped = filteredTags.reduce((acc, tag) => {
      const firstLetter = tag.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(tag);
      return acc;
    }, {} as Record<string, Tag[]>);

    // Sort each group alphabetically
    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  const groupedTags = groupTagsByFirstLetter();
  const sortedLetters = Object.keys(groupedTags).sort();

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search tags..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
        lightTheme
      />

      <ScrollView style={styles.content}>
        {sortedLetters.map((letter) => (
          <View key={letter} style={styles.section}>
            <Text style={styles.sectionHeader}>{letter}</Text>
            <View style={styles.tagList}>
              {groupedTags[letter].map((tag) => (
                <ListItem
                  key={tag.id}
                  containerStyle={styles.tagItem}
                >
                  <View style={[styles.tagColorIndicator, { backgroundColor: getTagColor(tag.color) }]} />
                  <ListItem.Content>
                    <ListItem.Title style={styles.tagName}>
                      #{tag.name}
                    </ListItem.Title>
                    {tag.description && (
                      <ListItem.Subtitle style={styles.tagDescription}>
                        {tag.description}
                      </ListItem.Subtitle>
                    )}
                  </ListItem.Content>
                  
                  <View style={styles.tagActions}>
                    <Icon
                      name="edit-3"
                      type="feather"
                      size={18}
                      color="#007AFF"
                      onPress={() => handleEditTag(tag)}
                      containerStyle={styles.actionIcon}
                    />
                    <Icon
                      name="trash-2"
                      type="feather"
                      size={18}
                      color="#FF3B30"
                      onPress={() => handleDeleteTag(tag)}
                      containerStyle={styles.actionIcon}
                    />
                  </View>
                </ListItem>
              ))}
            </View>
          </View>
        ))}

        {tags.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Tags Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create tags to add labels and organize your expenses better.
            </Text>
          </View>
        )}

        {filteredTags.length === 0 && searchQuery && tags.length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Matching Tags</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or create a new tag.
            </Text>
          </View>
        )}

        {tags.length > 0 && (
          <View style={styles.tagPreview}>
            <Text style={styles.previewTitle}>Tag Preview</Text>
            <View style={styles.chipContainer}>
              {tags.slice(0, 5).map((tag) => (
                <Chip
                  key={tag.id}
                  title={tag.name}
                  buttonStyle={[styles.chipButton, { backgroundColor: getTagColor(tag.color) }]}
                  titleStyle={styles.chipText}
                  containerStyle={styles.chip}
                />
              ))}
              {tags.length > 5 && (
                <Text style={styles.moreTagsText}>+{tags.length - 5} more</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Add Tag"
          onPress={handleAddTag}
          buttonStyle={styles.addButton}
          titleStyle={styles.addButtonText}
          icon={
            <Icon
              name="plus"
              type="feather"
              size={20}
              color="white"
              containerStyle={{ marginRight: 8 }}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
  },
  tagList: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tagItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'flex-start',
  },
  tagColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 6,
  },
  tagName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  tagDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  tagActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  tagPreview: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomActions: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default TagManagementScreen;