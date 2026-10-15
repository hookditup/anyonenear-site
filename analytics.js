/* Google Analytics 4 for every page of the AnyoneNear site.
   Set GA_ID to the site's measurement ID (G-XXXXXXXXXX) to turn it on; while
   it's empty nothing loads. Besides page views (and GA's own outbound-click
   and scroll tracking), clicks on the order, trial and add-on links are sent
   as events: order_click, trial_click, addon_click. */
(function () {
  var GA_ID = "";
  if (!GA_ID) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  var events = { "data-signup-link": "order_click", "data-trial-link": "trial_click", "data-upgrade-link": "addon_click" };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    for (var attr in events) {
      if (a.hasAttribute(attr)) {
        window.gtag("event", events[attr], { link_text: (a.textContent || "").trim().slice(0, 60), page_path: location.pathname });
        return;
      }
    }
  });
})();
