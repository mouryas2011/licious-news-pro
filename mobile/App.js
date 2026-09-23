import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  FlatList,
  ActivityIndicator,
  Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const API_BASE = "https://YOUR-DOMAIN.com/api";
const CATS = ["सभी", "भारत", "बिजनेस", "टेक", "स्पोर्ट्स", "दुनिया", "मनोरंजन"];
const FALLBACK = [
  {
    id: "1",
    cat: "भारत",
    time: "10 min ago",
    title: "सरकार ने नई डिजिटल पहल का ऐलान किया",
    summary:
      "नई पहल का उद्देश्य डिजिटल सेवाओं को आम लोगों तक आसान तरीके से पहुंचाना है। आने वाले महीनों में कई नई सुविधाएं जोड़ी जा सकती हैं।",
    source: "Licious News",
    url: "https://news.google.com/"
  },
  {
    id: "2",
    cat: "बिजनेस",
    time: "25 min ago",
    title: "भारतीय बाजार में निवेशकों की नजर चुनिंदा सेक्टर्स पर",
    summary:
      "निवेशक इंफ्रास्ट्रक्चर, डिफेंस और डिजिटल सेवाओं जैसे क्षेत्रों पर नजर रख रहे हैं। निवेश से पहले जोखिम और वैल्यूएशन देखना जरूरी है।",
    source: "Licious News",
    url: "https://news.google.com/"
  },
  {
    id: "3",
    cat: "टेक",
    time: "40 min ago",
    title: "AI टेक्नोलॉजी में कंपनियां बढ़ा रहीं निवेश",
    summary:
      "आर्टिफिशियल इंटेलिजेंस के बढ़ते इस्तेमाल के साथ कंपनियां ऑटोमेशन और स्मार्ट असिस्टेंट पर खर्च बढ़ा रही हैं।",
    source: "Licious News",
    url: "https://news.google.com/"
  }
];

async function getNews() {
  try {
    const r = await fetch(`${API_BASE}/news`);
    if (!r.ok) throw new Error("api");
    const j = await r.json();
    return j.news || FALLBACK;
  } catch (e) {
    return FALLBACK;
  }
}

async function registerPush() {
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.status !== "granted") {
      const r = await Notifications.requestPermissionsAsync();
      if (r.status !== "granted") return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    try {
      await fetch(`${API_BASE}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
    } catch (e) {}
    return token;
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [cat, setCat] = useState("सभी");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    (async () => {
      setNews(await getNews());
      const s = JSON.parse((await AsyncStorage.getItem("saved")) || "{}");
      setSaved(s);
      try {
        await registerPush();
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => (cat === "सभी" ? news : news.filter((x) => x.cat === cat)),
    [cat, news]
  );

  const save = async (id) => {
    const n = { ...saved, [id]: !saved[id] };
    setSaved(n);
    await AsyncStorage.setItem("saved", JSON.stringify(n));
  };

  const share = async (n) =>
    Share.share({
      message: `${n.title}\n\n${n.summary}\n\n${n.url || ""}`
    });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Latest news loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.logo}>Licious News</Text>
        <Text style={styles.sub}>कम शब्दों में बड़ी खबर</Text>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(x) => x.id}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        ListHeaderComponent={
          <FlatList
            data={CATS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cats}
            keyExtractor={(x) => x}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setCat(item)}
                style={[styles.cat, cat === item && styles.active]}
              >
                <Text
                  style={[styles.catText, cat === item && styles.activeText]}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.badge}>{item.cat}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <Text style={styles.source}>Source: {item.source}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => save(item.id)}>
                <Text style={styles.act}>
                  {saved[item.id] ? "★ Saved" : "☆ Save"}
                </Text>
              </Pressable>
              <Pressable onPress={() => share(item)}>
                <Text style={styles.act}>↗ Share</Text>
              </Pressable>
              <Pressable
                style={styles.read}
                onPress={() =>
                  Linking.openURL(item.url || "https://news.google.com/")
                }
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Read full →
                </Text>
              </Pressable>
            </View>
            <Text style={styles.swipe}>↑ Swipe for next news</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { backgroundColor: "#fff", padding: 18 },
  logo: { fontSize: 29, fontWeight: "900" },
  sub: { color: "#777", marginTop: 3 },
  cats: { padding: 12, backgroundColor: "#fff" },
  cat: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 8
  },
  active: { backgroundColor: "#111", borderColor: "#111" },
  catText: { fontWeight: "700" },
  activeText: { color: "#fff" },
  card: {
    minHeight: 620,
    backgroundColor: "#fff",
    marginTop: 7,
    padding: 23,
    justifyContent: "center"
  },
  row: { flexDirection: "row", alignItems: "center" },
  badge: {
    fontWeight: "800",
    backgroundColor: "#eee",
    padding: 7,
    borderRadius: 6
  },
  time: { color: "#888", marginLeft: 10, fontSize: 12 },
  title: { fontSize: 30, lineHeight: 38, fontWeight: "900", marginTop: 20 },
  summary: { fontSize: 18, lineHeight: 29, color: "#444", marginTop: 18 },
  source: { fontSize: 12, color: "#888", marginTop: 22 },
  actions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 25 },
  act: { fontWeight: "800" },
  read: {
    marginLeft: "auto",
    backgroundColor: "#111",
    padding: 11,
    borderRadius: 8
  },
  swipe: { textAlign: "center", color: "#aaa", marginTop: 48, fontSize: 12 }
});