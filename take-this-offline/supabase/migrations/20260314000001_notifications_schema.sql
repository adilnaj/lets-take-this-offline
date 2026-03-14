-- push_subscriptions: one row per browser/device subscription per user
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  auth        text NOT NULL,   -- base64url-encoded auth key from PushSubscription.getKey('auth')
  p256dh      text NOT NULL,   -- base64url-encoded p256dh key from PushSubscription.getKey('p256dh')
  timezone    text NOT NULL DEFAULT 'UTC',
  notify_hour smallint NOT NULL DEFAULT 8 CHECK (notify_hour >= 0 AND notify_hour <= 23),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)   -- prevent duplicate subscriptions for same device
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- email_digest_prefs: one row per user (upsert-friendly)
CREATE TABLE IF NOT EXISTS public.email_digest_prefs (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled    boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_digest_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own email digest prefs"
  ON public.email_digest_prefs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
