import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const ManagementMenuScreen: React.FC = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Manage Categories',
      subtitle: 'Add, edit, and organize expense categories',
      icon: 'folder',
      iconType: 'feather',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('CategoryManagement' as never),
    },
    {
      title: 'Payment Methods',
      subtitle: 'Manage cards, cash, and payment options',
      icon: 'credit-card',
      iconType: 'feather',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('PaymentMethodManagement' as never),
    },
    {
      title: 'Tags',
      subtitle: 'Create and organize expense tags',
      icon: 'tag',
      iconType: 'feather',
      color: '#45B7D1',
      onPress: () => navigation.navigate('TagManagement' as never),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h3 style={styles.title}>
          Manage Settings
        </Text>
        <Text style={styles.subtitle}>
          Organize your categories, payment methods, and tags
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            onPress={item.onPress}
            bottomDivider={index < menuItems.length - 1}
            containerStyle={styles.menuItem}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Icon
                name={item.icon}
                type={item.iconType}
                size={24}
                color="white"
              />
            </View>
            <ListItem.Content>
              <ListItem.Title style={styles.menuTitle}>
                {item.title}
              </ListItem.Title>
              <ListItem.Subtitle style={styles.menuSubtitle}>
                {item.subtitle}
              </ListItem.Subtitle>
            </ListItem.Content>
            <Icon
              name="chevron-right"
              type="feather"
              size={20}
              color="#8E8E93"
            />
          </ListItem>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Changes made here will affect all your expenses and help organize your data better.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    color: '#000',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 16,
    lineHeight: 22,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ManagementMenuScreen;