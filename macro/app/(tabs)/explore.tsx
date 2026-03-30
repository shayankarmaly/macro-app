import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { Food } from "@/types";
import { searchFoods } from "@/lib/api/foods";
import { useDiaryStore } from "@/stores/diaryStore";
import { MOCK_FOODS } from "@/data/mockData";

function FoodResultRow({
  food,
  onPress,
}: {
  food: Food;
  onPress: (food: Food) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Text style={styles.resultEmoji}>{food.emoji}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>
          {food.name}
        </Text>
        {food.brand && (
          <Text style={styles.resultBrand} numberOfLines={1}>
            {food.brand}
          </Text>
        )}
        <Text style={styles.resultServing}>
          {food.servingSize} {food.servingUnit}
        </Text>
      </View>
      <View style={styles.resultMacros}>
        <Text style={styles.resultCals}>{food.macros.calories}</Text>
        <Text style={styles.resultCalsUnit}>kcal</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>(MOCK_FOODS);
  const [isSearching, setIsSearching] = useState(false);
  const { setPendingMeal } = useDiaryStore();

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults(MOCK_FOODS);
      return;
    }
    setIsSearching(true);
    try {
      // First try Open Food Facts, fall back to local mock
      const found = await searchFoods(text);
      setResults(found.length > 0 ? found : MOCK_FOODS.filter((f) =>
        f.name.toLowerCase().includes(text.toLowerCase())
      ));
    } catch {
      setResults(
        MOCK_FOODS.filter((f) =>
          f.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectFood = (food: Food) => {
    Keyboard.dismiss();
    setPendingMeal({
      food,
      method: "manual",
      mealType: "breakfast",
      quantity: 1,
    });
    router.push({
      pathname: "/modals/confirm-meal",
      params: {
        payload: JSON.stringify({
          food,
          method: "manual",
          mealType: "breakfast",
          quantity: 1,
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Foods</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search 3M+ foods..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {isSearching && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodResultRow food={item} onPress={handleSelectFood} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {query ? `Results for "${query}"` : "Popular foods"}
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  resultEmoji: { fontSize: 24 },
  resultInfo: { flex: 1, gap: 2 },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  resultBrand: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  resultServing: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resultMacros: {
    alignItems: "flex-end",
  },
  resultCals: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  resultCalsUnit: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  separator: {
    height: 8,
  },
});
