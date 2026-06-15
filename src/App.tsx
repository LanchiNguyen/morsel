// Morsel — app shell: navigation, saves, tab bar, persistence, device mount.
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { IOSDevice } from "./components/IOSDevice";
import { Icon } from "./components/Icon";
import { photo, DEFAULT_COLLECTIONS, byId } from "./data";
import { FILTER_DEFAULTS } from "./lib/filters";
import { CollectionScreen } from "./screens/Collection";
import { DetailScreen, type ZoomState } from "./screens/Detail";
import { FeedScreen } from "./screens/Feed";
import { Onboarding } from "./screens/Onboarding";
import { ProfileScreen } from "./screens/Profile";
import { RestaurantScreen } from "./screens/Restaurant";
import { SavedScreen } from "./screens/Saved";
import { SearchScreen } from "./screens/Search";
import { AuthSheet } from "./sheets/AuthSheet";
import { FiltersSheet } from "./sheets/FiltersSheet";
import { LocationSheet } from "./sheets/LocationSheet";
import { SaveSheet } from "./sheets/SaveSheet";
import { useAuth, signOut } from "./lib/auth";
import { addCloudSave, removeCloudSave, fetchCloudSaves, mergeLocalSaves } from "./lib/cloudSaves";
import type { Collection, Dish, Filters, Loc, Prefs, Screen, Tab } from "./types";

const GRID_COLS = 2;
const STATE_KEY = "morsel_state_v2";

interface PersistedState {
  screen?: Screen;
  dishId?: string | null;
  tab?: Tab;
  saved?: string[];
  collections?: Collection[];
  prefs?: Prefs | null;
  colId?: string | null;
  restName?: string | null;
  returnTo?: Screen;
  filters?: Filters;
  loc?: Loc | null;
}

