import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, Image, Modal, Button, Alert } from 'react-native';
import pokedexJson from "./assets/pokedex.json";
import { Card, CardContent, CardHeader, CardMedia, FormHelperText, ListItemAvatar } from "@material-ui/core";
import { Audio } from 'expo-av';
import pokemonJson from "./assets/pokemon.json";
import * as Speech from 'expo-speech';
let index = 1;
import { imgs } from "./pokePics";
import { cries } from "./pokeCries";
import { db, firestore, auth } from './firebaseConfig';
import * as SMS from 'expo-sms';
import * as MailComposer from 'expo-mail-composer';
const pokelogo = require("./assets/pokeball2.png");

//FINAL PROJECT
//EVAN SOMERS
//eDex Pokedex App

var flipped = false;
export default function App() {
  var pokedex = pokedexJson;
  var pokeDesc = pokemonJson;
  var urllist = []
  const [hideModel, setHideModal] = useState(true);
  const [selectedIndex, setIndex] = useState(1);
  const [playSound, setPlaySound] = useState(true);
  var [currentPokemon, setCurrentPokemon] = useState(pokedex.data[selectedIndex - 1]);
  var [pokeColor, setPokeColor] = useState("white");
  var [gameState, setGameState] = useState(0);
  [registrationEmail, setRegistrationEmail] = useState('');
  [registrationPassword, setRegistrationPassword] = useState('');
  [loginEmail, setLoginEmail] = useState('');
  [loginPassword, setLoginPassword] = useState('');
  [loggedIn, setLoggedIn] = useState(false);
  [databaseData, setDatabaseData] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {

  }, [gameState]);
  pokedex.data.map(p => urllist.push(`./assets/pokemon/${p.id}.png`));
  for (var i = 0; i < pokedex.data.length; i++) {
    pokedex.data[i].img = urllist[i];
  }
  let imgList;

  const playCry = async () => {
    let soundObject = new Audio.Sound();
    await soundObject.loadAsync(cries[currentPokemon.id - 1]);
    await soundObject.playAsync();
    flipImmage();
  }
  const describe = async () => {
    console.log("DESCRIBE");
    if (playSound) {
      console.log(await Speech.getAvailableVoicesAsync());
      await Speech.speak(pokeDesc[currentPokemon.id - 1].description);
      setPlaySound(false);
    }
    else {
      Speech.stop();
      setPlaySound(true);
    }
  }

  const ResetIndexById = async (id) => {
    console.log(id);
    var types = pokedex.data[id - 1].type;
    if (types.includes("Grass") || types.includes("Bug")) {
      setPokeColor("#E2F0CB");
    }
    if (types.includes("Water") || types.includes("Flying")) {
      setPokeColor("B5EAD7");
    }
    if (types.includes("Ground")) {
      setPokeColor("#BC9E82");
    }
    if (types.includes("Electric")) {
      setPokeColor("#FDFD96");
    }
    if (types.includes("Psychic")) {
      setPokeColor("#C7CEEA");
    }
    if (types.includes("Fire")) {
      setPokeColor("#FFB7B2");
    }
    if (types.includes("Normal")) {
      setPokeColor("lightgrey");
    }
    setIndex(pokedex.data.findIndex((p) => p.id === id));
    setCurrentPokemon(pokedex.data[id - 1]);

  }

  const ResetIndexByName = async (name) => {
    console.log(name);
    setIndex(pokedex.data.findIndex((p) => p.name === name));
    setCurrentPokemon(pokedex.data[selectedIndex]);
  }
  const refresh = async () => {
    styles.pokeImg = { marginLeft: 'auto', marginRight: 'auto', borderWidth: 3, borderColor: 'black', marginBottom: 2, borderRadius: 20 };
    setGameState(gameState + 1);
  }

  const flipImmage = async () => {
    console.log("FLIP");
    styles.pokeImg = { marginLeft: 'auto', marginRight: 'auto', borderWidth: 3, borderColor: 'black', marginBottom: 2, borderRadius: 20, transform: [{ rotateY: '180deg' }] };
    await new Promise(r => setTimeout(r, 5));
    console.log("UNFLIP");
    refresh();
  }

  //FIREBASE
  registerWithFirebase = () => {
    if (registrationEmail.length < 4) {
      Alert.alert('Please enter an email address.');
      return;
    }

    if (registrationPassword.length < 4) {
      Alert.alert('Please enter a password.');
      return;
    }

    auth.createUserWithEmailAndPassword(registrationEmail, registrationPassword)
      .then(function (_firebaseUser) {
        Alert.alert('user registered!');

        setRegistrationEmail('');
        setRegistrationPassword('');
      })
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode == 'auth/weak-password') {
          Alert.alert('The password is too weak.');
        }
        else {
          Alert.alert(errorMessage);
        }
        console.log(error);
      }
      );
  }

  loginWithFirebase = () => {
    if (loginEmail.length < 4) {
      Alert.alert('Please enter an email address.');
      return;
    }

    if (loginPassword.length < 4) {
      Alert.alert('Please enter a password.');
      return;
    }

    auth.signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(function (_firebaseUser) {
        Alert.alert('user logged in!');
        setLoggedIn(true);

        // load data
        //retrieveDataFromFirebase();
      })
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === 'auth/wrong-password') {
          Alert.alert('Wrong password.');
        }
        else {
          Alert.alert(errorMessage);
        }
      }
      );
  }

  signoutWithFirebase = () => {
    auth.signOut().then(function () {
      // if logout was successful
      if (!auth.currentUser) {
        Alert.alert('user was logged out!');
        setLoggedIn(false);
      }
    });
  }

  //FIREBASE DB
  function saveDataWithFirebase() {
    let data = loginEmail + " : " + currentPokemon.name + " : " + currentPokemon.id;
    // *********************************************************************
    // When saving data, to create a new collection you can use SET 
    // and when updating you can use UPDATE (refer to docs for more info)
    // -- https://firebase.google.com/docs/firestore/manage-data/add-data
    // *********************************************************************

    var trainerid = auth.currentUser.uid;


    // SAVE DATA TO REALTIME DB
    db.ref('trainers/' + trainerid).set({
      text: data
    });

    // SAVE DATA TO FIRESTORE
    firestore.collection('trainers').doc(trainerid).set(
      {
        text: data,
      },
      {
        merge: true // set with merge set to true to make sure we don't blow away existing data we didnt intend to
      }
    )
      .then(function () {
        Alert.alert('Trainer data uploaded!');
      })
      .catch(function (error) {
        Alert.alert('Error writing data');
        console.log('Error writing data: ', error);
      });
  }

  function retrieveDataFromFirebase() {
    // *********************************************************************
    // When loading data, you can either fetch the data once like in these examples 
    // -- https://firebase.google.com/docs/firestore/query-data/get-data
    // or you can listen to the collection and whenever it is updated on the server
    // it can be handled automatically by your code
    // -- https://firebase.google.com/docs/firestore/query-data/listen
    // *********************************************************************

    var trainerid = auth.currentUser.uid;

    /*****************************/
    // LOAD DATA FROM REALTIME DB
    /*****************************/

    // read once from data store
    // db.ref('/users/' + userId).once('value').then(function (snapshot) {
    //   setDatabaseData(snapshot.val().text);
    // });

    /*****************************/
    // LOAD DATA FROM FIRESTORE
    /*****************************/

    // read once from data store
    // firestore.collection("users").doc(userId).get()
    //   .then(function (doc) {
    //     if (doc.exists) {
    //       setDatabaseData(doc.data().text);
    //       console.log("Document data:", doc.data());
    //     } else {
    //       // doc.data() will be undefined in this case
    //       console.log("No such document!");
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log("Error getting document:", error);
    //   });

    // For real-time updates:
    firestore.collection("trainers").doc(trainerid).onSnapshot(function (doc) {
      Alert.alert("Trainer data Loaded", doc.data().text);
      let pokemonId = doc.data().text.split(':')[2].trim();
      ResetIndexById(pokemonId);
    });
  }

  //SMS SHARE
  const sharePokemon = async () => {
    Alert.alert(
      //This is title
      'Share Pokemon Data',
      //This is body text
      'Share by SMS or Email',
      [
        { text: 'Cancel', onPress: () => console.log('No Pressed'), style: 'cancel' },
        { text: 'SMS', onPress: () => SendSMS() },
        { text: 'Email', onPress: () => SendEmail() }
      ],
      { cancelable: false }
      //on clicking out side, Alert will not dismiss
    );

  }

  const SendSMS = async () => {
    await SMS.sendSMSAsync('', pokeDesc[currentPokemon.id - 1].description);
    Alert.alert("Pokemon Data Shared", "Message Sent");
  }

  const SendEmail = async () => {
    var options = {
      recipients: ['some_user@gmail.com'],
      ccRecipients: ['some_other_user@gmail.com'],
      bccRecipients: ['some_other_user@live.com'],
      subject: 'Jokes',
      body: pokeDesc[currentPokemon.id - 1].description,
      isHtml: false
    };
    try {
      await MailComposer.composeAsync(options).then((results) => {
        console.log(results.status);
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={!loggedIn}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View>
          {!loggedIn &&
            <View style={{ backgroundColor: '#CC0000', height: '100%' }}>
              <View style={{ borderColor: 'black', borderWidth: 10 }}>
                <Text style={{ textAlign: 'center', fontSize: 25 }}>Register new trainer with eDex</Text>
                <TextInput
                  style={{ backgroundColor: 'white', color: 'black' }}
                  onChangeText={(value) => setRegistrationEmail(value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoCompleteType="email"
                  keyboardType="email-address"
                  placeholder="email"
                />
                <TextInput
                  style={{ backgroundColor: 'white', color: 'black' }}
                  onChangeText={(value) => setRegistrationPassword(value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoCompleteType="password"
                  keyboardType="visible-password"
                  placeholder="password"
                />
                <Button style={styles.button} title="Register" onPress={registerWithFirebase} />
              </View>
              <View style={{ borderColor: 'black', borderWidth: 10 }}>
                <Text style={{ textAlign: 'center', fontSize: 25 }}>Sign In with eDex</Text>
                <TextInput
                  style={{ backgroundColor: 'white', color: 'black' }}
                  onChangeText={(value) => setLoginEmail(value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoCompleteType="email"
                  keyboardType="email-address"
                  placeholder="email"
                />
                <TextInput
                  style={{ backgroundColor: 'white', color: 'black' }}
                  onChangeText={(value) => setLoginPassword(value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoCompleteType="password"
                  keyboardType="visible-password"
                  placeholder="password"
                />
                <Button style={styles.button} title="Login" onPress={loginWithFirebase} />
              </View>
            </View>
          }
        </View>
        <View>
        </View>
      </Modal>
      <View style={{ height: "20%", marginTop: 0, marginBottom: 550 }}>
        <Image style={{ marginLeft: 'auto', marginRight: 'auto', borderWidth: 3, borderColor: 'black', marginBottom: 2, borderRadius: 20, width: '100%', height: 400, position: 'absolute' }} source={require("./assets/pokeball4.png")} />
        <View style={{ backgroundColor: pokeColor, height: 30, width: 120, marginRight: 'auto', marginLeft: 'auto', marginTop: 20, borderRadius: 50 }}>
          <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{currentPokemon.name}</Text>
        </View>
        <View style={{ width: '100%', height: 120, marginLeft: 'auto', marginRight: 'auto', flexDirection: 'row' }}>
          <View style={{ width: '32%', margin: 2, marginTop: 'auto', marginBottom: 'auto' }}><Button title="Description" color="#323232" onPress={() => describe()} /><Button title="Set Pokemon" color="#323232" onPress={() => saveDataWithFirebase()} /></View>
          <View style={{ backgroundColor: pokeColor, borderRadius: 20 }} >
            <TouchableOpacity onPress={() => sharePokemon()}>
              <Image style={styles.pokeImg} source={imgs[currentPokemon.id - 1]} />
            </TouchableOpacity>

          </View>
          <View style={{ width: '32%', margin: 2, marginTop: 'auto', marginBottom: 'auto' }}><Button title="Pokemon Cry" color="#323232" onPress={() => playCry()} /><Button title="Get Pokemon" color="#323232" onPress={() => retrieveDataFromFirebase()} /></View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Text style={{ textAlign: 'left', fontWeight: 'bold', fontSize: 20, marginLeft: 35, color: 'white' }}>Pokemon</Text>
          <Text style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 20, position: 'absolute', right: 25, color: 'white' }}>Description</Text>
        </View>
        <View style={{ backgroundColor: 'white', width: '100%', marginLeft: 'auto', marginRight: 'auto', borderColor: 'black', borderWidth: 2, opacity: 0.79 }}>

          <Text style={{ maxHeight: 300, fontSize: 13, fontWeight: 'bold', textAlign: 'center', padding: 5, color: 'black', opacity: 1.0 }}>{pokeDesc[currentPokemon.id - 1].description}</Text>
        </View>

        <View style={{ backgroundColor: "white", width: '100%', marginLeft: 'auto', marginRight: 'auto', height: 140, opacity: 0.9, marginTop: 0.5 }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20, opacity: 1.0, marginRight: 15 }}>Pokemon   Statistics</Text>
          <ScrollView>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <View style={{ width: '40%', marginLeft: 20, marginRight: 20 }}>
                <Text style={styles.label}>{`ID:`}</Text>
                <Text style={styles.label}>{`Height: `}</Text>
                <Text style={styles.label}>{`Weight: `}</Text>
                <Text style={styles.label}>{`Type:`}</Text>
                <Text style={styles.label}>{`Weakness: `}</Text>
                <Text style={styles.label}>{`Multipliers: `}</Text>
                <Text style={styles.label}>{`Spawn Chance: `}</Text>
                <Text style={styles.label}>{`Spawn Time: `}</Text>
                <Text style={styles.label}>{`Egg Hatch:`}</Text>
              </View>
              <View style={{ width: '54%', marginRight: 10 }}>
                <Text style={styles.label2}>{`${currentPokemon.num}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.height}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.weight}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.type.toString()}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.weaknesses.toString()}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.multipliers}`}</Text>
                <Text style={styles.label2}>{`${currentPokemon.spawn_chance}`}</Text>
                <Text style={styles.label2}>{` ${currentPokemon.spawn_time}`}</Text>
                <Text style={styles.label2}>{` ${currentPokemon.egg}`}</Text>
              </View>
            </View>

          </ScrollView>

        </View>
        <View style={{ backgroundColor: "lightgrey", width: '100%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 5, borderWidth: 3, borderColor: 'black', marginTop: 5, maxHeight: 75 }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>Evolutions</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
            {currentPokemon.next_evolution == undefined ? <Text key={currentPokemon.id} style={styles.label}>{`Evolution: Final Evolution`}</Text>
              : currentPokemon.next_evolution.map(p => <View key={p.name} style={{ width: 155, margin: 2, }}><Button color="#323232" title={`${p.name}`} onPress={() => setCurrentPokemon(pokedex.data[pokedex.data.findIndex(po => po.name === p.name)])} ></Button></View>)}
          </View>
        </View>


      </View>

      <ScrollView horizontal style={{ width: "100%", maxHeight: 300, position: 'absolute', bottom: 0, borderWidth: 2, borderColor: 'black', backgroundColor: 'lightgrey' }}>

        {pokedex.data.map(pok =>
          <TouchableOpacity key={`key${pok.id}`} style={{ borderWidth: 2, borderColor: 'black', height: '100%', marginRight: 2, marginTop: 2 }} onPress={() => ResetIndexById(pok.id)}>
            <Text style={{ textAlign: 'center', color: 'black' }}>{pok.name}</Text>
            <Image style={{ marginLeft: 'auto', marginRight: 'auto' }} source={imgs[pok.id - 1]} />
          </TouchableOpacity>

        )}
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CC0000",
    alignItems: 'center',
    justifyContent: 'center',

  },
  label: {
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold'
  },
  label2: {
    textAlign: 'left',
    fontSize: 13
  },
  pokeImg: { marginLeft: 'auto', marginRight: 'auto', borderWidth: 3, borderColor: 'black', marginBottom: 2, borderRadius: 20 }
});
