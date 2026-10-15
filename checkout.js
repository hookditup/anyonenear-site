/* AnyoneNear's own 2-step checkout (2026-10-15), used by the home page and
   /founding/. Step 1 here on the site (plan, name, email, business), step 2
   the card, on Stripe's secure form: embedded in the dialog when the backend
   hands back a client secret, else on Stripe's own checkout page.
   Any element with data-trial-link="starter|pro" opens it; the page sets
   window.AN_FOUNDING = true for founding member prices. */
(function () {
  var API = "https://citzcbytydvrrqxbzkli.supabase.co/functions/v1/start-trial";
  var FOUNDING = !!window.AN_FOUNDING;
  var PRICE = FOUNDING ? { starter: 99, pro: 199 } : { starter: 149, pro: 249 };
  var GROUPS = { starter: 3, pro: 5 };
  var DAYS = FOUNDING ? 30 : 14;   // the free trial: 14 days, 30 for founding members

  // Partner links: ?ref=<code> is remembered for 30 days and sent with the order.
  var ref = "";
  try {
    ref = (new URLSearchParams(location.search).get("ref") || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
    if (ref) localStorage.setItem("an_ref", JSON.stringify({ ref: ref, t: Date.now() }));
    else { var saved = JSON.parse(localStorage.getItem("an_ref") || "null"); if (saved && Date.now() - saved.t < 30 * 864e5) ref = saved.ref; }
  } catch (e) {}

  var css = document.createElement("style");
  css.textContent = [
    ".co{border:0;border-radius:18px;padding:0;max-width:480px;width:calc(100% - 32px);background:var(--surface,#fff);color:var(--text,inherit);box-shadow:0 24px 70px rgba(0,0,0,.35)}",
    ".co::backdrop{background:rgba(10,15,25,.6)}",
    ".co-in{padding:24px 22px 22px}",
    ".co-x{position:absolute;right:10px;top:10px;width:36px;height:36px;border:0;border-radius:10px;background:transparent;color:inherit;font-size:22px;cursor:pointer;opacity:.6}",
    ".co-x:hover{opacity:1}",
    ".co-steps{display:flex;gap:6px;margin:0 0 14px;font-size:.78rem;font-weight:700;color:var(--muted,#667)}",
    ".co-steps span{flex:1;padding-top:8px;border-top:3px solid var(--border,#dde)}",
    ".co-steps span.on{border-color:var(--accent,#2f6bff);color:var(--accent,#2f6bff)}",
    ".co h3{margin:0 0 4px;font-size:1.3rem}",
    ".co .co-sub{margin:0 0 16px;font-size:.92rem;color:var(--muted,#667)}",
    ".co-plans{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}",
    ".co-plans label{display:block;border:1.5px solid var(--border,#dde);border-radius:12px;padding:10px 12px;cursor:pointer}",
    ".co-plans input{position:absolute;opacity:0;pointer-events:none}",
    ".co-plans label:has(input:checked){border-color:var(--accent,#2f6bff);background:var(--accent-soft,rgba(47,107,255,.08))}",
    ".co-plans b{display:block;font-size:1rem}",
    ".co-plans small{display:block;color:var(--muted,#667);font-size:.8rem;line-height:1.35}",
    ".co-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".co label.f{display:block;font-weight:600;font-size:.88rem;margin:0 0 10px}",
    ".co label.f input{display:block;width:100%;margin-top:4px;padding:11px 12px;border-radius:10px;border:1px solid var(--border,rgba(127,127,127,.4));font:inherit;font-weight:400;background:transparent;color:inherit}",
    ".co-err{color:#c0392b;font-size:.9rem;margin:2px 0 10px;min-height:1px}",
    ".co .btn{width:100%;justify-content:center}",
    ".co-fine{font-size:.8rem;color:var(--muted,#667);margin:12px 0 0;text-align:center}",
    "#co-pay{min-height:420px}",
    "@media (max-width:420px){.co-row{grid-template-columns:1fr}}"
  ].join("");
  document.head.appendChild(css);

  var dlg = document.createElement("dialog");
  dlg.className = "co";
  dlg.setAttribute("aria-labelledby", "co-title");
  dlg.innerHTML =
    '<button type="button" class="co-x" aria-label="Close">&times;</button>' +
    '<div class="co-in">' +
      '<div class="co-steps"><span class="on">1. Your details</span><span id="co-s2">2. Card (free for ' + DAYS + ' days)</span></div>' +
      '<form id="co-form" novalidate>' +
        '<h3 id="co-title">' + (FOUNDING ? "Claim your founding member price" : "Start your free " + DAYS + "-day trial") + '</h3>' +
        '<p class="co-sub">' + (FOUNDING ? "$50 off every month, for life. 30 days free first; cancel anytime in the app." : DAYS + " days free, then your plan. Cancel anytime in the app.") + '</p>' +
        '<div class="co-plans" role="radiogroup" aria-label="Plan">' +
          ["starter", "pro"].map(function (p) {
            return '<label><input type="radio" name="plan" value="' + p + '"><b>' + (p === "pro" ? "Pro" : "Starter") + ' · $' + PRICE[p] + '/mo</b>' +
              '<small>' + GROUPS[p] + ' Facebook groups' + (FOUNDING ? ' · founding price' : '') + '</small></label>';
          }).join("") +
        '</div>' +
        '<div class="co-row"><label class="f">First name<input name="firstName" autocomplete="given-name" required maxlength="60"></label>' +
        '<label class="f">Last name<input name="lastName" autocomplete="family-name" maxlength="60"></label></div>' +
        '<label class="f">Email<input name="email" type="email" autocomplete="email" required maxlength="200"></label>' +
        '<label class="f">Business name<input name="business" autocomplete="organization" maxlength="100"></label>' +
        '<p class="co-err" id="co-err" role="alert"></p>' +
        '<button class="btn btn-primary btn-lg" type="submit" id="co-go">Continue to card</button>' +
        '<p class="co-fine">Card needed to start. Nothing is charged for ' + DAYS + ' days. Secure checkout by Stripe.</p>' +
      '</form>' +
      '<div id="co-pay" hidden></div>' +
    '</div>';
  document.body.appendChild(dlg);

  var form = dlg.querySelector("#co-form"), err = dlg.querySelector("#co-err"), go = dlg.querySelector("#co-go");
  var pay = dlg.querySelector("#co-pay"), embedded = null, started = "";
  dlg.querySelector(".co-x").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("close", function () {
    if (embedded) { try { embedded.destroy(); } catch (e) {} embedded = null; }
    pay.hidden = true; pay.innerHTML = ""; form.hidden = false;
    dlg.querySelector("#co-s2").className = ""; go.disabled = false; go.textContent = "Continue to card";
  });

  function details() {
    var d = { plan: (form.querySelector("input[name=plan]:checked") || {}).value || "starter", founding: FOUNDING, ref: ref };
    ["firstName", "lastName", "email", "business"].forEach(function (k) { d[k] = form.elements[k].value.trim(); });
    return d;
  }
  function post(body) {
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true })
      .then(function (r) { return r.json().then(function (j) { j.status = r.status; return j; }); });
  }
  // Step 1 is saved as soon as there's a name and an email, so a buyer who
  // stops at the card still gets the "finish signing up" emails.
  form.addEventListener("focusout", function () {
    var d = details();
    if (!d.firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) || started === d.email) return;
    started = d.email; d.step = "start"; post(d).catch(function () {});
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = details();
    err.textContent = "";
    if (!d.firstName) { err.textContent = "Enter your first name."; form.elements.firstName.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { err.textContent = "Enter a valid email."; form.elements.email.focus(); return; }
    go.disabled = true; go.textContent = "Opening secure checkout…";
    d.step = "pay";
    post(d).then(function (j) {
      if (j.url) { location.href = j.url; return; }
      if (j.clientSecret && j.publishableKey) return mount(j);
      throw new Error(j.error || "Checkout couldn't open. Please try again.");
    }).catch(function (x) {
      err.innerHTML = (x && x.message) || "Checkout couldn't open. Please try again.";
      go.disabled = false; go.textContent = "Continue to card";
    });
  });

  function mount(j) {
    var start = function () {
      return window.Stripe(j.publishableKey).initEmbeddedCheckout({ clientSecret: j.clientSecret }).then(function (c) {
        embedded = c; form.hidden = true; pay.hidden = false; dlg.querySelector("#co-s2").className = "on"; c.mount("#co-pay");
      });
    };
    if (window.Stripe) return start();
    return new Promise(function (ok, bad) {
      var s = document.createElement("script"); s.src = "https://js.stripe.com/v3/"; s.onload = ok; s.onerror = bad; document.head.appendChild(s);
    }).then(start);
  }

  function open(plan) {
    var r = form.querySelector("input[value=" + (plan === "pro" ? "pro" : "starter") + "]"); if (r) r.checked = true;
    err.textContent = "";
    dlg.showModal();
    setTimeout(function () { form.elements.firstName.focus(); }, 30);
  }
  document.querySelectorAll("[data-trial-link]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(a.getAttribute("data-trial-link")); });
  });
  document.querySelectorAll("[data-trial]").forEach(function (el) { el.hidden = false; });
  // A link straight to the form: /#join, /#join-pro, /founding/#join
  var h = location.hash;
  if (h === "#join" || h === "#join-pro" || h === "#join-starter") setTimeout(function () { open(h === "#join-pro" ? "pro" : "starter"); }, 200);
  window.anCheckout = open;
})();
