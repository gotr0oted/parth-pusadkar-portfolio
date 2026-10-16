(() => {
  const config = window.PORTFOLIO_ANALYTICS;
  if (!config?.supabaseUrl || !config?.supabaseAnonKey || !window.supabase) return;
  if (location.hostname !== 'gotr0oted.github.io') return;

  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  const storageKey = 'portfolio-visit-session';
  let sessionId = sessionStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }

  const userAgent = navigator.userAgent;
  const deviceType = /ipad|tablet|android(?!.*mobile)/i.test(userAgent)
    ? 'tablet'
    : /mobi|iphone|android/i.test(userAgent) ? 'mobile' : 'desktop';
  const browser = /edg\//i.test(userAgent) ? 'Edge'
    : /opr\//i.test(userAgent) ? 'Opera'
      : /firefox\//i.test(userAgent) ? 'Firefox'
        : /samsungbrowser/i.test(userAgent) ? 'Samsung Internet'
          : /chrome\//i.test(userAgent) ? 'Chrome'
            : /safari\//i.test(userAgent) ? 'Safari' : 'Other';
  const operatingSystem = /windows/i.test(userAgent) ? 'Windows'
    : /iphone|ipad|ipod/i.test(userAgent) ? 'iOS'
      : /android/i.test(userAgent) ? 'Android'
        : /mac os/i.test(userAgent) ? 'macOS'
          : /cros/i.test(userAgent) ? 'ChromeOS'
            : /linux/i.test(userAgent) ? 'Linux' : 'Other';

  async function recordPageView() {
    const referrerHost = (() => {
      try { return document.referrer ? new URL(document.referrer).hostname : null; }
      catch { return null; }
    })();

    const { error } = await client.from('visitor_events').insert({
      session_id: sessionId,
      page_path: `${location.pathname}${location.hash}`.slice(0, 500),
      device_type: deviceType,
      browser,
      operating_system: operatingSystem,
      referrer_host: referrerHost
    });
    if (error) console.info('Portfolio visit tracking is not configured yet.');
  }

  recordPageView();
  window.addEventListener('hashchange', recordPageView);
})();
