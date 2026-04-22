import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

const DESIGN_SYSTEM = `
You MUST output a complete, self-contained HTML document. Do not output markdown. Do not output plain text. Do not wrap your response in code fences. Do not start with three backticks. Do not end with three backticks. Do not add ```html before the DOCTYPE. Your response must start with the literal characters: < ! D O C T Y P E (in that order, no spaces, no preamble). Start with <!DOCTYPE html> and end with </html>. Nothing before, nothing after.

Use this exact design system. Copy the entire CSS block verbatim into the <style> tag. Do not modify the colors, fonts, or class names.

REQUIRED STRUCTURE:
1. <!DOCTYPE html>, <html>, <head> with meta tags, Google Fonts link for DM Mono and Fraunces, <title>, <style> (paste full CSS below).
2. <body> with <nav> containing 7 tab buttons: Overview, Profile, Credit Report, Schedule, Banker Forms, Introductions, Tracker.
3. 7 <div class="section"> blocks, each with id s0 through s6. Only s0 has class="section active" initially. Others just class="section".
4. <script> at bottom with show(idx, btn) function that toggles active classes.

REQUIRED CSS BLOCK (paste exactly, do not edit):
<style>
  :root{
    --navy:#0a1628;--navy-mid:#132040;--navy-light:#1c2f55;
    --gold:#c9a84c;--gold-light:#e8c97a;--cream:#f5f0e8;
    --green:#2d6a4f;--green-light:#52b788;--red:#9b2226;
    --orange:#ff8c42;--white:#ffffff;--text-dim:#8899bb;
    --mid-blue:#2E75B6;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--navy);color:var(--cream);font-family:'DM Mono',monospace;min-height:100vh;overflow-x:hidden;}
  body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 70% 50% at 10% 5%,rgba(201,168,76,.06) 0%,transparent 50%),radial-gradient(ellipse 60% 70% at 90% 90%,rgba(28,47,85,.9) 0%,transparent 60%);pointer-events:none;z-index:0;}
  nav{position:sticky;top:0;z-index:100;background:rgba(10,22,40,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(201,168,76,.15);padding:0 24px;}
  .nav-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:0;overflow-x:auto;scrollbar-width:none;}
  .nav-inner::-webkit-scrollbar{display:none;}
  .nav-btn{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim);padding:14px 16px;cursor:pointer;border:none;background:transparent;border-bottom:2px solid transparent;white-space:nowrap;transition:all .2s;}
  .nav-btn:hover{color:var(--cream);}
  .nav-btn.active{color:var(--gold);border-bottom-color:var(--gold);}
  .wrap{max-width:900px;margin:0 auto;padding:0 24px 80px;position:relative;z-index:1;}
  .section{display:none;padding-top:48px;}
  .section.active{display:block;}
  .eyebrow{font-size:10px;letter-spacing:.25em;color:var(--gold);text-transform:uppercase;margin-bottom:12px;}
  h1{font-family:'Fraunces',serif;font-size:clamp(32px,5vw,56px);font-weight:900;color:var(--white);line-height:1.0;margin-bottom:8px;}
  h1 em{color:var(--gold);font-style:italic;font-weight:300;}
  h2{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:var(--white);margin-bottom:6px;}
  h3{font-family:'Fraunces',serif;font-size:16px;font-weight:600;color:var(--cream);margin-bottom:4px;}
  .sub-head{font-size:12px;color:var(--text-dim);letter-spacing:.1em;margin-bottom:32px;}
  p{font-size:12px;color:var(--cream);line-height:1.7;margin-bottom:12px;}
  .divider{height:1px;background:linear-gradient(90deg,rgba(201,168,76,.4),transparent);margin:28px 0;}
  .card{background:var(--navy-mid);border:1px solid rgba(201,168,76,.15);border-radius:12px;padding:24px;margin-bottom:16px;}
  .card.red-card{border-color:rgba(155,34,38,.3);background:rgba(155,34,38,.08);}
  .card.green-card{border-color:rgba(82,183,136,.2);background:rgba(45,106,79,.08);}
  .card.gold-card{border-color:rgba(201,168,76,.3);background:rgba(201,168,76,.06);}
  .score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;}
  .score-card{background:var(--navy-mid);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:20px;text-align:center;}
  .score-bureau{font-size:9px;letter-spacing:.2em;color:var(--text-dim);text-transform:uppercase;margin-bottom:8px;}
  .score-num{font-family:'Fraunces',serif;font-size:48px;font-weight:900;color:var(--gold);line-height:1;}
  .score-label{font-size:10px;color:var(--green-light);letter-spacing:.1em;margin-top:4px;}
  .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin:12px 0;}
  .field-row{padding:9px 12px;border-radius:6px;display:flex;gap:8px;align-items:baseline;}
  .field-row:nth-child(odd){background:rgba(255,255,255,.03);}
  .fkey{font-size:10px;letter-spacing:.08em;color:var(--text-dim);flex-shrink:0;min-width:140px;}
  .fval{font-size:11px;color:var(--cream);font-weight:500;}
  .fval.warn{color:var(--orange);}
  .fval.good{color:var(--green-light);}
  .fval.flag{color:#ff6b6b;}
  .form-table{width:100%;border-collapse:collapse;margin:12px 0;}
  .form-table tr:nth-child(odd) td{background:rgba(255,255,255,.025);}
  .form-table td{padding:10px 14px;font-size:11px;border:1px solid rgba(255,255,255,.06);}
  .form-table .fk{color:var(--text-dim);font-weight:500;width:38%;letter-spacing:.05em;}
  .form-table .fv{color:var(--cream);}
  .form-table .fv.warn{color:var(--orange);font-weight:500;}
  .step-list{display:flex;flex-direction:column;gap:2px;margin:12px 0;}
  .step-item{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:8px;background:rgba(19,32,64,.4);border:1px solid transparent;position:relative;overflow:hidden;}
  .step-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gold);}
  .step-num{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:var(--gold);flex-shrink:0;min-width:28px;line-height:1.2;}
  .step-body{flex:1;}
  .step-title{font-size:12px;font-weight:500;color:var(--cream);margin-bottom:4px;}
  .step-note{font-size:10px;color:var(--text-dim);line-height:1.5;}
  .step-val{font-size:11px;color:var(--gold);margin-top:3px;}
  .time-block{display:flex;gap:16px;margin-bottom:12px;align-items:stretch;}
  .time-col{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:0;}
  .time-stamp{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--gold);white-space:nowrap;}
  .time-line{flex:1;width:1px;background:rgba(201,168,76,.2);margin:8px 0;}
  .time-content{flex:1;background:var(--navy-mid);border:1px solid rgba(201,168,76,.15);border-radius:10px;padding:16px;margin-bottom:0;}
  .time-lender{font-size:13px;font-weight:500;color:var(--white);margin-bottom:4px;}
  .time-meta{font-size:10px;color:var(--text-dim);line-height:1.5;margin-bottom:6px;}
  .bureau-tag{display:inline-block;font-size:9px;letter-spacing:.12em;padding:2px 8px;border-radius:10px;margin-right:6px;}
  .exp{background:rgba(46,117,182,.2);color:#90c8f0;border:1px solid rgba(46,117,182,.3);}
  .tru{background:rgba(45,106,79,.2);color:var(--green-light);border:1px solid rgba(45,106,79,.3);}
  .amt-tag{display:inline-block;font-size:10px;color:var(--gold);font-weight:500;}
  .lender-table{width:100%;border-collapse:collapse;margin:12px 0;}
  .lender-table th{background:var(--navy-light);color:var(--gold);font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:10px 12px;text-align:left;border:1px solid rgba(255,255,255,.06);}
  .lender-table td{padding:10px 12px;font-size:11px;border:1px solid rgba(255,255,255,.04);}
  .lender-table tr:nth-child(odd) td{background:rgba(255,255,255,.02);}
  .lender-table tr:nth-child(even) td{background:rgba(19,32,64,.3);}
  .lender-name-cell{color:var(--cream);font-weight:500;}
  .limit-cell{color:var(--gold);font-family:'Fraunces',serif;font-size:14px;font-weight:700;}
  .period-cell{color:var(--green-light);}
  .order-cell{color:var(--text-dim);}
  .recon-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0;}
  .ri{background:rgba(19,32,64,.6);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:14px;}
  .rbank{font-size:10px;font-weight:500;color:var(--cream);margin-bottom:4px;letter-spacing:.06em;}
  .rnum{font-size:13px;color:var(--gold);font-weight:500;margin-bottom:3px;}
  .rtip{font-size:9px;color:var(--text-dim);}
  .letter{background:var(--navy-mid);border:1px solid rgba(201,168,76,.15);border-radius:12px;padding:28px;margin-bottom:24px;}
  .letter-bank{font-size:10px;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(201,168,76,.2);}
  .letter p{font-size:12px;color:var(--cream);line-height:1.8;margin-bottom:14px;}
  .letter-section{margin:20px 0;padding:16px;background:rgba(10,22,40,.4);border-radius:8px;border-left:3px solid var(--gold);}
  .ls-title{font-size:9px;letter-spacing:.2em;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
  .note{border-radius:8px;padding:14px 16px;margin:12px 0;font-size:11px;line-height:1.6;}
  .note.warn{background:rgba(155,34,38,.1);border:1px solid rgba(155,34,38,.3);color:#ffb3b3;border-left:4px solid var(--red);}
  .note.info{background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.2);color:var(--cream);border-left:4px solid var(--gold);}
  .note.success{background:rgba(45,106,79,.1);border:1px solid rgba(82,183,136,.2);color:var(--cream);border-left:4px solid var(--green-light);}
  .tracker{width:100%;border-collapse:collapse;margin:16px 0;}
  .tracker th{background:var(--navy-light);color:var(--gold);font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:12px 14px;text-align:left;border:1px solid rgba(255,255,255,.06);}
  .tracker td{padding:14px;font-size:11px;border:1px solid rgba(255,255,255,.04);color:var(--text-dim);}
  .tracker tr:nth-child(odd) td{background:rgba(255,255,255,.02);}
  .tracker .lname{color:var(--cream);font-weight:500;}
  .tracker tfoot td{background:var(--navy-light);color:var(--gold);font-weight:500;letter-spacing:.08em;}
  @media(max-width:600px){
    .score-grid{grid-template-columns:1fr 1fr;}
    .field-grid{grid-template-columns:1fr;}
    .recon-grid{grid-template-columns:1fr;}
    .time-block{flex-direction:column;}
    .time-col{flex-direction:row;align-items:center;}
    .time-line{display:none;}
    nav{padding:0 12px;}
    .wrap{padding:0 16px 80px;}
  }
</style>

REQUIRED SECTIONS (each is a <div class="section" id="sN">):

SECTION s0 - OVERVIEW:
- Eyebrow: "0% Business Credit · [Current Date]"
- h1: "Funding Plan<br><em>& Application SOP</em>"
- sub-head: "[CLIENT NAME] · [BUSINESS NAME] · TARGET $XXK–$XXXK"
- Prominent warn note at top ONLY IF business is under 1 year old OR other critical issue exists
- score-grid with 3 score-card elements (Equifax, Experian, TransUnion)
- card with Key Stats using field-grid (utilization, late pays, collections, etc.)
- red-card with Red Flags using step-list (only if there are real flags)
- green-card with Same-Day Strategy using step-list of the 4 card applications with bureau-tags

SECTION s1 - PROFILE:
- Eyebrow: "Section 2"
- h1: "Client<br><em>Profile</em>"
- card with h2 "Personal Information" and form-table with all personal data (Name, DOB, SSN masked, address, etc.)
- card with h2 "Business Information" and form-table with business data

SECTION s2 - CREDIT REPORT:
- Eyebrow: "Section 1"
- h1: "Credit<br><em>Profile</em>"
- score-grid again (3 score cards)
- card with h2 "Account Summary" and form-table
- green-card with h2 "Revolving Accounts" and lender-table IF data provided
- card with h2 "Installment Loans" and lender-table IF data provided

SECTION s3 - SCHEDULE:
- Eyebrow: "Section 5"
- h1: "Same-Day<br><em>Schedule</em>"
- info note explaining same-day strategy
- 4 time-block elements for 9:00 AM / 10:00 AM / 11:30 AM / 1:00 PM with Chase/Wells/Amex/BofA
- green-card with h2 "When Approved — Do Immediately" and step-list
- red-card with h2 "If Pending — Call Recon Same Day" and recon-grid with 4 recon numbers

SECTION s4 - BANKER FORMS:
- Eyebrow: "Section 7"
- h1: "Completed<br><em>Banker Forms</em>"
- card with h2 "Chase Ink Business Card" and complete form-table pre-filled with client data
- card with h2 "Truist Business Card" and complete form-table pre-filled with client data

SECTION s5 - INTRODUCTIONS:
- Eyebrow: "Section 8"
- h1: "Bank Rep<br><em>Introductions</em>"
- info note
- letter block for Chase with letter-bank, intro paragraph, letter-section for Business Info (form-table), letter-section for Personal Info (form-table), letter-section for Request Summary (form-table), closing paragraph
- letter block for Truist (same structure)

SECTION s6 - TRACKER:
- Eyebrow: "Section 9"
- h1: "Approval<br><em>Tracker</em>"
- info note
- tracker table with thead (Lender, Applied, Decision, Approved Limit, 0% Expires, Notes) and tbody with empty rows for each card (Chase, Wells Fargo, Amex, BofA)
- card with h2 "Capital Management Rules" and step-list

NAV SCRIPT (paste exactly):
<script>
function show(idx, btn) {
  document.querySelectorAll('.section').forEach((s,i) => s.classList.toggle('active', i===idx));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
</script>

CONTENT RULES:
- Use the client's actual data throughout. Never use placeholders if data was provided.
- For Chase form: request $50,000 limit.
- For Truist form: figures may intentionally differ from Chase. Flag any intentional differences with class="fval warn".
- Standard same-day schedule: 9AM Chase (Experian), 10AM Wells Fargo (TransUnion), 11:30AM Amex (Experian), 1PM BofA (TransUnion).
- Recon numbers: Chase 1-800-453-9719, Amex 1-800-567-1083, Wells 1-800-642-4720, BofA 1-888-500-6270.
- If business is under 1 year old, prominently flag in Overview and in every banker form section.
- If fraud alert active, flag as hard stop.
- If single bureau score provided, flag missing bureaus.

AFFILIATE LINKS TO INCLUDE in the Tracker section, after the main tracker table, as a card with h2 "Affiliate Links & Commission Tracking":
- Chase Ink Business: https://www.cardratings.com/bestcards/featured-credit-cards?src=692459
- Other Business Cards (Amex, BofA, Wells, US Bank, Citi): https://www.cardratings.com/bestcards/business-credit-cards.php?src=696533
- Nav.com Business Credit Monitoring: https://www.nav.com/a/affiliates/jc/
- Personal 0% APR: https://www.cardratings.com/bestcards/0-apr-credit-cards.php?src=696533

Format as a form-table with columns Card | Link | Est Commission.

FINAL REQUIREMENTS:
- Output ONLY the HTML document. No explanation before or after.
- Must start with <!DOCTYPE html> and end with </html>.
- Must include the compliance disclaimer at the top of Overview in a "note info" block.
- Compliance disclaimer text: "IMPORTANT NOTICE: This funding plan is an educational analysis based on publicly available lending criteria and the credit profile provided. It does not constitute a guarantee of approval, a promise of funding, or financial advice. All lending decisions are made solely by the issuing financial institution. Actual approved amounts, terms, and eligibility may vary. Consult a licensed financial advisor before making any financial decisions."
`;

const CHAT_PROMPT = `You are helping refine a funding package that was previously generated as a complete HTML document. The user is asking you to make a specific adjustment.

For follow-up questions, respond in clean markdown (not HTML). Be concise. If they ask you to rewrite a specific section like a letter or form, provide just the updated text for that section — do not regenerate the entire HTML document.

If the user asks for a fundamentally different version of the whole package, tell them to click "Start New Client" and regenerate with updated inputs.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, pdfBase64, isFollowUp } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const todayISO = today.toISOString().split('T')[0];

    const DATE_CONTEXT = '\n\nCURRENT DATE CONTEXT:\nToday is ' + todayFormatted + ' (' + todayISO + ').\nA date is "in the future" ONLY if it is AFTER ' + todayISO + '.\nA date is "in the past" if it is BEFORE ' + todayISO + '.\nUse this as the single source of truth for all date calculations including business age.';

    const systemPrompt = (isFollowUp ? CHAT_PROMPT : DESIGN_SYSTEM) + DATE_CONTEXT;

    const apiMessages = messages.map((m, i) => {
      if (i === 0 && pdfBase64) {
        return {
          role: m.role,
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            { type: 'text', text: m.content },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      system: systemPrompt,
      messages: apiMessages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write('data: ' + JSON.stringify({ text: chunk.delta.text }) + '\n\n');
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write('data: ' + JSON.stringify({ error: err.message }) + '\n\n');
      res.end();
    }
  }
}
// END OF FILE - DO NOT REMOVE THIS LINE
