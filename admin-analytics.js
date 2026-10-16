(() => {
  const config = window.PORTFOLIO_ANALYTICS;
  const setupMessage = document.querySelector('#setup-message');
  const loginPanel = document.querySelector('#login-panel');
  const dashboard = document.querySelector('#dashboard');
  const form = document.querySelector('#login-form');
  const loginMessage = document.querySelector('#login-message');

  if (!config?.supabaseUrl || !config?.supabaseAnonKey || !window.supabase) {
    setupMessage.hidden = false;
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  document.querySelector('#admin-email').value = config.adminEmail;

  function showLogin(message = '') {
    dashboard.hidden = true;
    loginPanel.hidden = false;
    loginMessage.textContent = message;
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
  }

  function isAdmin(user) {
    return user?.email?.toLowerCase() === config.adminEmail.toLowerCase();
  }

  function escapeText(value) {
    return String(value ?? '—');
  }

  function displayTime(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value));
  }

  function renderRows(rows) {
    const body = document.querySelector('#visits-list');
    body.replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'empty-state';
      cell.textContent = 'No visits recorded yet. Open the portfolio in another tab to create a visit.';
      row.append(cell);
      body.append(row);
      return;
    }

    for (const visit of rows.slice(0, 100)) {
      const row = document.createElement('tr');
      for (const value of [displayTime(visit.created_at), visit.page_path, visit.device_type, visit.browser, visit.operating_system, visit.referrer_host || 'Direct']) {
        const cell = document.createElement('td');
        cell.textContent = escapeText(value);
        row.append(cell);
      }
      body.append(row);
    }
  }

  async function refreshDashboard() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [{ data, error }, { count, error: countError }] = await Promise.all([
      client.from('visitor_events')
      .select('id,session_id,created_at,page_path,device_type,browser,operating_system,referrer_host')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000),
      client.from('visitor_events').select('id', { count: 'exact', head: true })
    ]);

    if (error) {
      document.querySelector('#live-status').textContent = 'Could not load visit data. Check the Supabase setup and access rules.';
      document.querySelector('#live-dot').classList.remove('connected');
      return;
    }

    const visits = data || [];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activeSessionIds = new Set(visits.filter((visit) => Date.parse(visit.created_at) >= fiveMinutesAgo).map((visit) => visit.session_id));
    const dailySessionIds = new Set(visits.map((visit) => visit.session_id));
    document.querySelector('#active-sessions').textContent = activeSessionIds.size;
    document.querySelector('#sessions-day').textContent = dailySessionIds.size;
    document.querySelector('#views-day').textContent = countError ? '—' : (count ?? 0);
    document.querySelector('#updated-at').textContent = `Updated ${new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date())}`;
    renderRows(visits);
  }

  async function startAdmin(user) {
    if (!isAdmin(user)) {
      await client.auth.signOut();
      showLogin('This account is not permitted to view the portfolio analytics.');
      return;
    }

    showDashboard();
    const status = document.querySelector('#live-status');
    const liveDot = document.querySelector('#live-dot');
    await refreshDashboard();
    const channel = client.channel('admin-visitor-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_events' }, refreshDashboard)
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          status.textContent = 'Live updates connected';
          liveDot.classList.add('connected');
        } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') {
          status.textContent = 'Live connection interrupted; retrying…';
          liveDot.classList.remove('connected');
        }
      });

    document.querySelector('#sign-out').onclick = async () => {
      await client.removeChannel(channel);
      await client.auth.signOut();
      showLogin('You have signed out.');
    };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    loginMessage.textContent = 'Signing in…';
    const { data, error } = await client.auth.signInWithPassword({
      email: form.elements.email.value.trim(),
      password: form.elements.password.value
    });
    button.disabled = false;
    if (error) {
      showLogin('Sign-in failed. Check the email and password for your Supabase admin account.');
      return;
    }
    await startAdmin(data.user);
  });

  client.auth.getSession().then(({ data }) => {
    if (data.session?.user) startAdmin(data.session.user);
    else showLogin();
  });
})();
