import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ManagementMenuScreen from '../screens/ManagementMenuScreen';
import CategoryManagementScreen from '../screens/management/CategoryManagementScreen';
import CategoryFormScreen from '../screens/management/CategoryFormScreen';
import PaymentMethodManagementScreen from '../screens/management/PaymentMethodManagementScreen';
import PaymentMethodFormScreen from '../screens/management/PaymentMethodFormScreen';
import TagManagementScreen from '../screens/management/TagManagementScreen';
import TagFormScreen from '../screens/management/TagFormScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen 
        name="ManagementMenu" 
        component={ManagementMenuScreen}
        options={{ title: 'Manage Settings' }}
      />
      <Stack.Screen 
        name="CategoryManagement" 
        component={CategoryManagementScreen}
        options={{ title: 'Manage Categories' }}
      />
      <Stack.Screen 
        name="CategoryForm" 
        component={CategoryFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PaymentMethodManagement" 
        component={PaymentMethodManagementScreen}
        options={{ title: 'Payment Methods' }}
      />
      <Stack.Screen 
        name="PaymentMethodForm" 
        component={PaymentMethodFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TagManagement" 
        component={TagManagementScreen}
        options={{ title: 'Manage Tags' }}
      />
      <Stack.Screen 
        name="TagForm" 
        component={TagFormScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
