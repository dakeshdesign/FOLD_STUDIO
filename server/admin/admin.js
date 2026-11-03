// FOLD inquiry dashboard. All customer text is rendered with textContent (never innerHTML).
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const store = {
    get token() { try { return sessionStorage.getItem('fold_admin_token') || ''; } catch { return ''; } },
    set token(v) { try { v ? sessionStorage.setItem('fold_admin_token', v) : sessionStorage.removeItem('fold_admin_token'); } catch { /* ignore */ } },
    get name() { try { return sessionStorage.getItem('fold_admin_name') || ''; } catch { return ''; } },
    set name(v) { try { sessionStorage.setItem('fold_admin_name', v); } catch { /* ignore */ } },
  };
  let meta = null;
  let selectedId = '';

  const el = (tag, props = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = v;
      else if (k === 'on') for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
      else if (k in node) node[k] = v;
      else node.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null) node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return node;
  };

  const ist = (iso) => iso ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) + ' IST' : '—';
  const statusLabel = (s) => meta?.statuses.find((x) => x.value === s)?.label || s;

  const api = async (path, opts = {}) => {
    const res = await fetch(path, {
      ...opts,
      headers: { Authorization: `Bearer ${store.token}`, 'X-Staff-Name': store.name, ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    if (res.status === 401) { lock('Session expired or token invalid.'); throw new Error('unauthorized'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const lock = (message = '') => {
    store.token = '';
    $('app').hidden = true;
    $('logout').hidden = true;
    $('login').hidden = false;
    $('login-error').textContent = message;
  };

  const notifPill = (s) => el('span', { class: `pill ${['FAILED', 'BOUNCED'].includes(s) ? 'warn' : s === 'DELIVERED' ? 'ok' : ''}` }, `EMAIL ${s}`);

  const renderStats = async () => {
    const s = await api('/api/admin/stats');
    const tiles = [
      ['Total', s.total], ['New', s.byStatus.NEW], ['Contacted', s.byStatus.CONTACTED],
      ['Quotation sent', s.byStatus.QUOTATION_SENT], ['Accepted', s.byStatus.ACCEPTED],
      ['Closed', s.byStatus.CLOSED + s.byStatus.DECLINED + s.byStatus.COMPLETED],
    ];
    $('stats').replaceChildren(...tiles.map(([label, n]) => el('div', { class: 'stat' }, el('span', { class: 'mono' }, label), el('b', {}, n))));
    const warnings = [];
    if (meta.emailProvider === 'none') warnings.push('No email provider configured: notifications are queued but NOT being sent. Set RESEND_API_KEY and EMAIL_FROM.');
    if (s.failedNotifications) warnings.push(`${s.failedNotifications} inquiry notification(s) failed — open them and use “Retry notification”.`);
    if (s.stuckJobs) warnings.push(`${s.stuckJobs} email job(s) overdue by 15+ minutes. Check the server logs and the cron job.`);
    $('warnings').replaceChildren(...warnings.map((w) => el('div', { class: 'banner', role: 'status' }, w)));
  };

  const renderList = async () => {
    const status = $('filter').value;
    const { inquiries } = await api(`/api/admin/inquiries${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    if (!inquiries.length) return $('list').replaceChildren(el('li', { class: 'muted' }, 'No inquiries yet.'));
    $('list').replaceChildren(...inquiries.map((q) => el('li', {},
      el('button', { type: 'button', 'aria-current': String(q.id === selectedId), on: { click: () => select(q.id) } },
        el('strong', {}, q.customer_name), el('br'),
        el('span', { class: 'muted' }, q.selected_services.join(', ')), el('br'),
        el('span', { class: 'pill' }, statusLabel(q.status)), notifPill(q.notification_status),
        el('span', { class: 'muted' }, ist(q.created_at))))));
  };

  const select = async (id) => {
    selectedId = id;
    history.replaceState(null, '', `#${encodeURIComponent(id)}`);
    try {
      renderDetail(await api(`/api/admin/inquiries/${encodeURIComponent(id)}`));
    } catch (err) {
      $('detail').replaceChildren(el('p', { class: 'error' }, err.message));
    }
    renderList().catch(() => {});
  };

  const update = async (id, patch, button) => {
    if (button) button.disabled = true;
    try {
      renderDetail(await api(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }));
      await Promise.all([renderList(), renderStats()]);
    } catch (err) {
      alert(err.message);
    } finally {
      if (button) button.disabled = false;
    }
  };

  const renderDetail = ({ inquiry: q, events, jobs }) => {
    const statusSel = el('select', { id: 'f-status' }, meta.statuses.map((s) => el('option', { value: s.value, selected: s.value === q.status }, s.label)));
    const ownerSel = el('select', { id: 'f-owner' }, el('option', { value: '' }, 'Unassigned'),
      meta.roles.map((r) => el('option', { value: r, selected: r === q.assigned_to }, `${r} — ${meta.team[r]}`)));
    const supportBoxes = meta.roles.map((r) => el('label', { class: 'muted' },
      el('input', { type: 'checkbox', class: 'check', value: r, checked: q.supporting_roles.includes(r) }), r));
    const note = el('textarea', { rows: 3, maxLength: 2000, placeholder: 'Internal note (not visible to the client)…' });
    const failed = ['FAILED', 'BOUNCED'].includes(q.notification_status);

    $('detail').replaceChildren(
      el('span', { class: 'mono' }, q.id),
      el('h2', {}, q.customer_name),
      el('dl', {},
        el('dt', {}, 'Email'), el('dd', {}, el('a', { href: `mailto:${q.customer_email}` }, q.customer_email)),
        el('dt', {}, 'Submitted'), el('dd', {}, ist(q.created_at)),
        el('dt', {}, 'Status'), el('dd', {}, statusLabel(q.status)),
        el('dt', {}, 'Owner'), el('dd', {}, q.assigned_to ? `${q.assigned_to} (${meta.team[q.assigned_to]})` : 'Unassigned',
          q.supporting_roles.length ? ` · supporting: ${q.supporting_roles.join(', ')}` : ''),
        el('dt', {}, 'Notification'), el('dd', {}, notifPill(q.notification_status), q.notification_sent_at ? ` sent ${ist(q.notification_sent_at)}` : ''),
        el('dt', {}, 'Client replied'), el('dd', {}, q.customer_responded_at ? ist(q.customer_responded_at) : 'Not recorded'),
        el('dt', {}, 'Reminders'), el('dd', {}, q.reminders_paused ? 'Paused' : 'Active'),
      ),
      el('div', { class: 'section' }, el('p', { class: 'mono' }, 'Services'), el('div', { class: 'chips' }, q.selected_services.map((s) => el('span', {}, s)))),
      el('div', { class: 'section' }, el('p', { class: 'mono' }, 'Estimated budget (client estimate)'), el('p', {}, q.estimated_budget)),
      el('div', { class: 'section' }, el('p', { class: 'mono' }, 'Project brief'), q.project_brief ? el('p', { class: 'brief' }, q.project_brief) : el('p', { class: 'muted' }, 'Not provided')),
      el('div', { class: 'section actions' },
        el('div', {}, el('label', { class: 'mono', htmlFor: 'f-status' }, 'Status'), statusSel,
          el('button', { type: 'button', on: { click: (e) => update(q.id, { status: statusSel.value }, e.target) } }, 'UPDATE STATUS')),
        el('div', {}, el('label', { class: 'mono', htmlFor: 'f-owner' }, 'Primary owner'), ownerSel,
          el('button', { type: 'button', on: { click: (e) => update(q.id, { assignedTo: ownerSel.value || null }, e.target) } }, 'ASSIGN')),
        el('div', {}, el('p', { class: 'mono' }, 'Supporting team'), supportBoxes,
          el('button', { type: 'button', on: { click: (e) => update(q.id, { supportingRoles: supportBoxes.map((l) => l.firstChild).filter((c) => c.checked).map((c) => c.value) }, e.target) } }, 'SAVE TEAM')),
      ),
      el('div', { class: 'section' },
        el('button', { type: 'button', on: { click: (e) => update(q.id, { status: 'CONTACTED' }, e.target) }, disabled: q.status !== 'NEW' }, 'MARK CONTACTED'), ' ',
        el('button', { type: 'button', on: { click: (e) => update(q.id, { customerResponded: true }, e.target) } }, 'CLIENT RESPONDED'), ' ',
        el('button', { type: 'button', on: { click: (e) => update(q.id, { remindersPaused: !q.reminders_paused }, e.target) } }, q.reminders_paused ? 'RESUME REMINDERS' : 'PAUSE REMINDERS'), ' ',
        el('button', { type: 'button', on: { click: (e) => confirm('Close this inquiry?') && update(q.id, { status: 'CLOSED' }, e.target) } }, 'MARK CLOSED'), ' ',
        failed ? el('button', { type: 'button', on: { click: async (e) => {
          e.target.disabled = true;
          try { await api(`/api/admin/inquiries/${encodeURIComponent(q.id)}/retry-notification`, { method: 'POST' }); await select(q.id); } catch (err) { alert(err.message); e.target.disabled = false; }
        } } }, 'RETRY NOTIFICATION') : null,
      ),
      el('div', { class: 'section' }, el('label', { class: 'mono' }, 'Add internal note'), note,
        el('button', { type: 'button', on: { click: (e) => note.value.trim() && update(q.id, { note: note.value }, e.target) } }, 'ADD NOTE')),
      el('div', { class: 'section' }, el('p', { class: 'mono' }, 'Emails'),
        el('ul', { class: 'timeline' }, jobs.map((j) => el('li', {}, el('strong', {}, j.kind.replace(/_/g, ' ')), ` → ${j.recipient} · `, el('span', { class: 'pill' }, j.status),
          ` attempts ${j.attempts}/${j.max_attempts}`, j.sent_at ? ` · sent ${ist(j.sent_at)}` : '', j.last_error ? el('div', { class: 'error' }, j.last_error) : null)))),
      el('div', { class: 'section' }, el('p', { class: 'mono' }, 'Activity'),
        el('ul', { class: 'timeline' }, events.map((ev) => el('li', {}, el('span', { class: 'muted' }, `${ist(ev.created_at)} · ${ev.actor} · ${ev.type.replace(/_/g, ' ')}`), ev.detail ? el('div', { class: ev.type === 'NOTE' ? 'brief' : '' }, ev.detail) : null)))),
    );
  };

  const start = async () => {
    meta = await api('/api/admin/meta');
    $('filter').replaceChildren(el('option', { value: '' }, 'All'), meta.statuses.map((s) => el('option', { value: s.value }, s.label)));
    $('login').hidden = true;
    $('app').hidden = false;
    $('logout').hidden = false;
    await Promise.all([renderStats(), renderList()]);
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId) await select(hashId);
  };

  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    store.name = $('staff-name').value.trim();
    store.token = $('token').value.trim();
    $('token').value = '';
    try { await start(); } catch (err) { if (err.message !== 'unauthorized') lock(err.message); }
  });
  $('logout').addEventListener('click', () => lock());
  $('filter').addEventListener('change', () => renderList());
  $('refresh').addEventListener('click', () => Promise.all([renderStats(), renderList()]));
  $('staff-name').value = store.name;
  if (store.token) start().catch(() => {});
})();
