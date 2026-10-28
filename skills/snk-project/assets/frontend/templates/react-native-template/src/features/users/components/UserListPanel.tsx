import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/core/http/apiError';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/theme/useAppTheme';
import { useUsers } from '../hooks/useUsers';

/** 受保护接口示例：调用需要 accessToken 的用户列表。 */
export function UserListPanel() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { data, error, isError, isFetching, refetch } = useUsers({ page: 1, limit: 5 });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>{t('users.title')}</Text>
          <Text style={{ color: theme.colors.mutedForeground }}>{t('users.description')}</Text>
        </View>
        <Button
          title={t('common.refresh')}
          variant="outline"
          size="sm"
          loading={isFetching}
          onPress={() => void refetch()}
        />
      </View>

      {isError ? (
        <Text accessibilityRole="alert" style={{ color: theme.colors.destructive }}>
          {getErrorMessage(error, t('users.loadFailed'))}
        </Text>
      ) : null}

      {data ? (
        <View style={styles.list}>
          <Text style={{ color: theme.colors.mutedForeground }}>
            {t('users.summary', { count: data.items.length, total: data.pagination.total })}
          </Text>
          {data.items.length === 0 ? (
            <Text style={{ color: theme.colors.mutedForeground }}>{t('common.empty')}</Text>
          ) : (
            data.items.map((user) => (
              <View key={user.id} style={[styles.row, { borderColor: theme.colors.border }]}>
                <Text style={[styles.name, { color: theme.colors.foreground }]}>{user.name}</Text>
                <Text style={{ color: theme.colors.mutedForeground }}>{user.email ?? '—'}</Text>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '600' },
  list: { gap: 8 },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { fontWeight: '600' },
});
