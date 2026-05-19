import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { MOCK_USER } from '@/data/profile';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOALS = ['Lose Fat', 'Build Muscle', 'Maintain Weight', 'Improve Endurance', 'Increase Strength'];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [quote, setQuote] = useState(MOCK_USER.quote);
  const [goal, setGoal] = useState(MOCK_USER.goal);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Edit Profile" subtitle="Update your information" />

        {/* Avatar */}
        <Card>
          <View style={styles.avatarSection}>
            <Image source={{ uri: MOCK_USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
            <Pressable style={styles.changeAvatarBtn}>
              <Ionicons name="camera-outline" size={15} color={DS.textSecond} />
              <ThemedText style={styles.changeAvatarText}>Change Photo</ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* Fields */}
        <Card>
          <ThemedText style={styles.sectionLabel}>Personal Info</ThemedText>
          {[
            { label: 'Full Name', val: name, set: setName, placeholder: 'Your name' },
            { label: 'Email', val: email, set: setEmail, placeholder: 'your@email.com' },
          ].map(field => (
            <View key={field.label} style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>{field.label}</ThemedText>
              <TextInput
                value={field.val}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={DS.textMuted}
                style={styles.input}
              />
            </View>
          ))}
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Motivational Quote</ThemedText>
          <TextInput
            value={quote}
            onChangeText={setQuote}
            placeholder="Something that motivates you…"
            placeholderTextColor={DS.textMuted}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card>
          <ThemedText style={styles.sectionLabel}>Primary Goal</ThemedText>
          {GOALS.map(g => (
            <Pressable key={g} onPress={() => setGoal(g)} style={styles.goalRow}>
              <View style={[styles.radioOuter, goal === g && styles.radioActive]}>
                {goal === g && <View style={styles.radioInner} />}
              </View>
              <ThemedText style={styles.goalText}>{g}</ThemedText>
            </Pressable>
          ))}
        </Card>

        <Pressable onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#fff" />
          <ThemedText style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</ThemedText>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.bg },
  scroll: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', gap: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: DS.border },
  changeAvatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: DS.raised, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: DS.border },
  changeAvatarText: { fontSize: 13, color: DS.textSecond, fontWeight: '500' },
  sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: DS.textMuted, marginBottom: 7 },
  input: { backgroundColor: DS.card, borderRadius: 10, borderWidth: 1, borderColor: DS.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: DS.textPrimary },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: DS.accent },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS.accent },
  goalText: { fontSize: 14, color: DS.textPrimary },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
