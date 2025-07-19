import { Theme } from 'react-native-elements';

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    text: '#000000',
    grey0: '#FFFFFF',
    grey1: '#F2F2F7',
    grey2: '#E5E5EA',
    grey3: '#C7C7CC',
    grey4: '#8E8E93',
    grey5: '#636366',
    platform: {
      ios: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      android: {
        primary: '#2196F3',
        secondary: '#9C27B0',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
      },
    },
  },
  Button: {
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 16,
    },
  },
  Input: {
    inputStyle: {
      fontSize: 16,
    },
    labelStyle: {
      fontSize: 14,
      fontWeight: '500',
    },
    containerStyle: {
      paddingHorizontal: 0,
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5EA',
    },
  },
  ListItem: {
    containerStyle: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
  Header: {
    backgroundColor: '#007AFF',
    centerComponentStyle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    text: '#FFFFFF',
    grey0: '#000000',
    grey1: '#1C1C1E',
    grey2: '#2C2C2E',
    grey3: '#38383A',
    grey4: '#8E8E93',
    grey5: '#AEAEB2',
    platform: {
      ios: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF453A',
      },
      android: {
        primary: '#2196F3',
        secondary: '#9C27B0',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
      },
    },
  },
  Button: {
    titleStyle: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonStyle: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
  },
  Card: {
    containerStyle: {
      backgroundColor: '#1C1C1E',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 16,
    },
  },
  Input: {
    inputStyle: {
      fontSize: 16,
      color: '#FFFFFF',
    },
    labelStyle: {
      fontSize: 14,
      fontWeight: '500',
      color: '#AEAEB2',
    },
    containerStyle: {
      paddingHorizontal: 0,
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: '#38383A',
    },
  },
  ListItem: {
    containerStyle: {
      backgroundColor: '#1C1C1E',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },
  Header: {
    backgroundColor: '#0A84FF',
    centerComponentStyle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  },
};