function loadState(): PersistedState {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function MorselApp() {
  const init = useMemo(loadState, []);
  const [screen, setScreen] = useState<Screen>(init.screen || "onboarding");
  const [dishId, setDishId] = useState<string | null>(init.dishId || null);
  const [collections, setCollections] = useState<Collection[]>(() => init.collections || DEFAULT_COLLECTIONS);
  // `saved` is the master set: anything filed in a collection is, by definition, saved.
  const [saved, setSaved] = useState<Set<string>>(() => {
    const base = new Set(init.saved || ["d08", "d01"]);
    (init.collections || DEFAULT_COLLECTIONS).forEach((c) => c.dishes.forEach((id) => base.add(id)));
    return base;
  });
  const [sheetDishId, setSheetDishId] = useState<string | null>(null);
  const [saveToastId, setSaveToastId] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);
  const [tab, setTab] = useState<Tab>(init.tab || "feed");
  const [prefs, setPrefs] = useState<Prefs | null>(init.prefs || null);
  const [colId, setColId] = useState<string | null>(init.colId || null);
  const [restName, setRestName] = useState<string | null>(init.restName || null);
  const [returnTo, setReturnTo] = useState<Screen>(init.returnTo || "feed");
  const [filters, setFilters] = useState<Filters>(init.filters || FILTER_DEFAULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loc, setLoc] = useState<Loc | null>(init.loc && typeof init.loc === "object" ? init.loc : null);
  const [locOpen, setLocOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const auth = useAuth();
  const appRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const zoomTimer = useRef<number>(0);

  // After entrance animations finish, neutralize them so a later re-render or a
  // print/screenshot shows the settled state rather than frame 0.
  useEffect(() => {
    const onEnd = (e: AnimationEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && e.animationName && e.animationName.indexOf("m-") === 0) el.style.animation = "none";
    };
    document.addEventListener("animationend", onEnd);
    return () => document.removeEventListener("animationend", onEnd);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ screen, dishId, tab, saved: [...saved], collections, prefs, colId, restName, returnTo, filters, loc }),
    );
  }, [screen, dishId, tab, saved, collections, prefs, colId, restName, returnTo, filters, loc]);

  // On sign-in, merge this device's saves up to the account, then adopt the
  // cloud set as the master (re-adding collection dishes to keep the invariant
  // that every filed dish is also saved). Signed out, saves stay local.
  const syncedUser = useRef<string | null>(null);
  useEffect(() => {
    if (!auth.enabled) return;
    const u = auth.user?.id ?? null;
    if (u === syncedUser.current) return;
    syncedUser.current = u;
    if (!u) return;
    (async () => {
      try {
        const local = new Set(saved);
        collections.forEach((c) => c.dishes.forEach((id) => local.add(id)));
        await mergeLocalSaves([...local]);
        const cloud = await fetchCloudSaves();
        setSaved(() => {
          const next = new Set(cloud);
          collections.forEach((c) => c.dishes.forEach((id) => next.add(id)));
          return next;
        });
      } catch (e) {
        console.warn("[morsel] saves sync failed:", e);
      }
    })();
    // saved/collections read once at sign-in time, deliberately not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.enabled, auth.user]);

  // Mirror a single save change to the cloud when signed in (no-op otherwise).
  const syncSave = (id: string, add: boolean) => {
    if (!auth.enabled || !auth.user) return;
    (add ? addCloudSave(id) : removeCloudSave(id)).catch((e) => console.warn("[morsel] save sync failed:", e));
  };

  const dish = byId(dishId);
  const col = collections.find((c) => c.id === colId);

  const openDish = (d: Dish, e?: MouseEvent<HTMLElement>) => {
    if (screen !== "detail") setReturnTo(screen);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (e && e.currentTarget && appRef.current && !reduce) {
      const c = appRef.current.getBoundingClientRect();
      const r = e.currentTarget.getBoundingClientRect();
      const sc = c.width / appRef.current.offsetWidth || 1;
      setZoom({
        src: photo(d.img, 520),
        from: { x: (r.left - c.left) / sc, y: (r.top - c.top) / sc, w: r.width / sc, h: r.height / sc },
        key: Date.now(),
      });
      window.clearTimeout(zoomTimer.current);
      zoomTimer.current = window.setTimeout(() => setZoom(null), 620);
    }
    setDishId(d.id);
    setScreen("detail");
  };

  const toggleSave = (id: string) => {
    if (saved.has(id)) {
      setSaved((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setCollections((cs) => cs.map((c) => ({ ...c, dishes: c.dishes.filter((x) => x !== id) })));
      syncSave(id, false);
    } else {
      setSaved((s) => new Set(s).add(id));
      syncSave(id, true);
      setSaveToastId(id);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setSaveToastId(null), 3500);
    }
  };

  const toggleInCollection = (targetCol: string) => {
    if (!sheetDishId) return;
    setCollections((cs) =>
      cs.map((c) => {
        if (c.id !== targetCol) return c;
        const has = c.dishes.includes(sheetDishId);
        return { ...c, dishes: has ? c.dishes.filter((x) => x !== sheetDishId) : [...c.dishes, sheetDishId] };
      }),
    );
    setSaved((s) => new Set(s).add(sheetDishId));
    syncSave(sheetDishId, true);
  };

  const createCollection = (name: string) => {
    if (!sheetDishId) return;
    setCollections((cs) => [...cs, { id: "c" + Date.now(), name, dishes: [sheetDishId] }]);
    setSaved((s) => new Set(s).add(sheetDishId));
    syncSave(sheetDishId, true);
  };

  const goTab = (k: Tab) => {
    setTab(k);
    setScreen(k);
  };

  const showTabs = screen === "feed" || screen === "saved" || screen === "profile";
  const statusDark = screen === "feed" || screen === "detail" || screen === "restaurant" || screen === "onboarding";

  let content = null;
  if (screen === "onboarding") {
    content = (
      <Onboarding
        onComplete={(p) => {
          setPrefs(p);
          setScreen("feed");
          setTab("feed");
        }}
      />
    );
  } else if (screen === "detail" && dish) {
    content = (
      <DetailScreen
        dish={dish}
        saved={saved}
        zoom={zoom}
        onBack={() => setScreen(returnTo === "detail" ? tab : returnTo)}
        onToggleSave={toggleSave}
        onOpen={openDish}
        onOpenRest={(name) => {
          setRestName(name);
          setScreen("restaurant");
        }}
      />
    );
  } else if (screen === "restaurant" && restName) {
    content = <RestaurantScreen restName={restName} onBack={() => setScreen(dish ? "detail" : "feed")} onOpen={openDish} />;
  } else if (screen === "search") {
    content = <SearchScreen onBack={() => setScreen("feed")} onOpen={openDish} gridCols={GRID_COLS} />;
  } else if (screen === "collection" && col) {
    content = <CollectionScreen col={col} onBack={() => setScreen("saved")} onOpen={openDish} />;
  } else if (screen === "saved") {
    content = (
      <SavedScreen
        saved={saved}
        collections={collections}
        onOpen={openDish}
        onOpenCol={(c) => {
          setColId(c.id);
          setScreen("collection");
        }}
      />
    );
  } else if (screen === "profile") {
    content = <ProfileScreen prefs={prefs} saved={saved} collections={collections} onRecalibrate={() => setScreen("onboarding")} onOpenSaved={() => goTab("saved")} auth={auth} onSignIn={() => setAuthOpen(true)} onSignOut={signOut} />;
  } else {
    content = (
      <FeedScreen
        saved={saved}
        onOpen={openDish}
        onToggleSave={toggleSave}
        gridCols={GRID_COLS}
        onSearch={() => setScreen("search")}
        filters={filters}
        onFilters={() => setFiltersOpen(true)}
        onClearFilters={() => setFilters(FILTER_DEFAULTS)}
        loc={loc}
        onLocation={() => setLocOpen(true)}
      />
    );
  }

  const toastDish = saveToastId ? byId(saveToastId) : null;

  return (
    <IOSDevice dark={statusDark}>
      <div className="morsel-app" ref={appRef}>
        {content}
        {toastDish && !sheetDishId && (
          <div
            className="m-rise"
            style={{ position: "absolute", left: 14, right: 14, bottom: 92, zIndex: 50, display: "flex", alignItems: "center", gap: 10, background: "var(--ink)", color: "var(--paper)", borderRadius: 18, padding: "10px 12px", boxShadow: "var(--shadow-float)" }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, overflow: "hidden", flex: "none" }}>
              <img src={photo(toastDish.img, 120)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Saved</div>
            <button
              onClick={() => {
                setSheetDishId(saveToastId);
                setSaveToastId(null);
                window.clearTimeout(toastTimer.current);
              }}
              style={{ flex: "none", fontSize: 13, fontWeight: 800, color: "var(--paper)", background: "rgba(255,255,255,.14)", borderRadius: 99, padding: "9px 14px", minHeight: 36 }}
            >
              Add to collection
            </button>
          </div>
        )}
        {authOpen && <AuthSheet onClose={() => setAuthOpen(false)} />}
        {locOpen && <LocationSheet loc={loc} onChange={setLoc} onClose={() => setLocOpen(false)} />}
        {filtersOpen && <FiltersSheet filters={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />}
        {sheetDishId && byId(sheetDishId) && (
          <SaveSheet dish={byId(sheetDishId)!} collections={collections} onToggle={toggleInCollection} onCreate={createCollection} onClose={() => setSheetDishId(null)} />
        )}
        {showTabs && (
          <div className="m-tabbar">
            <button className="m-tab" data-active={tab === "feed"} aria-label="Feed" onClick={() => goTab("feed")}>
              <Icon name="grid" size={21} />
            </button>
            <button className="m-tab" data-active={tab === "saved"} aria-label="Saved" onClick={() => goTab("saved")}>
              <Icon name="heart" size={21} />
            </button>
            <button className="m-tab" data-active={tab === "profile"} aria-label="Profile" onClick={() => goTab("profile")}>
              <Icon name="user" size={21} />
            </button>
          </div>
        )}
      </div>
    </IOSDevice>
  );
}

// Page mount: phone centered + scaled to fit the viewport.
export default function MorselPage() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 70) / 900));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="morsel-page">
      <div style={{ width: 402 * scale, height: 874 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <MorselApp />
        </div>
      </div>
      <div className="morsel-page-credit">
        <b>Morsel</b>
        <span>photo-first food discovery</span>
        <a href="./web.html" style={{ color: "#B0542F", fontWeight: 600 }}>
          web version →
        </a>
      </div>
    </div>
  );
}
