"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart, type Finish } from "@/components/CartProvider";
import { ArrowRight, BagIcon, CheckIcon } from "@/components/Icons";
import { METALS, type Metal } from "@/lib/design";
import { artUri, earringGeometry } from "@/lib/earringArt";
import { flyToCart, sparkleBurst } from "@/lib/effects";
import { formatPrice, getProduct, products } from "@/lib/products";
import { ILLUSTRATED_MODEL, PHOTO_MODEL, type SampleModel } from "@/lib/sampleModels";
import { drawEarring, earringLength, earsFromLandmarks, loadFaceLandmarker, Pendulum, type DrawSpec, type Ear } from "@/lib/tryon";
import styles from "./tryon.module.css";

type Source = "sample" | "camera" | "photo";
type Status = { kind: "idle" | "loading" | "tracking" | "searching" | "error"; text?: string };

const DEFAULT_SLUG = "pearl-drop-earrings";
const tryable = products.filter((p) => p.category !== "necklaces");

export default function TryOnClient() {
  const { add, showToast } = useCart();
  const [slug, setSlug] = useState(DEFAULT_SLUG);
  const [metal, setMetal] = useState<Metal>("gold");
  const [size, setSize] = useState(1);
  const [source, setSource] = useState<Source>("sample");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [query, setQuery] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [model, setModel] = useState<SampleModel>(PHOTO_MODEL);
  const modelRef = useRef<SampleModel>(PHOTO_MODEL);
  const [added, setAdded] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const specRef = useRef<DrawSpec | null>(null);
  const earsRef = useRef<Ear[] | null>(null);
  const sourceRef = useRef<Source>("sample");
  const pendulums = useRef([new Pendulum(), new Pendulum()]);
  const statusRef = useRef<Status["kind"]>("idle");
  /** Set once the face model has loaded (only when camera or photo mode is first used). */
  const lmRef = useRef<Awaited<ReturnType<typeof loadFaceLandmarker>> | null>(null);

  const product = getProduct(slug) ?? getProduct(DEFAULT_SLUG)!;

  const setStatusBoth = useCallback((s: Status) => {
    statusRef.current = s.kind;
    setStatus(s);
  }, []);

  // ?p=<slug>&metal=<gold|silver|rose> from the product page's "Try on" button.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("p");
    if (p && getProduct(p) && getProduct(p)!.category !== "necklaces") setSlug(p);
    const m = sp.get("metal");
    if (m && m in METALS) setMetal(m as Metal);
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `?p=${slug}&metal=${metal}`);
  }, [slug, metal]);

  // The earring artwork for the canvas: a single, transparent earring in the chosen metal.
  useEffect(() => {
    const img = new Image();
    img.src = artUri(product.design, { metal, single: true });
    const geo = earringGeometry(product.design.style);
    specRef.current = { img, style: product.design.style, ratio: geo.ratio, anchor: geo.anchor, size };
  }, [product, metal, size]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // ---------------------------------------------------------------------------
  // Sources
  // ---------------------------------------------------------------------------

  const showSample = useCallback(() => {
    stopCamera();
    sourceRef.current = "sample";
    setSource("sample");
    // Pre-measured ears show instantly; otherwise they're detected once the image loads.
    earsRef.current = modelRef.current.ears ?? null;
    setStatusBoth(modelRef.current.ears ? { kind: "idle" } : { kind: "loading", text: "Finding the model’s ears…" });
  }, [setStatusBoth]);

  const startCamera = async () => {
    stopCamera();
    earsRef.current = null;
    sourceRef.current = "camera";
    setSource("camera");
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusBoth({ kind: "error", text: "This browser can’t open a camera. Try uploading a photo instead." });
      return;
    }
    setStatusBoth({ kind: "loading", text: "Starting camera & loading the face model…" });
    try {
      const [stream, lm] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        }),
        loadFaceLandmarker(),
      ]);
      if (sourceRef.current !== "camera") {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      await lm.setOptions({ runningMode: "VIDEO" });
      lmRef.current = lm;
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatusBoth({ kind: "searching", text: "Looking for your face…" });
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setStatusBoth({
        kind: "error",
        text: denied
          ? "Camera permission was declined. You can still upload a photo or use our sample model."
          : "We couldn’t start the camera or load the face model. Check your connection and try again.",
      });
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    stopCamera();
    earsRef.current = null;
    sourceRef.current = "photo";
    setSource("photo");
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setStatusBoth({ kind: "loading", text: "Loading the face model…" });
  };

  // Detect faces in an uploaded photo (or a sample model without pre-measured ears) once it loads.
  const detectImage = async () => {
    const img = imgRef.current;
    if (!img) return;
    if (sourceRef.current === "photo") setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight });
    if (sourceRef.current !== "photo" && !(sourceRef.current === "sample" && !modelRef.current.ears)) return;
    try {
      const lm = await loadFaceLandmarker();
      await lm.setOptions({ runningMode: "IMAGE" });
      const res = lm.detect(img);
      const face = res.faceLandmarks[0];
      if (!face) {
        setStatusBoth({ kind: "error", text: "We couldn’t find a face in that photo. Try a front-facing photo with your ears visible." });
        return;
      }
      earsRef.current = earsFromLandmarks(face, img.naturalWidth, img.naturalHeight);
      setStatusBoth({ kind: "tracking", text: "Face found" });
    } catch {
      setStatusBoth({ kind: "error", text: "We couldn’t load the face model. Check your connection and try again." });
    }
  };

  useEffect(() => {
    showSample();
    return () => stopCamera();
  }, [showSample]);

  // ---------------------------------------------------------------------------
  // Render loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastVideoTime = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (now - last) / 1000;
      last = now;
      const canvas = canvasRef.current;
      const spec = specRef.current;
      if (!canvas || !spec) return;
      const src = sourceRef.current;

      let w = modelRef.current.w;
      let h = modelRef.current.h;
      if (src === "camera") {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        w = v.videoWidth;
        h = v.videoHeight;
        const lm = lmRef.current;
        if (lm && statusRef.current !== "loading" && statusRef.current !== "error" && v.currentTime !== lastVideoTime) {
          lastVideoTime = v.currentTime;
          try {
            const face = lm.detectForVideo(v, now).faceLandmarks[0];
            earsRef.current = face ? earsFromLandmarks(face, w, h) : null;
            const kind = face ? "tracking" : "searching";
            if (statusRef.current !== kind) setStatusBoth({ kind, text: face ? "Tracking" : "Looking for your face…" });
          } catch {
            /* the model is switching modes; try again next frame */
          }
        }
      } else if (src === "photo") {
        const img = imgRef.current;
        if (!img?.naturalWidth) return;
        w = img.naturalWidth;
        h = img.naturalHeight;
      }

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      const ears = earsRef.current;
      if (!ears) return;

      // A soft "breeze" keeps still images lively; live video swings from real movement.
      const breeze = src === "camera" ? 0 : Math.sin(now / 900) * 1.4;
      ears.forEach((ear, i) => {
        const swing = pendulums.current[i].step(ear.x, dt, earringLength(ear.faceH, spec.style, spec.size), breeze);
        drawEarring(ctx, ear, spec, swing);
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setStatusBoth]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const snapshot = () => {
    const overlay = canvasRef.current;
    if (!overlay?.width) return;
    const out = document.createElement("canvas");
    out.width = overlay.width;
    out.height = overlay.height;
    const ctx = out.getContext("2d")!;
    ctx.save();
    if (source === "camera") {
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current!, 0, 0, out.width, out.height);
    } else {
      ctx.drawImage(imgRef.current!, 0, 0, out.width, out.height);
    }
    ctx.drawImage(overlay, 0, 0);
    ctx.restore();
    ctx.font = `700 ${Math.round(out.width / 28)}px Fredoka, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.textAlign = "right";
    ctx.fillText("Lumi Lobes ♥", out.width - out.width / 30, out.height - out.width / 30);
    const a = document.createElement("a");
    a.download = `lumi-lobes-${product.slug}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
    sparkleBurst(stageRef.current, 16);
  };

  const onAdd = async () => {
    if (added) return;
    setAdded(true);
    await flyToCart(stageRef.current, artUri(product.design, { metal }));
    add(product.slug, 1, metal as Finish);
    showToast(`${product.name} (${METALS[metal].label}) added`);
    setTimeout(() => setAdded(false), 1600);
  };

  const picks = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = terms.length
      ? tryable.filter((p) => terms.every((t) => `${p.name} ${p.category} ${p.mood}`.toLowerCase().includes(t)))
      : [...tryable].sort((a, b) => a.trending - b.trending);
    return list.slice(0, 36);
  }, [query]);

  const mirrored = source === "camera";

  // If the model photo can't load, fall back to the illustration.
  const onSampleError = () => {
    if (modelRef.current === ILLUSTRATED_MODEL) return;
    modelRef.current = ILLUSTRATED_MODEL;
    setModel(ILLUSTRATED_MODEL);
    earsRef.current = ILLUSTRATED_MODEL.ears!;
  };

  // Match the stage to the picture's shape (the camera uses a fixed 4:3 stage).
  const dims = source === "sample" ? model : source === "photo" ? photoDims : null;
  const stageStyle = dims
    ? { aspectRatio: `${dims.w} / ${dims.h}`, maxWidth: `calc(72vh * ${(dims.w / dims.h).toFixed(4)})` }
    : undefined;

  return (
    <div className={`container page-enter ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          Virtual Try-On <span aria-hidden>✦</span>
        </h1>
        <p className={styles.subtitle}>
          See any of our {tryable.length.toLocaleString("en-US")} designs on you, live. Face tracking runs entirely in your browser: your
          camera and photos never leave your device.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.stageCol}>
          <div className={styles.modes} role="tablist" aria-label="Try-on source">
            <button role="tab" aria-selected={source === "sample"} className={source === "sample" ? styles.modeOn : ""} onClick={showSample}>
              Sample model
            </button>
            <button role="tab" aria-selected={source === "camera"} className={source === "camera" ? styles.modeOn : ""} onClick={startCamera}>
              Live camera
            </button>
            <label role="tab" aria-selected={source === "photo"} className={source === "photo" ? styles.modeOn : ""}>
              Upload photo
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </div>

          <div ref={stageRef} className={`${styles.stage} ${source === "camera" ? styles.stageCamera : ""}`} style={stageStyle}>
            {/* eslint-disable @next/next/no-img-element */}
            {source === "sample" && (
              <img
                ref={imgRef}
                key={model.src}
                src={model.src}
                alt={model.alt}
                className={styles.media}
                onLoad={detectImage}
                onError={onSampleError}
              />
            )}
            {source === "photo" && photoUrl && (
              <img ref={imgRef} src={photoUrl} alt="Your photo" className={styles.media} onLoad={detectImage} />
            )}
            {/* eslint-enable @next/next/no-img-element */}
            <video
              ref={videoRef}
              className={`${styles.media} ${mirrored ? styles.mirror : ""}`}
              hidden={source !== "camera"}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className={`${styles.media} ${styles.overlay} ${mirrored ? styles.mirror : ""}`} />

            {status.kind !== "idle" && (
              <div className={`${styles.status} ${styles[status.kind]}`} role="status">
                {(status.kind === "loading" || status.kind === "searching") && <span className={styles.spinner} aria-hidden />}
                {status.kind === "tracking" && <span className={styles.liveDot} aria-hidden />}
                {status.text}
              </div>
            )}
            {status.kind === "error" && (
              <div className={styles.errorActions}>
                <button className={styles.ghostBtn} onClick={showSample}>
                  Use sample model
                </button>
              </div>
            )}

            <button className={styles.snap} onClick={snapshot} aria-label="Save a snapshot">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>
          </div>

          {source === "sample" && model.credit && <p className={styles.credit}>{model.credit}</p>}

          <div className={styles.controls}>
            <label className={styles.slider}>
              <span>Size</span>
              <input type="range" min={0.6} max={1.6} step={0.05} value={size} onChange={(e) => setSize(+e.target.value)} />
            </label>
            <div className={styles.metals} role="radiogroup" aria-label="Metal finish">
              {(Object.keys(METALS) as Metal[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={metal === m}
                  className={`${styles.metal} ${styles[m]} ${metal === m ? styles.metalOn : ""}`}
                  onClick={() => setMetal(m)}
                  title={METALS[m].label}
                  aria-label={METALS[m].label}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.panel}>
          <div className={`${styles.current} tone-${product.tone}`} key={product.slug}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artUri(product.design, { metal })} alt="" />
            <div>
              <p className={styles.currentName}>{product.name}</p>
              <p className={styles.currentPrice}>{formatPrice(product.price)}</p>
              <Link href={`/product/${product.slug}/`} className={styles.details}>
                View details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <button className={`btn btn-block ${styles.addBtn} ${added ? styles.addDone : ""}`} onClick={onAdd}>
            {added ? (
              <>
                <CheckIcon size={24} /> Added!
              </>
            ) : (
              <>
                <BagIcon size={24} /> Add to Cart
              </>
            )}
          </button>

          <label className={styles.search}>
            <span className="sr-only">Find earrings to try</span>
            <input
              type="search"
              placeholder="Try something else: “lilac hoops”…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <ul className={styles.picks}>
            {picks.map((p) => (
              <li key={p.slug}>
                <button
                  className={`${styles.pick} tone-${p.tone} ${p.slug === product.slug ? styles.pickOn : ""}`}
                  onClick={() => setSlug(p.slug)}
                  title={p.name}
                  aria-label={`Try ${p.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artUri(p.design)} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
