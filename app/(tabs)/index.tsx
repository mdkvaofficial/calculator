import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import Signup from './screens/signupScreen';
import Login from './screens/loginScreen';
import NewUserDashboard from './screens/newUserDashboard';
import Dashboard from './screens/dashboard';
import SearchCompanies from './screens/searchCompanies';
import Settings from './screens/settings';
import AcceptCandidatesScreen from './screens/acceptCandidatesScreen';
import AttendanceScreen from './screens/attendanceScreen';
import ChatbotScreen from './screens/chatbotScreen';
import ChatScreen from './screens/chatScreen';
import LeaveApplicationScreen from './screens/leaveApplicationScreen';
import ForgotPasswordScreen from './screens/forgotPasswordScreen';
import VerifyContactScreen from './screens/verifyContactScreen';
import NewPasswordScreen from './screens/newPasswordScreen';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const Index = () => {
  return (

      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="NewUserDashboard" component={NewUserDashboard} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="SearchCompanies" component={SearchCompanies} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="AcceptCandidatesScreen" component={AcceptCandidatesScreen} />
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
        <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="LeaveApplicationScreen" component={LeaveApplicationScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyContactScreen" component={VerifyContactScreen} />
        <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
      </Stack.Navigator>

  );
};

export default Index;
