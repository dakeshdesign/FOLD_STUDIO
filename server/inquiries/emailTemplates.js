// Email content for the inquiry automation. Every user-supplied value is HTML-escaped,
// layouts are table-based with inline styles, and each email has a plain-text part.

import { STATUS_LABELS } from './schema.js';

const C = {
  ink: '#202020',
  paper: '#F5F3EE',
  white: '#FFFFFF',
  line: '#E5E2DA',
  muted: '#6B6860', // 5.4:1 on #F5F3EE
  orange: '#D9561E',
};
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,monospace";

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeMultiline = (value) => escapeHtml(value).replace(/\n/g, '<br>');

// Subjects are single-line: strip anything that could break the header.
const oneLine = (value) => String(value ?? '').replace(/[\r\n\u2028\u2029\t]+/g, ' ').trim();

export const formatIST = (iso) =>
  `${new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))} IST`;

const label = (text) =>
  `<p style="margin:0 0 8px;font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${escapeHtml(text)}</p>`;

const section = (title, inner) => `
<tr><td style="padding:24px 32px;border-top:1px solid ${C.line};">
  ${label(title)}
  ${inner}
</td></tr>`;

const value = (html) =>
  `<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">${html}</p>`;

const layout = ({ preheader, eyebrow, title, rows, footer }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
<style>
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:20px !important;padding-right:20px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${C.white};border:1px solid ${C.line};">
    <tr><td class="px" style="background:${C.ink};padding:28px 32px;">
      <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:3px;color:${C.paper};">FOLD CREATIVE STUDIO</p>
      <p style="margin:14px 0 0;font-family:${MONO};font-size:11px;letter-spacing:2px;color:${C.orange};">${escapeHtml(eyebrow)}</p>
      <h1 style="margin:6px 0 0;font-family:${SERIF};font-size:28px;font-weight:normal;line-height:1.2;color:${C.white};">${escapeHtml(title)}</h1>
    </td></tr>
    ${rows}
    <tr><td class="px" style="background:${C.paper};padding:20px 32px;border-top:1px solid ${C.line};">
      <p style="margin:0;font-family:${MONO};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${footer}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

const subjectServices = (services) =>
  services.length <= 2 ? services.join(' + ') : `${services[0]} +${services.length - 1} more`;

/** Internal notification to the FOLD inbox. */
export const renderInternalNotification = (inq, { adminUrl } = {}) => {
  const services = inq.selected_services;
  const brief = inq.project_brief || '';
  const submitted = formatIST(inq.created_at);
  const status = STATUS_LABELS[inq.status] || inq.status;
  const owner = inq.assigned_to ? `${inq.assigned_to}${inq.supporting_roles?.length ? ` (with ${inq.supporting_roles.join(', ')})` : ''}` : 'Unassigned';

  const subject = oneLine(`FOLD | NEW PROJECT INQUIRY | ${inq.customer_name} | ${subjectServices(services)}`);

  const chips = services
    .map(
      (s) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;background:${C.ink};color:${C.paper};font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(s)}</span>`
    )
    .join('');

  const rows = [
    `<tr><td class="px" style="padding:24px 32px 8px;">${value(
      'A new potential client has submitted a project request through the FOLD Studio website.'
    )}</td></tr>`,
    section(
      'Client Information',
      value(
        `<strong>Name:</strong> ${escapeHtml(inq.customer_name)}<br><strong>Email:</strong> <a href="mailto:${escapeHtml(
          inq.customer_email
        )}" style="color:${C.ink};">${escapeHtml(inq.customer_email)}</a>`
      )
    ),
    section('Selected Services', `<div>${chips}</div>`),
    section(
      'Estimated Budget',
      `<p style="margin:0;font-family:${SERIF};font-size:22px;color:${C.ink};">${escapeHtml(inq.estimated_budget)}</p>
       <p style="margin:6px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">Client estimate — not a quotation.</p>`
    ),
    section(
      'Project Brief',
      brief
        ? `<div style="border-left:2px solid ${C.orange};padding:4px 0 4px 16px;font-family:${SANS};font-size:14px;line-height:1.7;color:${C.ink};">${escapeMultiline(brief)}</div>`
        : value(`<em style="color:${C.muted};">Not provided</em>`)
    ),
    section(
      'Inquiry Details',
      value(
        `<strong>Inquiry ID:</strong> <span style="font-family:${MONO};">${escapeHtml(inq.id)}</span><br>
         <strong>Submitted:</strong> ${escapeHtml(submitted)}<br>
         <strong>Current Status:</strong> ${escapeHtml(status)}<br>
         <strong>Suggested Owner:</strong> ${escapeHtml(owner)}`
      )
    ),
    section(
      'Next Action',
      value('Review requirements, contact the client, and assign work to the appropriate FOLD team member.') +
        `<p style="margin:16px 0 0;font-family:${SANS};font-size:13px;color:${C.muted};">Reply to this email to respond directly to ${escapeHtml(
          inq.customer_name
        )}.${adminUrl ? ` Track it in the <a href="${escapeHtml(adminUrl)}" style="color:${C.orange};">inquiry dashboard</a>.` : ''}</p>`
    ),
  ].join('');

  const html = layout({
    preheader: `${inq.customer_name} — ${services.join(', ')} — ${inq.estimated_budget}`,
    eyebrow: 'NEW PROJECT INQUIRY',
    title: 'New Project Inquiry',
    rows,
    footer: 'FOLD Creative Studio · Website Project Inquiry Notification',
  });

  const text = [
    'FOLD CREATIVE STUDIO',
    'NEW PROJECT INQUIRY',
    '',
    'A new potential client has submitted a project request through the FOLD Studio website.',
    '',
    'CLIENT INFORMATION',
    `Name: ${inq.customer_name}`,
    `Email: ${inq.customer_email}`,
    '',
    'PROJECT REQUIREMENTS',
    'Selected Services:',
    ...services.map((s) => `- ${s}`),
    '',
    'ESTIMATED BUDGET',
    `${inq.estimated_budget} (client estimate, not a quotation)`,
    '',
    'PROJECT BRIEF',
    brief ? `"${brief}"` : 'Not provided',
    '',
    'INQUIRY DETAILS',
    `Inquiry ID: ${inq.id}`,
    `Submitted: ${submitted}`,
    `Current Status: ${status}`,
    `Suggested Owner: ${owner}`,
    '',
    'NEXT ACTION',
    'Review requirements, contact the client, and assign work to the appropriate FOLD team member.',
    `Reply to this email to respond directly to ${inq.customer_name}.`,
    ...(adminUrl ? [`Dashboard: ${adminUrl}`] : []),
    '',
    'FOLD CREATIVE STUDIO',
    'Website Project Inquiry Notification',
  ].join('\n');

  return { subject, html, text };
};

