/**
 * FEAR OF SATAN - GLASS SATAN HERO SCRUB
 * Scroll-drives a vertical transparent video inside the hero glass frame.
 */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function hasConstrainedNetwork() {
    const connection = navigator.connection;
    if (!connection) return false;

    return Boolean(
      connection.saveData ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
    );
  }

  function initGlassSatan() {
    const video = document.getElementById("glassSatanVideo");
    const hero = document.querySelector(".hero");
    if (!video || !hero) return;

    const removeListeners = [];
    const passiveOpts = { passive: true };
    const constrainedNetwork = hasConstrainedNetwork();
    const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
    const loopMultiplier = Math.max(parseFloat(video.dataset.loopMultiplier || "1"), 0.01);
    const damping = isCoarsePointer ? 0.36 : 0.24;
    const writeThreshold = isCoarsePointer ? 1 / 36 : 1 / 120;
    const fastSeekThreshold = isCoarsePointer ? 0.22 : 0.14;
    const webmSource = video.dataset.videoWebm || "";
    const mp4Source = video.dataset.videoMp4 || "";

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "metadata";

    let duration = 0;
    let trigger = null;
    let rafId = 0;
    let targetTime = 0;
    let renderedTime = 0;
    let preloadObserver = null;
    let nativeTicking = false;
    let metadataReady = false;

    function addListener(target, eventName, handler, options) {
      target.addEventListener(eventName, handler, options);
      removeListeners.push(() => target.removeEventListener(eventName, handler, options));
    }

    function supportsWebmAlpha() {
      if (typeof video.canPlayType !== "function") return false;
      return Boolean(
        video.canPlayType('video/webm; codecs="vp9,opus"') ||
          video.canPlayType('video/webm; codecs="vp9"') ||
          video.canPlayType("video/webm")
      );
    }

    function pickVideoSource() {
      if (!webmSource && !mp4Source) return;

      const shouldUseWebm = Boolean(webmSource && supportsWebmAlpha());
      const chosenSource = shouldUseWebm ? webmSource : mp4Source;
      if (chosenSource && video.getAttribute("src") !== chosenSource) {
        video.src = chosenSource;
      }

      if (shouldUseWebm && mp4Source) {
        const fallbackToMp4 = () => {
          const current = video.currentSrc || video.src || "";
          if (!/\.webm(?:$|\?)/i.test(current)) return;
          video.src = mp4Source;
          video.load();
        };
        addListener(video, "error", fallbackToMp4);
      }
    }

    function getMaxSeekTime() {
      return duration > 0.016 ? duration - 0.016 : duration;
    }

    function timeFromProgress(progress) {
      if (!duration) return 0;
      const loopedProgress = (progress * loopMultiplier) % 1;
      const next = loopedProgress * duration;
      return Math.max(0, Math.min(next, getMaxSeekTime()));
    }

    function writeTime(nextTime, force) {
      if (!Number.isFinite(nextTime)) return;

      const safeTime = Math.max(0, Math.min(nextTime, getMaxSeekTime()));
      if (!force && Math.abs(video.currentTime - safeTime) < writeThreshold) {
        return;
      }

      if (typeof video.fastSeek === "function" && Math.abs(video.currentTime - safeTime) > fastSeekThreshold) {
        try {
          video.fastSeek(safeTime);
          return;
        } catch (_) {
          // Fall through to direct currentTime assignment.
        }
      }

      try {
        video.currentTime = safeTime;
      } catch (_) {
        // Ignore transient seek errors during decode warmup.
      }
    }

    function renderFrame() {
      rafId = 0;
      renderedTime += (targetTime - renderedTime) * damping;
      if (Math.abs(targetTime - renderedTime) < writeThreshold) {
        renderedTime = targetTime;
      }

      writeTime(renderedTime, false);

      if (Math.abs(targetTime - renderedTime) >= writeThreshold && !document.hidden) {
        rafId = requestAnimationFrame(renderFrame);
      }
    }

    function queueRender(nextTime, immediate) {
      targetTime = nextTime;
      if (immediate) {
        renderedTime = targetTime;
        writeTime(targetTime, true);
        return;
      }

      if (!rafId) {
        rafId = requestAnimationFrame(renderFrame);
      }
    }

    function setFromProgress(progress) {
      queueRender(timeFromProgress(progress), false);
    }

    function getViewportProgress() {
      const rect = hero.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      if (total <= 0) return 0;
      return clamp01((window.innerHeight - rect.top) / total);
    }

    function requestNativeUpdate() {
      if (nativeTicking) return;
      nativeTicking = true;
      requestAnimationFrame(() => {
        setFromProgress(getViewportProgress());
        nativeTicking = false;
      });
    }

    function initNativeFallback() {
      addListener(window, "scroll", requestNativeUpdate, passiveOpts);
      addListener(window, "resize", requestNativeUpdate);
      requestNativeUpdate();
    }

    function initScrollTrigger() {
      if (!hasGSAP || prefersReduced.matches) {
        initNativeFallback();
        return;
      }

      const gsapLib = window.gsap;
      const scrollTrigger = window.ScrollTrigger;
      gsapLib.registerPlugin(scrollTrigger);

      trigger = scrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: isCoarsePointer ? 0.2 : 0.1,
        onUpdate(self) {
          setFromProgress(self.progress);
        }
      });

      scrollTrigger.refresh();
    }

    function initSmartPreload() {
      if (constrainedNetwork) {
        video.preload = "metadata";
        return;
      }

      if (!("IntersectionObserver" in window)) {
        video.preload = "auto";
        video.load();
        return;
      }

      preloadObserver = new IntersectionObserver(
        (entries) => {
          const entered = entries.some((entry) => entry.isIntersecting);
          if (!entered) return;

          video.preload = "auto";
          video.load();
          preloadObserver.disconnect();
          preloadObserver = null;
        },
        { rootMargin: "160% 0px" }
      );

      preloadObserver.observe(hero);
    }

    function primeVideoDecoder() {
      if (constrainedNetwork) return;

      const warmup = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              video.pause();
              writeTime(timeFromProgress(getViewportProgress()), true);
            })
            .catch(() => {
              writeTime(timeFromProgress(getViewportProgress()), true);
            });
        } else {
          writeTime(timeFromProgress(getViewportProgress()), true);
        }
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(warmup, { timeout: 650 });
      } else {
        setTimeout(warmup, 0);
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        return;
      }

      if (Math.abs(targetTime - renderedTime) >= writeThreshold) {
        queueRender(targetTime, false);
      }
    }

    function onReady() {
      if (metadataReady) return;
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) return;

      metadataReady = true;
      queueRender(timeFromProgress(getViewportProgress()), true);

      initScrollTrigger();
      if (!prefersReduced.matches) {
        primeVideoDecoder();
      }
    }

    pickVideoSource();
    initSmartPreload();

    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      onReady();
    } else {
      addListener(video, "loadedmetadata", onReady);
      addListener(video, "durationchange", onReady);
    }

    addListener(document, "visibilitychange", onVisibilityChange);
    addListener(window, "pagehide", () => {
      if (trigger) trigger.kill();
      if (preloadObserver) preloadObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      removeListeners.forEach((remove) => remove());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlassSatan, { once: true });
  } else {
    initGlassSatan();
  }
})();
