<<<<<<< HEAD
import { Avatar } from '@/components/shared/Avatar';
=======
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
import { BackButton } from '@/components/shared/BackButton';
import { Card } from '@/components/shared/Card';
import { ScreenHeader } from '@/components/shared/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
<<<<<<< HEAD
import { useDS } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/api/user';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
=======
import { DS } from '@/constants/theme';
import { MOCK_USER } from '@/data/profile';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOALS = ['Lose Fat', 'Build Muscle', 'Maintain Weight', 'Improve Endurance', 'Increase Strength'];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
<<<<<<< HEAD
  const DS = useDS();
  const styles = useMemo(() => makeStyles(DS), [DS]);
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

  const handleRemovePhoto = () => {
    Alert.alert('Remove photo?', 'Your profile will show your initials instead.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          setUploadingAvatar(true);
          try {
            await userService.removeAvatar();
            setAvatarUrl('');
            await refreshUser();
          } catch (e: any) {
            Alert.alert('Could not remove photo', e?.message ?? 'Something went wrong.');
          } finally {
            setUploadingAvatar(false);
          }
        },
      },
    ]);
  };
=======
  const [name, setName] = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [quote, setQuote] = useState(MOCK_USER.quote);
  const [goal, setGoal] = useState(MOCK_USER.goal);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}>

        <ScreenHeader title="Edit Profile" subtitle="Update your information" />

        {/* Avatar */}
        <Card>
          <View style={styles.avatarSection}>
<<<<<<< HEAD
            {uploadingAvatar ? (
              <View style={[styles.avatarLoading, { width: 90, height: 90 }]}>
                <ActivityIndicator color={DS.textSecond} />
              </View>
            ) : (
              <Avatar uri={avatarUrl || undefined} name={name || 'User'} size={90} />
            )}
            <View style={styles.avatarActionsRow}>
              <Pressable style={styles.changeAvatarBtn} onPress={handleChangePhoto} disabled={uploadingAvatar}>
                <Ionicons name="camera-outline" size={15} color={DS.textSecond} />
                <ThemedText style={styles.changeAvatarText}>Change Photo</ThemedText>
              </Pressable>
              {!!avatarUrl && (
                <Pressable style={styles.removeAvatarBtn} onPress={handleRemovePhoto} disabled={uploadingAvatar}>
                  <ThemedText style={styles.removeAvatarText}>Remove</ThemedText>
                </Pressable>
              )}
            </View>
=======
            <Image source={{ uri: MOCK_USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
            <Pressable style={styles.changeAvatarBtn}>
              <Ionicons name="camera-outline" size={15} color={DS.textSecond} />
              <ThemedText style={styles.changeAvatarText}>Change Photo</ThemedText>
            </Pressable>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
          </View>
        </Card>

        {/* Fields */}
        <Card>
          <ThemedText style={styles.sectionLabel}>Personal Info</ThemedText>
<<<<<<< HEAD
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
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
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

<<<<<<< HEAD
        <Pressable onPress={handleSave} disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
          {saving ? (
            <ActivityIndicator color={DS.accentText} />
          ) : (
            <>
              <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color={DS.accentText} />
              <ThemedText style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</ThemedText>
            </>
          )}
=======
        <Pressable onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}>
          <Ionicons name={saved ? 'checkmark-circle-outline' : 'save-outline'} size={18} color="#fff" />
          <ThemedText style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</ThemedText>
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
        </Pressable>

      </ScrollView>
    </View>
  );
}

<<<<<<< HEAD
function makeStyles(DS: ReturnType<typeof useDS>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: DS.bg },
    scroll: { paddingHorizontal: 20 },
    avatarSection: { alignItems: 'center', gap: 14 },
    avatarLoading: { borderRadius: 45, backgroundColor: DS.raised, alignItems: 'center', justifyContent: 'center' },
    avatarActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    changeAvatarBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: DS.raised, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
    changeAvatarText: { fontSize: 13, color: DS.textSecond, fontWeight: '500' },
    removeAvatarBtn: { paddingHorizontal: 10, paddingVertical: 8 },
    removeAvatarText: { fontSize: 13, color: DS.statusBad, fontWeight: '500' },
    sectionLabel: { fontSize: 12, color: DS.textMuted, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    fieldGroup: { marginBottom: 14 },
    fieldLabel: { fontSize: 12, color: DS.textMuted, marginBottom: 7 },
    input: { backgroundColor: DS.raised, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: DS.textPrimary },
    textarea: { minHeight: 80, textAlignVertical: 'top' },
    goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: DS.border, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: DS.accent },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: DS.accent },
    goalText: { fontSize: 14, color: DS.textPrimary },
    saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: DS.accent, paddingVertical: 15, borderRadius: 14 },
    saveBtnText: { color: DS.accentText, fontWeight: '600', fontSize: 15 },
  });
}
=======
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
>>>>>>> 46b69503e3227789042a618d42dcb60179f909f6
