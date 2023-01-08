import { useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ethers } from "ethers";
import Clipboard from "@react-native-clipboard/clipboard";

import AntIcon from "react-native-vector-icons/AntDesign";
import Blockie from "../components/Blockie";
import TokenDisplay from "../components/TokenDisplay";
import LinearGradient from "react-native-linear-gradient";

export const SendScreen = ({
  tokenSymbol,
  balance,
  price,
  gasPrice,
  tokenName,
  tokenLogo,
  toAddress,
  setToAddress,
  sendEth,
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  const formattedEthBalance =
    Math.round(ethers.utils.formatEther(balance) * 1e4) / 1e4;

  const transferCostInETH = Number(ethers.utils.formatEther(gasPrice * 21000));
  const transferCostInUSD = (transferCostInETH * price).toFixed(2);
  let insufficientFunds = false;
  if (amount && gasPrice && balance) {
    insufficientFunds =
      Number(amount) + transferCostInETH > formattedEthBalance;
  }

  const validToAddress = toAddress ? ethers.utils.isAddress(toAddress) : false;
  const validAmount = !isNaN(amount) && amount !== 0;
  const send = async () => {
    setLoading(true);
    await sendEth(amount.toString(), toAddress);
    setLoading(false);
    navigation.popToTop();
  };
  const pasteToPkInput = async () => {
    const pk = await Clipboard.getString();
    if (pk.length > 0) {
      setToAddress(pk);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.mainContainer}>
      <View style={styles.addressContainer}>
        <Text style={styles.addressContainerText}>To:</Text>
        {validToAddress && toAddress.length === 42 && (
          <Blockie address={toAddress} size={24} />
        )}
        <TextInput
          placeholder="Address"
          style={styles.addressInput}
          color={!toAddress ? "#888" : null}
          fontWeight={"800"}
          onChangeText={setToAddress}
          value={toAddress}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("QrScanner", {
            target:"address"
          })}
          style={{ marginLeft: -24 }}
        >
          <AntIcon name="scan1" size={24} color={"#4580eb"} />
        </TouchableOpacity>
        <Button title="Paste" onPress={pasteToPkInput} color={"#4580eb"} />
      </View>
      <View style={styles.ammoutContainer}>
        <TextInput
          style={{ fontSize: 50, minWidth: 70, marginRight: 10 }}
          value={!!amount ? `${amount}` : null}
          keyboardType="numeric"
          maxLength={8}
          onChangeText={(val) => setAmount(parseFloat(val.replace(",", ".")))}
          placeholder="0.0"
        />
        <Text style={styles.tokenSymbol}>{tokenSymbol}</Text>
      </View>
      <View style={styles.feedContainer}>
        <Text style={{ fontSize: 22 }}>
          <Text style={{ fontSize: 22 }}>
            {" "}
            {(amount || 0 * price).toFixed(2)} USD{" "}
          </Text>
        </Text>
    
        <View style={styles.balanceContainer}>
          <Text style={{ fontSize: 16}}>
            Est. Fee:{" "}
            <Text style={{ fontSize: 16 }}>{transferCostInUSD} USD</Text>
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.tokenBalance}>
            Balance:
            {parseFloat(formattedEthBalance.toFixed(9))} {tokenSymbol}
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.buttonMain}
          disabled={
            insufficientFunds || !validToAddress || !validAmount || loading
          }
          onPress={send}
        >
          <LinearGradient
            colors={
              !validToAddress || !validAmount || loading
                ? ["#888", "#888", "#888"]
                : ["#4580eb", "#249ff5", "#05bcff"]
            }
            style={styles.linearGradient}
          >
            <Text style={styles.confirmText}>
              {insufficientFunds ? "Insufficient funds" : "Confirm"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonMain}
          onPress={() => {
            navigation.popToTop();
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height:"100%",
    backgroundColor: "#fff",
    flexDirection: "column",
    paddingHorizontal: 15,
  },
  addressContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addressContainerText: {
    marginRight: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#888",
  },
  addressInput: {
    flex: 7,
    borderBottomWidth: 0,
    fontSize: 18,
    paddingRight: 28,
    marginLeft: 10,
    marginTop: 4,
  },
  balanceContainer: {
    width: "100%",
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  ammoutContainer: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tokenSymbol: {
    fontSize: 36,
    textAlign: "left",
    fontWeight: "500",
  },
  feedContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsContainer: {
    marginTop: 48,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  buttonMain: {
    paddingVertical: 16,
    borderRadius: 32,
    width: "100%",
  },
  cancelText: {
    fontSize: 21,
    fontWeight: "500",
    color: "#0084ff",
    textAlign: "center",
  },
  confirmText: {
    fontSize: 21,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  linearGradient: {
    borderRadius: 50,
    height: 50,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
