// Triumph Arc — site scripts
(function () {
  "use strict";

  /* ---- Sticky header ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Scroll reveal ----
     Uses IntersectionObserver as the primary trigger, plus a lightweight
     scroll/resize fallback that catches any element the observer missed
     (e.g. instant anchor-jump scrolls that skip the intersecting frame). */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    var revealNow = function (el) { el.classList.add("is-visible"); };

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealNow(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "400px 0px 400px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(revealNow);
    }

    var sweepFallback = function () {
      var vh = window.innerHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh + 200 && r.bottom > -200) revealNow(el);
      });
    };
    var sweepScheduled = false;
    var scheduleSweep = function () {
      if (sweepScheduled) return;
      sweepScheduled = true;
      requestAnimationFrame(function () { sweepScheduled = false; sweepFallback(); });
    };
    document.addEventListener("scroll", scheduleSweep, { passive: true });
    window.addEventListener("resize", scheduleSweep);
    sweepFallback();
  }

  /* ---- Hero arc draw-in ---- */
  document.querySelectorAll(".arc-graphic").forEach(function (el) {
    requestAnimationFrame(function () {
      setTimeout(function () { el.classList.add("is-drawn"); }, 200);
    });
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("is-open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
  // Open the first FAQ item by default
  var firstFaq = document.querySelector(".faq-item");
  if (firstFaq) {
    firstFaq.classList.add("is-open");
    var p = firstFaq.querySelector(".faq-a");
    if (p) p.style.maxHeight = p.scrollHeight + "px";
  }

  /* ---- Testimonial slider ---- */
  document.querySelectorAll(".testi-wrap").forEach(function (wrap) {
    var slides = wrap.querySelectorAll(".testi-slide");
    var images = wrap.querySelectorAll(".testi-visual img");
    var dotsWrap = wrap.querySelector(".testi-dots");
    if (!slides.length) return;
    var idx = 0;
    var dots = [];

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Show testimonial " + (i + 1));
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", function () { show(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    function show(i) {
      idx = i;
      slides.forEach(function (s, si) { s.classList.toggle("is-active", si === i); });
      images.forEach(function (im, ii) { im.classList.toggle("is-active", ii === i); });
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
    }
    show(0);

    var timer = setInterval(function () { show((idx + 1) % slides.length); }, 6000);
    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
  });

  /* ---- Contact form submission (Web3Forms) ----
     Logic ported as-is from the original template's main.js: same field
     names, same endpoint, same success/error handling. Do not change. */
  var handleContactForms = function () {
    var forms = document.querySelectorAll(".tac-contact-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msgBox = form.querySelector(".tac-form-msg");
        var submitBtn = form.querySelector('button[type="submit"]');
        var accessKeyInput = form.querySelector('input[name="access_key"]');

        if (!accessKeyInput || accessKeyInput.value === "YOUR_WEB3FORMS_ACCESS_KEY") {
          if (msgBox) {
            msgBox.style.display = "block";
            msgBox.style.color = "#e7382f";
            msgBox.textContent = "Form isn't connected yet — add your Web3Forms access key in the HTML.";
          }
          return;
        }

        var formData = new FormData(form);
        var originalBtnText = submitBtn ? submitBtn.textContent : "";
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
        }
        if (msgBox) {
          msgBox.style.display = "block";
          msgBox.style.color = "";
          msgBox.textContent = "";
        }

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success) {
              if (msgBox) {
                msgBox.style.color = "#1aad54";
                msgBox.textContent = "Thanks! Your message has been sent — we'll get back to you soon.";
              }
              form.reset();
            } else {
              if (msgBox) {
                msgBox.style.color = "#e7382f";
                msgBox.textContent = "Something went wrong. Please try again or email us directly.";
              }
            }
          })
          .catch(function () {
            if (msgBox) {
              msgBox.style.color = "#e7382f";
              msgBox.textContent = "Something went wrong. Please try again or email us directly.";
            }
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      });
    });
  };

  document.addEventListener("DOMContentLoaded", handleContactForms);
})();
