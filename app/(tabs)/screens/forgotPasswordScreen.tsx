import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { auth } from "../../../FirebaseConfig";
import PhoneInput from "react-native-phone-number-input";
import "react-native-country-picker-modal";

interface ForgotPasswordScreenProps {
  navigation: NavigationProp<any, any>;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [contactNumber, setContactNumber] = useState<string>("");
  const [formattedValue, setFormattedValue] = useState<string>("");
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleGetCode = async () => {
    if (!contactNumber) {
      Alert.alert("Error", "Please enter your contact number");
      return;
    }

    const isValid = phoneInput.current?.isValidNumber(contactNumber);
    if (!isValid) {
      Alert.alert("Error", "Please enter a valid contact number");
      return;
    }

    try {
      const confirmation = await auth.signInWithPhoneNumber(formattedValue);
      navigation.navigate("VerifyContactScreen", { confirmation });
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Failed to send verification code");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Forgot Password</Text>

      <PhoneInput
        ref={phoneInput}
        defaultValue={contactNumber}
        defaultCode="US"
        layout="first"
        onChangeText={(text) => {
          setContactNumber(text);
        }}
        onChangeFormattedText={(text) => {
          setFormattedValue(text);
        }}
        withDarkTheme
        withShadow
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, styles.getCodeButton]}
        onPress={handleGetCode}
      >
        <Text style={styles.buttonText}>Get Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headings: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 36,
    color: "#ffffff",
    marginBottom: 40,
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1976d2",
    marginBottom: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  getCodeButton: {
    backgroundColor: "#1976d2",
  },
});

export default ForgotPasswordScreen;
