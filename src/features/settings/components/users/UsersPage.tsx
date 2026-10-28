import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { ConfirmationDialog } from './components/ConfirmationDialog'
import { InviteCreatedDialog } from './components/InviteCreatedDialog'
import { InviteDialog } from './components/InviteDialog'
import { InviteTable } from './components/InviteTable'
import { PageHeader } from './components/PageHeader'
import { PermissionsTable } from './components/PermissionsTable'
import { TabNav } from './components/TabNav'
import { UserDetail } from './components/UserDetail'
import { UserFilters } from './components/UserFilters'
import { UsersTable } from './components/UsersTable'
import { useSettingsUsers } from './hooks/useSettingsUsers'

export function UsersPage() {
  const state = useSettingsUsers()
  const openInvite = () => state.openInvite()

  if (state.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader onInvite={openInvite} />
        <div className="h-12 animate-pulse rounded-xl bg-muted/40" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted/30" />
      </div>
    )
  }

  if (state.isError || !state.data || !state.me) {
    return (
      <div className="space-y-5">
        <PageHeader onInvite={openInvite} />
        <InlineAlert variant="destructive">
          <InlineAlertDescription>No se pudo cargar la administración de usuarios. Vuelve a intentarlo en unos momentos.</InlineAlertDescription>
        </InlineAlert>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader onInvite={openInvite} />
      <TabNav tab={state.tab} onTab={state.setTab} userCount={state.users.length} inviteCount={state.invites.length} />
      {state.tab === 'users' && (
        <>
          <UserFilters
            search={state.search}
            onSearch={state.setSearch}
            role={state.role}
            onRole={state.setRole}
            status={state.status}
            onStatus={state.setStatus}
          />
          <UsersTable users={state.filteredUsers} currentUserId={state.me.id} onView={state.setSelectedUser} hydrated={state.hydrated} />
        </>
      )}
      {state.tab === 'invites' && (
        <InviteTable
          invites={state.invites}
          onRevoke={(invite) => state.setConfirmation({ kind: 'revoke', invite })}
          onRenew={(invite) => state.openInvite({ email: invite.email, role: invite.role === 'admin' ? 'admin' : 'member' })}
          hydrated={state.hydrated}
        />
      )}
      {state.tab === 'roles' && <PermissionsTable />}

      <UserDetail
        user={state.selectedUser}
        onClose={() => state.setSelectedUser(null)}
        onRole={(role) =>
          state.selectedUser && role !== state.selectedUser.role && state.setConfirmation({ kind: 'role', user: state.selectedUser, role })
        }
        onStatus={(status) => state.selectedUser && state.setConfirmation({ kind: 'status', user: state.selectedUser, status })}
        onImpersonate={() => state.selectedUser && state.setConfirmation({ kind: 'impersonate', user: state.selectedUser })}
        busy={state.busy}
        isLastAdmin={state.selectedUser?.role === 'admin' && state.activeAdmins <= 1}
        canImpersonate={state.me.role === 'superadmin' && state.selectedUser?.id !== state.me.id}
      />
      <InviteDialog
        open={state.inviteOpen}
        onOpenChange={state.setInviteOpen}
        mailEnabled={state.authConfig?.mail ?? false}
        initialInvite={state.inviteDraft}
        onSubmit={state.createInvite}
        pending={state.busy}
      />
      <InviteCreatedDialog result={state.createdInvite} onClose={() => state.setCreatedInvite(null)} onInviteAnother={state.inviteAnother} />
      <ConfirmationDialog
        confirmation={state.confirmation}
        onClose={() => state.setConfirmation(null)}
        onConfirm={state.confirmAction}
        pending={state.busy}
        lastAdminCount={state.activeAdmins}
      />
    </div>
  )
}
