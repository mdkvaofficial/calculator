import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { db, auth } from '../../../FirebaseConfig';
import { collection, addDoc, query, where, onSnapshot, getDoc, doc, orderBy } from "firebase/firestore";
import { format } from 'date-fns';

interface ChatScreenProps {
  navigation: NavigationProp<any, any>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; user: string; createdAt: any }>>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.companyId) {
            setCompanyId(userData.companyId);
          } else {
            setError('No company associated with this user.');
          }
        } else {
          setError('User data not found.');
        }
      } catch (error) {
        console.error('Error fetching user company: ', error);
        setError('Error fetching user company.');
      }
    };

    fetchUserCompany();
  }, []);

  useEffect(() => {
    if (companyId) {
      const fetchMessages = () => {
        const q = query(collection(db, 'messages'), where('companyId', '==', companyId), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList: Array<{ id: string; text: string; user: string; createdAt: any }> = [];
          querySnapshot.forEach((doc) => {
            messagesList.push({ id: doc.id, ...doc.data() } as any);
          });
          setMessages(messagesList);
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        });

        return () => unsubscribe();
      };

      fetchMessages();
    }
  }, [companyId]);

  const sendMessage = async () => {
    if (message.trim() && companyId) {
      try {
        const user = auth.currentUser?.email || 'Anonymous';
        await addDoc(collection(db, 'messages'), {
          text: message,
          user: user,
          companyId: companyId,
          createdAt: new Date(),
        });
        setMessage('');
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Error sending message: ', error);
        setError('Error sending message.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headings}>Chat Room</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageUser}>{item.user}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{format(new Date(item.createdAt.seconds * 1000), 'hh:mm a')}</Text>
          </View>
        )}
        ref={flatListRef}
        showsVerticalScrollIndicator={true}
      />
      <TextInput
        placeholder="Type your message"
        placeholderTextColor="#666"
        style={styles.inputData}
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={[styles.button, styles.sendButton]} onPress={sendMessage}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.DashboardButtonLocation]}
        onPress={() => {
          navigation.navigate("Dashboard");
        }}
      >
        <Text style={styles.buttonText}>Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headings: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 36,
    color: "#333",
    marginBottom: 40,
  },
  inputData: {
    backgroundColor: "#fff",
    color: "#333",
    textAlign: "left",
    width: "100%",
    height: 40,
    marginBottom: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#34c759",
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  DashboardButtonLocation: {
    marginTop: 20,
  },
  sendButton: {
    backgroundColor: "#007bff",
  },
  messageContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderColor: '#ddd',
    borderWidth: 1,
  },
  messageUser: {
    color: "#333",
    fontWeight: "bold",
  },
  messageText: {
    color: "#333",
  },
  messageTime: {
    color: "#666",
    fontSize: 12,
    textAlign: "right",
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ChatScreen;
