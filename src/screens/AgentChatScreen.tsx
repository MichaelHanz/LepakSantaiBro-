import { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { PromptBar } from '../components/chat/PromptBar';
import { ThinkingBubble } from '../components/chat/ThinkingBubble';
import { BlindConstraintsSheet } from '../components/onboarding/BlindConstraintsSheet';
import { calculateGroupSafeLimit } from '../lib/engines/safeLimit';
import { useTripAgent } from '../state/useTripAgent';
import { colors } from '../theme';

export function AgentChatScreen() {
  const { state, messages, thinking, send, submitConstraints } = useTripAgent();
  const [constraintsOpen, setConstraintsOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const safeLimit = useMemo(() => calculateGroupSafeLimit(state.members), [state.members]);

  const handleSend = useCallback(
    (prompt: string) => {
      void send(prompt);
    },
    [send],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ChatHeader
        trip={state.trip}
        safeLimit={safeLimit}
        onOpenConstraints={() => setConstraintsOpen(true)}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.transcript}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onPickExample={handleSend} />
          ))}
          {thinking ? <ThinkingBubble /> : null}
        </ScrollView>

        <View>
          <PromptBar onSend={handleSend} disabled={thinking} />
        </View>
      </KeyboardAvoidingView>

      <BlindConstraintsSheet
        visible={constraintsOpen}
        submittedCount={state.submitted_member_ids.length}
        memberCount={state.members.length}
        onClose={() => setConstraintsOpen(false)}
        onSubmit={(input) => {
          void submitConstraints(input);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  transcript: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
});
