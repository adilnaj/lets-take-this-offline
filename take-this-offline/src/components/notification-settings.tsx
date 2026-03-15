'use client'
import { useState } from 'react'

interface NotificationSettingsProps {
  initialPushEnabled: boolean
  initialPushHour: number
  initialEmailEnabled: boolean
  userEmail: string
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 ${
        checked ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function NotificationSettings({
  initialPushEnabled,
  initialPushHour,
  initialEmailEnabled,
  userEmail,
}: NotificationSettingsProps) {
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled)
  const [pushHour, setPushHour] = useState(initialPushHour)
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled)
  const [pushLoading, setPushLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  async function subscribePush(hour: number) {
    if (Notification.permission === 'denied') {
      setPushError('Push blocked in browser settings. You can still use email notifications.')
      setPushEnabled(false)
      return false
    }

    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      setPushError('Push blocked in browser settings. You can still use email notifications.')
      setPushEnabled(false)
      return false
    }

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setPushError('Push notifications are not configured yet. Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to your environment.')
      setPushEnabled(false)
      return false
    }

    let sub: PushSubscription
    try {
      const reg = await navigator.serviceWorker.ready
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
    } catch {
      setPushError('Failed to subscribe to push notifications. Check your VAPID configuration.')
      setPushEnabled(false)
      return false
    }

    const auth = arrayBufferToBase64Url(sub.getKey('auth')!)
    const p256dh = arrayBufferToBase64Url(sub.getKey('p256dh')!)

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        auth,
        p256dh,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifyHour: hour,
      }),
    })

    if (!res.ok) {
      setPushError('Failed to save subscription. Please try again.')
      setPushEnabled(false)
      return false
    }

    setPushError(null)
    return true
  }

  async function handlePushToggle() {
    if (pushLoading) return
    setPushLoading(true)

    if (!pushEnabled) {
      const ok = await subscribePush(pushHour)
      if (ok) setPushEnabled(true)
    } else {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setPushEnabled(false)
    }

    setPushLoading(false)
  }

  async function handleHourChange(newHour: number) {
    setPushHour(newHour)
    if (pushEnabled) {
      setPushLoading(true)
      await subscribePush(newHour)
      setPushLoading(false)
    }
  }

  async function handleEmailToggle() {
    if (emailLoading) return
    setEmailLoading(true)

    if (!emailEnabled) {
      const res = await fetch('/api/email/subscribe', { method: 'POST' })
      if (res.ok) setEmailEnabled(true)
    } else {
      const res = await fetch('/api/email/unsubscribe', { method: 'DELETE' })
      if (res.ok) setEmailEnabled(false)
    }

    setEmailLoading(false)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>

      {/* Push */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Daily push reminder</p>
            <p className="text-xs text-muted-foreground">Delivered to this browser/device</p>
          </div>
          <Toggle checked={pushEnabled} onChange={handlePushToggle} disabled={pushLoading} />
        </div>
        {pushEnabled && (
          <div className="flex items-center gap-2 pl-2">
            <label htmlFor="push-hour" className="text-sm text-muted-foreground">Time</label>
            <select
              id="push-hour"
              value={pushHour}
              onChange={(e) => handleHourChange(Number(e.target.value))}
              disabled={pushLoading}
              className="text-sm border rounded px-2 py-1 bg-background text-foreground disabled:opacity-50"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{formatHour(i)}</option>
              ))}
            </select>
          </div>
        )}
        {pushError && <p className="text-xs text-amber-600">{pushError}</p>}
      </div>

      {/* Email */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Daily email digest</p>
          <p className="text-xs text-muted-foreground">Sent to {userEmail} each morning</p>
        </div>
        <Toggle checked={emailEnabled} onChange={handleEmailToggle} disabled={emailLoading} />
      </div>
    </section>
  )
}