/** Optional acknowledgement to the customer. Makes no promises on price or timing. */
export const renderClientConfirmation = (inq) => {
  const services = inq.selected_services;
  const subject = "FOLD Studio | We've Received Your Project Inquiry";
  const rows = [
    `<tr><td class="px" style="padding:28px 32px 8px;">${value(`Hi ${escapeHtml(inq.customer_name)},`)}
      <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">Thank you for reaching out to FOLD Creative Studio. We've received your project inquiry.</p>
    </td></tr>`,
    section('Your Selected Services', value(services.map(escapeHtml).join('<br>'))),
    section('Estimated Budget', value(escapeHtml(inq.estimated_budget))),
    `<tr><td class="px" style="padding:24px 32px;border-top:1px solid ${C.line};">
      ${value('Our team will review your requirements and contact you regarding the next steps.')}
      <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">We appreciate your interest in working with us.</p>
      <p style="margin:16px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">Best regards,<br>FOLD Creative Studio</p>
    </td></tr>`,
  ].join('');

  const html = layout({
    preheader: "We've received your project inquiry.",
    eyebrow: 'INQUIRY RECEIVED',
    title: 'Thank you for reaching out',
    rows,
    footer: `FOLD Creative Studio · Reference ${escapeHtml(inq.id)}`,
  });

  const text = [
    `Hi ${inq.customer_name},`,
    '',
    'Thank you for reaching out to FOLD Creative Studio.',
    "We've received your project inquiry.",
    '',
    'Your selected services:',
    ...services.map((s) => `- ${s}`),
    '',
    'Estimated budget:',
    inq.estimated_budget,
    '',
    'Our team will review your requirements and contact you regarding the next steps.',
    '',
    'We appreciate your interest in working with us.',
    '',
    'Best regards,',
    'FOLD Creative Studio',
    '',
    `Reference: ${inq.id}`,
  ].join('\n');

  return { subject, html, text };
};

/** Internal reminder to a team member (never sent to the customer). */
export const renderInternalReminder = (inq, { kind, ownerName, adminUrl }) => {
  const headline =
    kind === 'quotation_followup'
      ? 'Quotation follow-up due'
      : 'Inquiry still awaiting review';
  const advice =
    kind === 'quotation_followup'
      ? 'The client has not been recorded as responding since the quotation was sent. Consider an approved follow-up, or record their reply / close the inquiry in the dashboard.'
      : 'This inquiry is still marked NEW. Please review it and contact the client, then update its status so this reminder is not repeated.';
  const subject = oneLine(`FOLD | REMINDER | ${headline} | ${inq.customer_name}`);

  const rows = [
    `<tr><td class="px" style="padding:24px 32px 8px;">${value(`Hi ${escapeHtml(ownerName || 'team')},`)}
      <p style="margin:12px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};">${escapeHtml(advice)}</p></td></tr>`,
    section(
      'Inquiry',
      value(
        `<strong>Client:</strong> ${escapeHtml(inq.customer_name)} (${escapeHtml(inq.customer_email)})<br>
         <strong>Services:</strong> ${inq.selected_services.map(escapeHtml).join(', ')}<br>
         <strong>Budget:</strong> ${escapeHtml(inq.estimated_budget)}<br>
         <strong>Submitted:</strong> ${escapeHtml(formatIST(inq.created_at))}<br>
         <strong>Status:</strong> ${escapeHtml(STATUS_LABELS[inq.status] || inq.status)}<br>
         <strong>Inquiry ID:</strong> <span style="font-family:${MONO};">${escapeHtml(inq.id)}</span>`
      ) +
        (adminUrl
          ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(adminUrl)}" style="font-family:${MONO};font-size:12px;letter-spacing:1px;color:${C.orange};">OPEN DASHBOARD →</a></p>`
          : '')
    ),
  ].join('');

  const html = layout({ preheader: headline, eyebrow: 'INTERNAL REMINDER', title: headline, rows, footer: 'FOLD Creative Studio · Internal follow-up' });
  const text = [
    `Hi ${ownerName || 'team'},`,
    '',
    advice,
    '',
    `Client: ${inq.customer_name} (${inq.customer_email})`,
    `Services: ${inq.selected_services.join(', ')}`,
    `Budget: ${inq.estimated_budget}`,
    `Submitted: ${formatIST(inq.created_at)}`,
    `Status: ${STATUS_LABELS[inq.status] || inq.status}`,
    `Inquiry ID: ${inq.id}`,
    ...(adminUrl ? ['', `Dashboard: ${adminUrl}`] : []),
  ].join('\n');

  return { subject, html, text };
};
