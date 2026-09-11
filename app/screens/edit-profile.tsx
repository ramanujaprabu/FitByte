import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { DS } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api/user';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOALS = ['Lose Fat', 'Build Muscle', 'Maintain Weight', 'Improve Endurance', 'Increase Strength'];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState('');
  const [goal, setGoal] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setQuote(user.quote);
      setGoal(user.goal);
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ name, quote, goal });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await userService.uploadAvatar(result.assets[0].uri);
      setAvatarUrl(publicUrl);
      await refreshUser();
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Edit Profile" subtitle="Update your information" />

        {/* Avatar */}
        <Card>
          <View style={styles.avatarSection}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            <Pressable style={styles.changeAvatarBtn} onPress={handleChangePhoto} disabled={uploadingAvatar}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={DS.textSecond} />
              ) : (
                <Ionicons name="camera-outline" size={15} color={DS.textSecond} />
              )}
              <ThemedText style={styles.changeAvatarText}>Change Photo</ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* Fields */}
        <Card>
          <ThemedText style={styles.sectionLabel}>Personal Info</ThemedText>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={DS.textMuted}
              style={styles.input}
            />
          </View>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.fieldLabel}>Email</ThemedText>
            <TextInput
              value={email}
              editable={false}
              placeholder="your@email.com"
              placeholderTextColor={DS.textMuted}
              style={[styles.input, { opacity: 0.6 }]}
            />
          </View>
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

        <Pressable onPress={handleSave} disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#fff" />
              <ThemedText style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</ThemedText>
            </>
          )}
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
